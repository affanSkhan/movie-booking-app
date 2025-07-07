import { pool } from "../index";
import { io } from "../index";

interface SeatLockData {
  seatId: number;
  seatNumber: string;
  showId: string;
  userId: number;
  socketId: string;
}

interface UserSeatMapping {
  [socketId: string]: {
    [showId: string]: string[]; // seatNumbers
  };
}

class SeatLockingService {
  private userSeatMapping: UserSeatMapping = {};
  private lockTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private readonly LOCK_DURATION = 3 * 60 * 1000; // 3 minutes in milliseconds

  constructor() {
    // Start periodic cleanup of expired locks
    setInterval(() => {
      this.cleanupExpiredLocks();
    }, 30000); // Check every 30 seconds
  }

  /**
   * Lock a seat for a user
   */
  async lockSeat(
    data: SeatLockData,
  ): Promise<{ success: boolean; message: string; seat?: any }> {
    const { seatId, seatNumber, showId, userId, socketId } = data;

    console.log(
      `Attempting to lock seat ${seatNumber} for user ${userId} in show ${showId}`,
    );

    try {
      // Use database transaction to prevent race conditions
      const client = await pool.connect();

      try {
        await client.query("BEGIN");

        // Check if seat is available and not locked by someone else
        const seatCheck = await client.query(
          `SELECT * FROM seats 
           WHERE id = $1 AND show_id = $2 
           AND (status = 'available' OR (status = 'locked' AND locked_by = $3))`,
          [seatId, showId, userId],
        );

        if (seatCheck.rows.length === 0) {
          await client.query("ROLLBACK");
          return {
            success: false,
            message: "Seat is not available or already locked by another user",
          };
        }

        const seat = seatCheck.rows[0];

        // If seat is already locked by this user, extend the lock
        if (seat.status === "locked" && seat.locked_by === userId) {
          const lockExpiresAt = new Date(Date.now() + this.LOCK_DURATION);

          await client.query(
            `UPDATE seats 
             SET lock_expires_at = $1 
             WHERE id = $2`,
            [lockExpiresAt, seatId],
          );

          // Extend timeout
          this.extendLockTimeout(seatNumber, showId, userId);

          await client.query("COMMIT");

          console.log(
            `⏰ Extended lock for seat ${seatNumber} by user ${userId}`,
          );
          return { success: true, message: "Lock extended", seat };
        }

        // Lock the seat
        const lockExpiresAt = new Date(Date.now() + this.LOCK_DURATION);

        const result = await client.query(
          `UPDATE seats 
           SET status = 'locked', 
               locked_by = $1, 
               locked_at = NOW(), 
               lock_expires_at = $2 
           WHERE id = $3 AND status = 'available' 
           RETURNING *`,
          [userId, lockExpiresAt, seatId],
        );

        if (result.rows.length === 0) {
          await client.query("ROLLBACK");
          return {
            success: false,
            message: "Seat is no longer available",
          };
        }

        // Track the lock
        this.trackUserSeat(socketId, showId, seatNumber);

        // Set timeout to auto-unlock
        this.setLockTimeout(seatNumber, showId, userId);

        await client.query("COMMIT");

        const lockedSeat = result.rows[0];
        console.log(
          `Successfully locked seat ${seatNumber} for user ${userId}`,
        );

        // Broadcast to all users in the show room
        io.to(`show-${showId}`).emit("seat-updated", {
          seatNumber,
          status: "locked",
          userId,
          lockExpiresAt: lockedSeat.lock_expires_at,
        });

        return {
          success: true,
          message: "Seat locked successfully",
          seat: lockedSeat,
        };
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("❌ Error locking seat:", error);
      return { success: false, message: "Failed to lock seat" };
    }
  }

  /**
   * Unlock a seat
   */
  async unlockSeat(
    seatNumber: string,
    showId: string,
    userId: number,
    socketId: string,
  ): Promise<{ success: boolean; message: string }> {
    console.log(
      `🔓 Attempting to unlock seat ${seatNumber} for user ${userId}`,
    );

    try {
      const result = await pool.query(
        `UPDATE seats 
         SET status = 'available', 
             locked_by = NULL, 
             locked_at = NULL, 
             lock_expires_at = NULL 
         WHERE seat_number = $1 AND show_id = $2 AND locked_by = $3 
         RETURNING *`,
        [seatNumber, showId, userId],
      );

      if (result.rows.length === 0) {
        return {
          success: false,
          message: "Seat not found or not locked by you",
        };
      }

      // Remove from tracking
      this.untrackUserSeat(socketId, showId, seatNumber);

      // Clear timeout
      this.clearLockTimeout(seatNumber, showId, userId);

      console.log(
        `Successfully unlocked seat ${seatNumber} for user ${userId}`,
      );

      // Broadcast to all users in the show room
      io.to(`show-${showId}`).emit("seat-updated", {
        seatNumber,
        status: "available",
        userId: null,
      });

      return { success: true, message: "Seat unlocked successfully" };
    } catch (error) {
      console.error("❌ Error unlocking seat:", error);
      return { success: false, message: "Failed to unlock seat" };
    }
  }

  /**
   * Handle user disconnection - unlock all their seats
   */
  async handleUserDisconnect(socketId: string): Promise<void> {
    console.log(`User disconnected: ${socketId}`);

    const userSeats = this.userSeatMapping[socketId];
    if (!userSeats) return;

    for (const [showId, seatNumbers] of Object.entries(userSeats)) {
      for (const seatNumber of seatNumbers) {
        try {
          // Get user ID from the seat
          const seatResult = await pool.query(
            "SELECT locked_by FROM seats WHERE seat_number = $1 AND show_id = $2",
            [seatNumber, showId],
          );

          if (seatResult.rows.length > 0) {
            const userId = seatResult.rows[0].locked_by;
            await this.unlockSeat(seatNumber, showId, userId, socketId);
          }
        } catch (error) {
          console.error(
            `Error unlocking seat ${seatNumber} on disconnect:`,
            error,
          );
        }
      }
    }

    // Clean up tracking
    delete this.userSeatMapping[socketId];
  }

  /**
   * Cleanup expired locks from database
   */
  async cleanupExpiredLocks(): Promise<void> {
    try {
      const result = await pool.query(
        `UPDATE seats 
         SET status = 'available', 
             locked_by = NULL, 
             locked_at = NULL, 
             lock_expires_at = NULL 
         WHERE status = 'locked' AND lock_expires_at < NOW() 
         RETURNING *`,
      );

      if (result.rows.length > 0) {
        console.log(`🧹 Cleaned up ${result.rows.length} expired locks`);

        // Broadcast updates for each affected show
        const affectedShows = new Map<string, string[]>();

        for (const seat of result.rows) {
          if (!affectedShows.has(seat.show_id.toString())) {
            affectedShows.set(seat.show_id.toString(), []);
          }
          affectedShows.get(seat.show_id.toString())!.push(seat.seat_number);
        }

        // Broadcast to each show room
        for (const [showId, seatNumbers] of affectedShows) {
          for (const seatNumber of seatNumbers) {
            io.to(`show-${showId}`).emit("seat-updated", {
              seatNumber,
              status: "available",
              userId: null,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error cleaning up expired locks:", error);
    }
  }

  /**
   * Book seats (convert locks to booked status)
   */
  async bookSeats(
    seatNumbers: string[],
    showId: string,
    userId: number,
  ): Promise<{ success: boolean; message: string }> {
    console.log(
      `🎫 Booking seats ${seatNumbers.join(", ")} for user ${userId}`,
    );

    try {
      const client = await pool.connect();

      try {
        await client.query("BEGIN");

        // Check if all seats are locked by this user
        const seatCheck = await client.query(
          `SELECT * FROM seats 
           WHERE seat_number = ANY($1) AND show_id = $2 AND locked_by = $3 AND status = 'locked'`,
          [seatNumbers, showId, userId],
        );

        if (seatCheck.rows.length !== seatNumbers.length) {
          await client.query("ROLLBACK");
          return {
            success: false,
            message: "Some seats are not locked by you",
          };
        }

        // Convert locks to booked
        await client.query(
          `UPDATE seats 
           SET status = 'booked', 
               locked_by = NULL, 
               locked_at = NULL, 
               lock_expires_at = NULL 
           WHERE seat_number = ANY($1) AND show_id = $2 AND locked_by = $3`,
          [seatNumbers, showId, userId],
        );

        await client.query("COMMIT");

        console.log(
          `✅ Successfully booked seats ${seatNumbers.join(", ")} for user ${userId}`,
        );

        // Broadcast to all users in the show room
        for (const seatNumber of seatNumbers) {
          io.to(`show-${showId}`).emit("seat-updated", {
            seatNumber,
            status: "booked",
            userId: null,
          });
        }

        return { success: true, message: "Seats booked successfully" };
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("❌ Error booking seats:", error);
      return { success: false, message: "Failed to book seats" };
    }
  }

  /**
   * Unlock seats after failed payment
   */
  public async unlockSeatsAfterFailedPayment(
    seatNumbers: string[],
    showId: string,
    userId: number,
  ): Promise<void> {
    console.log(
      `💳 Unlocking seats after failed payment: ${seatNumbers.join(", ")}`,
    );

    try {
      await pool.query(
        `UPDATE seats 
         SET status = 'available', 
             locked_by = NULL, 
             locked_at = NULL, 
             lock_expires_at = NULL 
         WHERE seat_number = ANY($1) AND show_id = $2 AND locked_by = $3`,
        [seatNumbers, showId, userId],
      );

      // Broadcast to all users in the show room
      for (const seatNumber of seatNumbers) {
        io.to(`show-${showId}`).emit("seat-updated", {
          seatNumber,
          status: "available",
          userId: null,
        });
      }

      console.log(`✅ Successfully unlocked seats after failed payment`);
    } catch (error) {
      console.error("❌ Error unlocking seats after failed payment:", error);
    }
  }

  // Private helper methods
  private trackUserSeat(
    socketId: string,
    showId: string,
    seatNumber: string,
  ): void {
    if (!this.userSeatMapping[socketId]) {
      this.userSeatMapping[socketId] = {};
    }
    if (!this.userSeatMapping[socketId][showId]) {
      this.userSeatMapping[socketId][showId] = [];
    }
    this.userSeatMapping[socketId][showId].push(seatNumber);
  }

  private untrackUserSeat(
    socketId: string,
    showId: string,
    seatNumber: string,
  ): void {
    if (this.userSeatMapping[socketId]?.[showId]) {
      this.userSeatMapping[socketId][showId] = this.userSeatMapping[socketId][
        showId
      ].filter((seat) => seat !== seatNumber);

      if (this.userSeatMapping[socketId][showId].length === 0) {
        delete this.userSeatMapping[socketId][showId];
      }

      if (Object.keys(this.userSeatMapping[socketId]).length === 0) {
        delete this.userSeatMapping[socketId];
      }
    }
  }

  private setLockTimeout(
    seatNumber: string,
    showId: string,
    userId: number,
  ): void {
    const timeoutKey = `${seatNumber}-${showId}-${userId}`;

    // Clear existing timeout if any
    this.clearLockTimeout(seatNumber, showId, userId);

    // Set new timeout
    const timeout = setTimeout(async () => {
      console.log(`⏰ Auto-unlocking seat ${seatNumber} for user ${userId}`);
      await this.unlockSeat(seatNumber, showId, userId, "timeout");
    }, this.LOCK_DURATION);

    this.lockTimeouts.set(timeoutKey, timeout);
  }

  private extendLockTimeout(
    seatNumber: string,
    showId: string,
    userId: number,
  ): void {
    this.setLockTimeout(seatNumber, showId, userId);
  }

  private clearLockTimeout(
    seatNumber: string,
    showId: string,
    userId: number,
  ): void {
    const timeoutKey = `${seatNumber}-${showId}-${userId}`;
    const timeout = this.lockTimeouts.get(timeoutKey);
    if (timeout) {
      clearTimeout(timeout);
      this.lockTimeouts.delete(timeoutKey);
    }
  }

  /**
   * Get all seats locked by a user
   */
  getSeatsLockedByUser(socketId: string): { [showId: string]: string[] } {
    return this.userSeatMapping[socketId] || {};
  }
}

export const seatLockingService = new SeatLockingService();

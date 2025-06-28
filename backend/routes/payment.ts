import express from "express";
import type { Request, Response } from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import { createRazorpayOrder, verifyPayment } from "../utils/razorpayClient";
import { createError, asyncHandler } from "../utils/handleErrors";

const router = express.Router();

// Initialize payment (creates Razorpay order)
router.post(
  "/initialize",
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const { amount, selectedSeats, showId } = req.body;

    if (!amount || amount <= 0) {
      throw createError("Invalid amount", 400);
    }

    if (
      !selectedSeats ||
      !Array.isArray(selectedSeats) ||
      selectedSeats.length === 0
    ) {
      throw createError("Invalid selected seats", 400);
    }

    if (!showId) {
      throw createError("Show ID is required", 400);
    }

    // Check if Razorpay is configured
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    if (!razorpayKeyId || razorpayKeyId === "rzp_test_your_test_key_id") {
      throw createError(
        "Payment gateway not configured. Please set up Razorpay keys.",
        500,
      );
    }

    try {
      console.log("💳 Initializing payment:", {
        amount,
        selectedSeats,
        showId,
      });

      // Create Razorpay order
      const order = await createRazorpayOrder(amount, "INR");

      console.log("✅ Order created successfully:", order.id);

      // Return the order details needed for Razorpay checkout
      res.status(200).json({
        orderId: order.id,
        key: razorpayKeyId,
        amount: order.amount,
        currency: order.currency,
      });
    } catch (error) {
      console.error("❌ Failed to initialize payment:", error);
      throw createError("Failed to initialize payment", 500);
    }
  }),
);

// Create Razorpay order
router.post(
  "/create-order",
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const { amount, currency = "INR" } = req.body;

    if (!amount || amount <= 0) {
      throw createError("Invalid amount", 400);
    }

    try {
      console.log("Creating order for amount:", amount);

      const order = await createRazorpayOrder(amount, currency);

      console.log("Order created successfully:", order.id);

      res.status(200).json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      });
    } catch (error) {
      console.error("Failed to create order:", error);
      throw createError("Failed to create payment order", 500);
    }
  }),
);

// Verify payment
router.post(
  "/verify",
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const { paymentId, orderId, signature } = req.body;

    if (!paymentId || !orderId || !signature) {
      throw createError("Missing payment verification parameters", 400);
    }

    try {
      const isValid = await verifyPayment(paymentId, orderId, signature);

      if (isValid) {
        res.json({ verified: true, message: "Payment verified successfully" });
      } else {
        throw createError("Payment verification failed", 400);
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      throw createError("Payment verification failed", 500);
    }
  }),
);

export default router;

@echo off
echo Resetting admin password hash...
set PGPASSWORD=8d9a6594e6fc4135ae527daf7b2b9196
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d movie_booking_db -f reset_admin_password.sql
echo Admin password reset completed!
pause 
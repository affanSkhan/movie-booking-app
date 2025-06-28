@echo off
echo Checking admin user details...
set PGPASSWORD=8d9a6594e6fc4135ae527daf7b2b9196
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d movie_booking_db -f check_admin_user.sql
pause 
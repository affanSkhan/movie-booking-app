@echo off
echo Fixing database schema for seat locking...
echo.
echo Running database migration...
node updateDatabase.js
echo.
echo Database migration completed!
pause 
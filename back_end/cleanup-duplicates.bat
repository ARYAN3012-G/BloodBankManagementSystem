@echo off
echo ========================================
echo  Duplicate Donor Cleanup Script
echo ========================================
echo.
echo This will remove duplicate donor entries
echo from your MongoDB database.
echo.
echo Press Ctrl+C to cancel, or
pause
echo.
echo Running cleanup...
echo.
node cleanup-duplicates.js
echo.
pause

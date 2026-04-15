@echo off
color 0F
echo.
echo ========================================================================
ver
date /t
time /t
rem systeminfo
echo.
echo ========================================================================
echo.
echo Node.js Version:
call node --version
echo.
call node unittest.node.js
echo.
echo ========================================================================
echo.
pause
echo.
echo Deno Version:
call deno --version
echo.
call deno unittest.node.js
echo.
echo ========================================================================
echo.
pause
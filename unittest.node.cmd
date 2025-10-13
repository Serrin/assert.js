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
node --version
echo.
node unittest.node.js
echo.
echo ========================================================================
echo.
pause
echo.
echo Deno Version:
deno --version
echo.
deno unittest.node.js
echo.
echo ========================================================================
echo.
pause
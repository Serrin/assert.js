@echo off
echo.
date /t
time /t
ver
echo.
echo TypeScript compiler
call tsc --version
echo.
echo tsc assert.ts --strict --declaration --declarationMap --allowJs --checkJs --pretty --ignoreConfig --diagnostics --removeComments --target ESNEXT --lib ESNEXT,DOM,DOM.iterable,DOM.asynciterable,ESNext.Iterator,webworker.importscripts
echo.
call tsc assert.ts --strict --declaration --declarationMap --allowJs --checkJs --pretty --ignoreConfig --diagnostics --removeComments --target ESNEXT --lib ESNEXT,DOM,DOM.iterable,DOM.asynciterable,ESNext.Iterator,webworker.importscripts
echo.
pause

rem from https://www.typescriptlang.org/tsconfig/
rem es2015, es2016, es2017, es2018, es2019, es2020, es2021, es2022, es2023, 
rem es2024, es2025 (default), esnext
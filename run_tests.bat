@echo off
echo Running GigGatek Integration Tests
echo ==================================
echo.

REM Make sure the tests directory exists
if not exist tests (
    echo Error: tests directory not found!
    exit /b 1
)

REM Run the PHP test runner
php tests/run_integration_tests.php

REM Check the exit code
if %ERRORLEVEL% EQU 0 (
    echo.
    echo All tests passed successfully!
    exit /b 0
) else (
    echo.
    echo Some tests failed. Please check the output above for details.
    exit /b 1
)

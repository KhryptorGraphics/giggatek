@echo off
rem GigGatek Integration Testing Environment Setup
rem This script automates the setup of the integration testing environment on Windows

echo =========================================================
echo    GigGatek Integration Testing Environment Setup
echo =========================================================

rem Check for required tools
echo.
echo Checking required tools...

where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Python is required but not installed. Aborting.
    exit /b 1
)

where pip >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo pip is required but not installed. Aborting.
    exit /b 1
)

where mysql >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo MySQL client is required but not installed. Aborting.
    exit /b 1
)

where docker >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Docker is not installed. MailHog will need to be installed manually.
) else (
    echo All required tools are available.
)

rem Setup test environment configuration
echo.
echo Setting up test environment configuration...

rem Check if .env.example exists
if not exist .env.example (
    echo .env.example file not found. Please run this script from the project root directory.
    exit /b 1
)

rem Create .env.test if it doesn't exist
if not exist .env.test (
    copy .env.example .env.test
    echo Created .env.test from .env.example
) else (
    echo .env.test already exists. Skipping creation.
)

rem Update test environment variables
echo.
echo Configuring test environment variables...

rem Database configuration
set /p DB_HOST=Enter test database host [localhost]: 
if "%DB_HOST%"=="" set DB_HOST=localhost

set /p DB_USER=Enter test database user [root]: 
if "%DB_USER%"=="" set DB_USER=root

set /p DB_PASS=Enter test database password [root]: 
if "%DB_PASS%"=="" set DB_PASS=root

set /p DB_NAME=Enter test database name [giggatek_test]: 
if "%DB_NAME%"=="" set DB_NAME=giggatek_test

rem Update .env.test with database configuration
powershell -Command "(Get-Content .env.test) -replace 'DB_HOST=.*', 'DB_HOST=%DB_HOST%' | Set-Content .env.test"
powershell -Command "(Get-Content .env.test) -replace 'DB_USER=.*', 'DB_USER=%DB_USER%' | Set-Content .env.test"
powershell -Command "(Get-Content .env.test) -replace 'DB_PASS=.*', 'DB_PASS=%DB_PASS%' | Set-Content .env.test"
powershell -Command "(Get-Content .env.test) -replace 'DB_NAME=.*', 'DB_NAME=%DB_NAME%' | Set-Content .env.test"

rem Stripe configuration
echo.
echo Configuring Stripe test credentials...
echo Visit https://dashboard.stripe.com/test/apikeys to get your test API keys

set /p STRIPE_PUBLIC_KEY=Enter Stripe test public key [pk_test_example]: 
if "%STRIPE_PUBLIC_KEY%"=="" set STRIPE_PUBLIC_KEY=pk_test_example

set /p STRIPE_SECRET_KEY=Enter Stripe test secret key [sk_test_example]: 
if "%STRIPE_SECRET_KEY%"=="" set STRIPE_SECRET_KEY=sk_test_example

set /p STRIPE_WEBHOOK_SECRET=Enter Stripe test webhook secret [whsec_test_example]: 
if "%STRIPE_WEBHOOK_SECRET%"=="" set STRIPE_WEBHOOK_SECRET=whsec_test_example

rem Update .env.test with Stripe configuration
powershell -Command "(Get-Content .env.test) -replace 'STRIPE_PUBLIC_KEY=.*', 'STRIPE_PUBLIC_KEY=%STRIPE_PUBLIC_KEY%' | Set-Content .env.test"
powershell -Command "(Get-Content .env.test) -replace 'STRIPE_SECRET_KEY=.*', 'STRIPE_SECRET_KEY=%STRIPE_SECRET_KEY%' | Set-Content .env.test"
powershell -Command "(Get-Content .env.test) -replace 'STRIPE_WEBHOOK_SECRET=.*', 'STRIPE_WEBHOOK_SECRET=%STRIPE_WEBHOOK_SECRET%' | Set-Content .env.test"

rem Email configuration - using MailHog defaults
powershell -Command "(Get-Content .env.test) -replace 'SMTP_HOST=.*', 'SMTP_HOST=localhost' | Set-Content .env.test"
powershell -Command "(Get-Content .env.test) -replace 'SMTP_PORT=.*', 'SMTP_PORT=1025' | Set-Content .env.test"
powershell -Command "(Get-Content .env.test) -replace 'EMAIL_FROM=.*', 'EMAIL_FROM=test@giggatek.com' | Set-Content .env.test"
powershell -Command "(Get-Content .env.test) -replace 'EMAIL_FROM_NAME=.*', 'EMAIL_FROM_NAME=GigGatek Test' | Set-Content .env.test"

rem Set TEST_MODE to true
powershell -Command "(Get-Content .env.test) -replace 'TEST_MODE=.*', 'TEST_MODE=true' | Set-Content .env.test"

echo Environment variables configured successfully.

rem Set up test database
echo.
echo Setting up test database...

rem Check if database exists, create if it doesn't
mysql -h%DB_HOST% -u%DB_USER% -p%DB_PASS% -e "CREATE DATABASE IF NOT EXISTS %DB_NAME%;"

rem Import database schemas
echo Importing database schemas...
mysql -h%DB_HOST% -u%DB_USER% -p%DB_PASS% %DB_NAME% < backend/database/auth_schema.sql
mysql -h%DB_HOST% -u%DB_USER% -p%DB_PASS% %DB_NAME% < backend/database/orders_schema.sql
mysql -h%DB_HOST% -u%DB_USER% -p%DB_PASS% %DB_NAME% < backend/database/rentals_schema.sql

echo Test database setup completed.

rem Start MailHog if Docker is available
where docker >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo.
    echo Setting up MailHog for email testing...
    
    rem Check if MailHog container is already running
    docker ps | findstr mailhog >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo MailHog is already running.
    ) else (
        rem Check if container exists but is stopped
        docker ps -a | findstr mailhog >nul 2>&1
        if %ERRORLEVEL% EQU 0 (
            echo Starting existing MailHog container...
            docker start mailhog
        ) else (
            echo Creating and starting MailHog container...
            docker run -d --name mailhog -p 1025:1025 -p 8025:8025 mailhog/mailhog
        )
    )
    
    echo MailHog setup completed. Web interface available at http://localhost:8025
) else (
    echo.
    echo Docker not available. Please install MailHog manually:
    echo Instructions: https://github.com/mailhog/MailHog#installation
)

rem Install Python dependencies
echo.
echo Installing Python dependencies...
pip install pytest requests pytest-html pymysql pytest-dotenv faker bcrypt

echo Python dependencies installed.

rem Run the environment setup script
echo.
echo Running environment setup script...
cd "%~dp0.." && python tests/setup_test_environment.py

echo Environment setup completed.

rem Generate test data
echo.
echo Generating test data...
python tests/generate_test_data.py

echo Test data generation completed.

rem Success message
echo.
echo =========================================================
echo GigGatek Integration Testing Environment Setup Complete!
echo =========================================================
echo.
echo Next steps:
echo 1. Run tests with: python tests/run_integration_tests.py --report
echo 2. Access MailHog web interface: http://localhost:8025
echo 3. For component-specific tests: python tests/run_integration_tests.py --component=auth
echo.
echo For more information, see: tests/README.md and INTEGRATION_TESTING_NEXT_STEPS.md

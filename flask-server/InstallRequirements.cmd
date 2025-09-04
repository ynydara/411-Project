@echo off
echo ============================
echo   Installing python packages from requirements.txt
echo ============================

if not exist venv (
    python -m venv venv
)


venv\Scripts\python -m pip install -r requirements.txt

echo ===========================
echo   Completed installing python packages from InstallRequirements.txt
echo ===========================
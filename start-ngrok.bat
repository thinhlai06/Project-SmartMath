@echo off
setlocal

echo ============================================================
echo   Smart-MathAI - Ngrok Tunnel (Frontend + Backend)
echo ============================================================
echo.
echo Dang khoi dong Ngrok phien ban moi nhat...
echo Vui long cho trong giay lat, ket qua se hien thi thay doi.
echo Nhan Ctrl+C de dung chia se.
echo.

cd frontend
npx ngrok start --all --config="%~dp0ngrok.yml"

pause

@echo off
cd /d "%~dp0"
echo Starting Khoj Nepal (Spring Boot)...
call mvnw.cmd spring-boot:run
pause

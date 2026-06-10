@echo off
setlocal

cd /d "%~dp0"

xelatex -interaction=nonstopmode -halt-on-error main.tex
if errorlevel 1 goto build_updated

xelatex -interaction=nonstopmode -halt-on-error main.tex
if errorlevel 1 exit /b %errorlevel%

echo Build completed: main.pdf
exit /b 0

:build_updated
echo main.pdf may be open or locked. Building main_updated.pdf instead...
xelatex -interaction=nonstopmode -halt-on-error -jobname=main_updated main.tex
if errorlevel 1 exit /b %errorlevel%

xelatex -interaction=nonstopmode -halt-on-error -jobname=main_updated main.tex
if errorlevel 1 exit /b %errorlevel%

echo Build completed: main_updated.pdf

@echo off
npm version patch || exit /b
npm publish

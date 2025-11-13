:: 
:: https://neotap.net
:: please do not edit
::

@echo off
setlocal

set "_exe=%~dp0src/index.ts"

if not exist "%_exe%" (
  set "_exe=%~dp0mserve_install.msi"
)

ts-node %_exe% %*
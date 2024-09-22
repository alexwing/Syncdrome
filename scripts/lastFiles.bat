@echo off
setlocal

:: Last Files - Muestra los últimos 100 archivos modificados en un directorio

:: Verificar que se haya pasado un argumento
if "%~1"=="" (
    echo No se ha especificado un directorio. Uso: lastFiles.bat [directorio]
    goto :end
)

:: Especificar el directorio que quieres buscar
set "directorio=%~1"

:: Verificar si el directorio existe
if not exist "%directorio%" (
    echo El directorio especificado no existe: %directorio%
    goto :end
)

:: Cambiar al directorio especificado
pushd "%directorio%" || (
    echo No se puede acceder al directorio especificado: %directorio%
    goto :end
)

:: Obtener la lista de los archivos ordenados por fecha de modificación y guardar los últimos 100 en un archivo temporal
for /f "tokens=*" %%A in ('dir /b /s /o-d /t:w /a:-d ^| findstr /n . ^| findstr "^0*1[0-9][0-9]"') do echo %%A >> archivos_recientes.txt

:: Mostrar los resultados
type archivos_recientes.txt

:: Eliminar el archivo temporal
del archivos_recientes.txt

:: Volver al directorio anterior
popd

:end
endlocal

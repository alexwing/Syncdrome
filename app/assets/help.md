## Ayuda

Syncdrome sirve como una herramienta para crear un catálogo de todos los archivos en discos duros de una biblioteca personal, permitiendo búsquedas rápidas por palabra clave. Los resultados de la búsqueda se devuelven de forma similar a como lo haría un motor de búsqueda web.

Además si detecta que la unidad esta conectada en el equipo, se puede acceder a los archivos directamente desde la aplicación, ejectuando el archivo con el programa predeterminado del sistema.

### Instalación

Syncdrome es una aplicación standalone, no requiere instalación, solo descarga el archivo zip, descomprímelo y ejecuta el archivo `syncdrome.exe`.

Esta desarrollado en Electron, por lo que en un futuro se podrá compilar para otras plataformas, siempre y cuando se pueda acceder a los archivos de forma similar a como se hace en Windows.

### Uso

En primer lugar, hay que establecer la carpeta de trabajo, esta es la carpeta donde se almacenará el catálogo de archivos, en formato TXT, divididos por volumen de disco y junto a ellos, un archivo `drives.json` con la configuración e información de los discos duros.

### Sincronización

Para comenzar a usar la aplicación, primero debes crear un catálogo, para ello acceda a la opción `Sync` en el menú de la aplicación.

### Busquéda

Para buscar un archivo, simplemente escriba una palabra clave en el campo de búsqueda y presione la tecla `Enter` o haga clic en el botón `Search`.


### Configuración	


Dentro del fichero resources\app\config.json se puede configurar la aplicación, por ejemplo, para cambiar el color de los iconos de los archivos, o para añadir nuevas extensiones de archivo.

```json
{
  "folder": "C:\\myfolder",
  "extensions": {
    "document": {
      "icon": "File",
      "color": "black",
      "extensions": ["doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "odt", "ods", "odp"]
    },
    ...
    },
}
```

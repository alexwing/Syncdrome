## Ayuda

**Syncdrome** sirve como una herramienta para crear un catálogo de todos los archivos en discos duros de una biblioteca personal, permitiendo búsquedas rápidas por palabra clave. Los resultados de la búsqueda se devuelven de forma similar a como lo haría un motor de búsqueda web.

Además si detecta que la unidad esta conectada en el equipo, se puede acceder a los archivos directamente desde la aplicación, ejectuando el archivo con el programa predeterminado del sistema.

### Instalación

Syncdrome es una aplicación standalone, no requiere instalación, solo descarga el archivo zip, descomprímelo y ejecuta el archivo `syncdrome.exe`.

Esta desarrollado en Electron, por lo que en un futuro se podrá compilar para otras plataformas, siempre y cuando se pueda acceder a los archivos de forma similar a como se hace en Windows.


### Configuración	

En la seccion `Settings` del menú de la aplicación, se puede configurar la carpeta de trabajo, donde se almacenará el catálogo de archivos. Como idea interesante, se puede almacenar el catálogo en un servicio de almacenamiento en la nube, como Dropbox, Google Drive, etc. de esta forma se puede acceder a los archivos desde cualquier equipo.

Esta carpeta de trabajo, se almacena dentro de la carpeta de la aplicación, en el fichero `resources\config.json` además se puede configurar las extensiones de archivo, para
 cambiar el color de los iconos de los archivos, o para añadir nuevas extensiones de archivo. Estas extensiones además son usadas para determinar si el archivo es multimedia o no.

```json
{
  "folder": "C:\\myfolder", // Carpeta de trabajo
  "extensions": {
    "document": { // Nombre del tipo de archivo
      "icon": "File", // Icono de la extensión
      "color": "black", // Color del icono
      "extensions": ["doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "odt", "ods", "odp"], // Extensiones de archivo
      "media": ["doc", "docx"] // Extensiones para guardar en la sincronización de solo multimedia
    },
    ...
    },
}
```


### Uso

En primer lugar, hay que establecer la carpeta de trabajo, esta es la carpeta donde se almacenará el catálogo de archivos, en formato TXT, divididos por volumen de disco y junto a ellos, un archivo `drives.json` con la configuración e información de los discos duros.

```json
{
  "VOLUMENAME": { // Nombre del volumen
    "size": 1998309031936, // Tamaño total del disco
    "freeSpace": 483906600960, // Espacio libre
    "onlyMedia": true  // Si el catálogo solo contiene archivos multimedia
  },
    ...  
}
```

El fichero que contiene el catálogo de archivos, tiene el siguiente formato:

```text
E:\projects\hd-contend-finder
E:\projects\hd-contend-finder\app
E:\projects\hd-contend-finder\backend
E:\projects\hd-contend-finder\config.json
E:\projects\hd-contend-finder\node_modules
E:\projects\hd-contend-finder\package-lock.json
E:\projects\hd-contend-finder\package.json
E:\projects\hd-contend-finder\public
E:\projects\hd-contend-finder\release-builds
E:\projects\hd-contend-finder\renovate.json
...
```

Se genera a través del comando `dir /s /b` en la carpeta de trabajo y se codifica en UTF-8.

### Sincronización

Para comenzar a usar la busqueda, primero debes crear un catálogo, para ello acceda a la opción `Sync` en el menú de la aplicación.

Se muestra una lista de los discos duros conectados al equipo, seleccione el disco que desea sincronizar y haga clic en el botón `Sync`.

A continuación, se muestran los catalogos de los volumenes de disco que ya se han sincronizado, pero que ahora no están conectados al equipo, para eliminarlos del catalogo, haga clic en el icono de la papelera.

##### La información que se muestra en cada volumen es la siguiente:

- Letra de unidad: Si está conectado al equipo, en caso contrario no se muestra.
- Nombre del volumen: Nombre del disco duro.
- Sincronizado: Si el catálogo ya se ha creado.
- Fecha de sincronización: Fecha de la última sincronización.
- Barra de porcentaje: Porcentaje de espacio ocupado en el disco duro.
- Tamaño: Tamaño total del disco duro.
- Espacio libre: Espacio libre en el disco duro.

##### Operaciones disponibles:

- Eliminar: Elimina el catálogo del volumen seleccionado.
- Sync: Sincroniza el volumen seleccionado, siempre que esté conectado al equipo.
- ALL/Only Media: Sincroniza todos los archivos o solo los archivos multimedia, las extensiónes de archivo se pueden configurar en el archivo `config.json`.

### Búsqueda

Para buscar un archivo, simplemente escriba una palabra clave en el campo de búsqueda y presione la tecla `Enter` o haga clic en el botón `Search`.

Los resultados de la búsqueda se muestran en una lista desplegable, en primer lugar se muestran los volúmenes de disco, y a continuación las carpetas y archivos que coinciden con la palabra clave.

Los discos que estan conectados al equipo, se muestran con un icono de `ok` verde. Para las carpetas y archivos de los discos conectados, se muestra un boton `Open` que permite abrir el archivo con el programa predeterminado del sistema, o mostrar la carpeta en el explorador de archivos.

Adicionalmente, se puede filtrar por archivos multimedia, para ello, puede seleccionar uno o varios tipos de archivos en el selector y hacer clic en el botón `Search`.

A la derecha de los archivos, se muestra un icono para añadir a favoritos, que permite añadir el archivo a la lista de favoritos, que se muestra en la sección `Bookmarks` del menú de la aplicación. Este favorito además permite un comentario.

### Favoritos

En la sección `Bookmarks` del menú de la aplicación, se muestra una lista de los archivos favoritos, permite filtrar por nombre del archivo y por comentario. Además se puede eliminar el favorito, pulsando el icono de la papelera.

Los favoritos se almacenan en una base de datos SQLite, en la carpeta de la aplicación, en el fichero `db.sqlite`.

### Sincronización de carpetas

En la sección `Folder Sync` del menú de la aplicación, se puede sincronizar carpetas entre dos ubicaciones, seleccionando la carpeta de origen y la carpeta de destino, y haciendo clic en el botón `Sync`.

La carpeta de origen se selecciona se situa en la parte izquierda y la carpeta de destino en la parte derecha. Los archivos existentes en el destino que coincidan con el origen se conservarán; los que falten en el destino se añadirán; y los que no estén en el origen se eliminarán.

En la parte inferior se muestra un log de las operaciones realizadas, con la fecha y hora de la operación, el tipo de operación y los archivos afectados.

### Limpiado de nombres de archivos

En la sección `File Name Cleaner` del menú de la aplicación, se puede limpiar y modificar nombres de archivos en una carpeta específica utilizando patrones y reglas de sustitución definidas por el usuario.

La carpeta de origen se selecciona en el campo `Origin Folder`. Se puede definir un patrón en el campo `Pattern` a partir del cual se borrará el texto,
 también se pueden agregar reglas de sustitución en la tabla de `Substitution Rules`. Los nombres de archivos se cargan haciendo clic en el botón `Reload`, y se limpian haciendo clic en el botón `Clean File Names`. Los cambios se aplican con el botón `Apply Changes`.

En la parte inferior se muestra una tabla con los nombres de archivos originales y los nombres modificados, permitiendo editar manualmente los nombres antes de aplicar los cambios. También se muestran mensajes y alertas relevantes para el usuario.
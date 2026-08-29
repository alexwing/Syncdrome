## Ayuda

**Syncdrome** crea un catálogo de todos los archivos de tus discos duros para que puedas buscar en toda tu biblioteca personal por palabra clave en segundos — incluso en discos que no están conectados. Cuando un disco *sí* está conectado, puedes navegarlo, previsualizar archivos, abrirlos con el programa predeterminado del sistema y saltar a su carpeta en el explorador de Windows.

### Instalación

Descarga la última versión desde la página de [Releases](https://github.com/alexwing/Syncdrome/releases):

- **Instalador (`.msi`)** — la opción recomendada. Ejecútalo y sigue el asistente; las actualizaciones se instalan sobre la versión anterior.
- **Portable (`.zip`)** — sin instalación: descomprime y ejecuta `syncdrome.exe`.

Syncdrome está construido con Tauri (backend en Rust, frontend en React) y actualmente funciona en Windows.

### Configuración

En **Ajustes** puedes elegir la carpeta de trabajo donde se guardan los catálogos. Un buen truco es apuntarla a una carpeta sincronizada en la nube (Dropbox, Google Drive…) para tener los catálogos disponibles desde cualquier equipo.

En Ajustes también se gestionan las **categorías de tipos de archivo**: cada categoría tiene un icono, un color, sus extensiones, y cuáles de ellas cuentan como *multimedia* para el modo de sincronización "Solo media".

La configuración vive en `config.json`, dentro de la carpeta `.syncdrome` de tu directorio de usuario.

### Sincronización

Antes de buscar hay que crear un catálogo. Abre **Sincronizar** en el menú:

- Los discos conectados aparecen como tarjetas con su letra, nombre, barra de ocupación y espacio libre. Pulsa **Sync** para catalogar un disco.
- **Todo / Solo media** decide si se cataloga todo o solo las extensiones marcadas como multimedia en Ajustes.
- También se listan los volúmenes sincronizados anteriormente que ahora no están conectados; el icono de papelera elimina su catálogo.

Los catálogos son archivos de texto UTF-8 (una ruta por línea, carpetas marcadas con `\` final), guardados en la carpeta de trabajo junto a un `drives.json` con los datos de cada disco.

### Buscador

Escribe una palabra clave y pulsa `Enter` o el botón **Buscar**. Los resultados se agrupan por volumen (conectados primero, ordenados por letra) y después por carpeta. También puedes restringir la búsqueda a ciertos tipos de archivo con el selector.

Cada resultado muestra el archivo con el icono de su categoría. Desde una fila puedes:

- **Clic** para abrir el panel de vista previa (ver más abajo).
- **Doble clic** para abrir el archivo con el programa predeterminado (solo discos conectados).
- **Clic derecho** para el menú contextual: vista previa, abrir, mostrar en carpeta, añadir/editar marcador, copiar el nombre o la ruta completa.
- Los iconos de la fila permiten marcar el archivo o abrirlo.

### Explorador

El **Explorador** permite navegar los volúmenes sincronizados como un gestor de archivos:

- Los discos conectados aparecen como tarjetas de acceso rápido (ordenadas por letra); el desplegable lista también los volúmenes desconectados, cuyos catálogos puedes navegar sin conexión.
- La lista muestra tipo, tamaño y fecha de modificación (datos en vivo, solo con disco conectado), el número de elementos por carpeta, y un filtro rápido por nombre o extensión.
- **Clic** en un archivo para previsualizarlo; **doble clic** para abrirlo; **clic derecho** para el menú contextual.
- El **panel de vista previa** muestra imágenes (JPG, PNG, GIF, WebP, SVG…), Markdown, texto y código, PDF, vídeo y audio — además de los metadatos del archivo, su marcador, y botones de Abrir / Mostrar en carpeta.
- Con un volumen desconectado sigues teniendo los datos del catálogo (nombres, tipos, elementos por carpeta); las vistas previas y los metadatos en vivo requieren el disco conectado.

### Marcadores

**Marcadores** lista tus archivos favoritos agrupados por volumen (conectados primero), con su descripción. Puedes buscar por nombre o descripción, añadir un marcador desde el diálogo de archivo o arrastrando un archivo a la ventana, y desde cada fila (o su menú de clic derecho) previsualizar, abrir, editar, eliminar, o copiar el nombre/ruta. El clic en una fila abre el panel de vista previa; la caja del marcador dentro del panel abre el diálogo de edición.

Los marcadores se guardan en una base de datos SQLite (`db.sqlite`) en la carpeta de trabajo.

### Limpiador de nombres

El **Limpiador de nombres** renombra en lote los archivos de una carpeta usando una receta:

- **Carpeta** — elígela con el diálogo o pega una ruta directamente.
- **Patrón de corte** — se elimina todo desde su primera coincidencia hasta el final del nombre. Se intenta como expresión regular y, si no compila, se usa como texto literal.
- **Reglas de sustitución** — pares ordenados buscar → reemplazar (expresiones regulares, sin distinguir mayúsculas). Cada regla tiene un color y un contador de coincidencias en vivo; pasa el ratón por una regla para resaltar sus coincidencias en la lista.

La lista muestra un diff real de cada archivo, calculado en vivo mientras editas la receta: lo que se elimina tachado en rojo, lo que se añade en verde. Los archivos que colisionarían en el mismo nombre final se marcan y excluyen automáticamente. Puedes excluir cualquier archivo con su casilla, ocultar los que no cambian con el interruptor *Solo cambios*, y hacer clic en cualquier nombre nuevo para editarlo a mano (`Enter` confirma, `Esc` restaura el calculado).

El limpiador nunca toca la extensión del archivo, colapsa los espacios duplicados y recorta los separadores sueltos. **Aplicar** indica cuántos archivos va a renombrar e informa del resultado (o error) de cada uno.

### Sincronizar carpetas

**Sincronizar carpetas** replica una carpeta de origen en una de destino: los archivos que coinciden se conservan, los que faltan se copian, y los que no existen en el origen se eliminan del destino. Un registro en la parte inferior muestra cada operación según ocurre.

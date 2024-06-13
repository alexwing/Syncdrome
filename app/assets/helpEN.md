## Help

**Syncdrome** serves as a tool to create a catalog of all the files on hard drives in a personal library, allowing quick keyword searches. Search results are returned in a similar way to how a web search engine would.

Additionally, if it detects that the drive is connected to the computer, you can access the files directly from the application, running the file with the system's default program.

### Installation

Syncdrome is a standalone application, it does not require installation, just download the zip file, unzip it and run the `syncdrome.exe` file.

It is developed in Electron, so in the future it can be compiled for other platforms, as long as file access is similar to how it is done in Windows.

### Configuration

In the `Settings` section of the application menu, you can configure the working folder where the file catalog will be stored. An interesting idea is to store the catalog in a cloud storage service like Dropbox, Google Drive, etc., allowing access to files from any computer.

This working folder is stored within the application folder in the `resources\config.json` file. You can also configure file extensions to change the color of file icons or add new file extensions. These extensions are used to determine if the file is multimedia or not.

```json
{
  "folder": "C:\\myfolder", // Working folder
  "extensions": {
    "document": { // File type name
      "icon": "File", // Extension icon
      "color": "black", // Icon color
      "extensions": ["doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "odt", "ods", "odp"], // File extensions
      "media": ["doc", "docx"] // Extensions to save in multimedia-only synchronization
    },
    ...
  },
}
```

### Usage

First, you have to set the working folder, this is the folder where the file catalog will be stored, in TXT format, divided by disk volume and next to them, a `drives.json` file with the configuration and information of the hard drives.

```json
{
  "VOLUMENAME": { // Volume name
    "size": 1998309031936, // Total disk size
    "freeSpace": 483906600960, // Free space
    "onlyMedia": true  // If the catalog only contains multimedia files
  },
    ...  
}
```

The file containing the file catalog has the following format:

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

It is generated through the `dir /s /b` command in the working folder and encoded in UTF-8.

### Synchronization

To start using the search, you must first create a catalog, for this access the `Sync` option in the application menu.

A list of the hard drives connected to the computer is displayed, select the drive you want to synchronize and click the `Sync` button.

Next, the catalogs of the disk volumes that have already been synchronized, but that are now not connected to the computer, are shown, to remove them from the catalog, click on the trash can icon.

##### The information shown in each volume is the following:

- Drive letter: If it is connected to the computer, otherwise it is not shown.
- Volume name: Name of the hard drive.
- Synchronized: If the catalog has already been created.
- Synchronization date: Date of the last synchronization.
- Percentage bar: Percentage of space occupied on the hard drive.
- Size: Total size of the hard drive.
- Free space: Free space on the hard drive.

##### Operations available:

- Delete: Deletes the catalog of the selected volume.
- Sync: Synchronizes the selected volume, as long as it is connected to the computer.
- ALL/Only Media: Synchronizes all files or only multimedia files, the file extensions can be configured in the `config.json` file.

### Search

To search for a file, simply type a keyword in the search field and press the `Enter` key or click the `Search` button.

Search results are displayed in a drop-down list, first the disk volumes are displayed, and then the folders and files that match the keyword.

Drives that are connected to the computer are displayed with a green `ok` icon. For folders and files on connected drives, an `Open` button is displayed that allows you to open the file with the system's default program, or display the folder in the file explorer.

Additionally, you can filter by multimedia files, for this, you can select one or several types of files in the selector and click on the `Search` button.

To the right of the files, an icon is displayed to add to favorites, which allows you to add the file to the favorites list, which is displayed in the `Bookmarks` section of the application menu. This favorite also allows a comment.

### Bookmarks

In the `Bookmarks` section of the application menu, a list of favorite files is displayed, allowing you to filter by file name and comment. You can also delete the favorite by clicking the trash can icon.

Favorites are stored in an SQLite database, in the application folder, in the `db.sqlite` file.

### Folder Sync

In the `Folder Sync` section of the application menu, you can synchronize folders between two locations by selecting the source folder and the destination folder, and clicking the `Sync` button.

The source folder is selected on the left side and the destination folder on the right side. Existing files in the destination that match the source will be preserved; those missing in the destination will be added; and those not in the source will be deleted.

At the bottom, a log of the operations performed is displayed, with the date and time of the operation, the type of operation, and the affected files.
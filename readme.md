
Syncdrome - Content Drives Finder App
=====================================

Syncdrome simplifies the organization and search of your digital files on specific hard drives.

About
-----

As someone who tends to accumulate digital files in a disorganized manner, I felt the need to develop a tool that would simplify my digital life. Syncdrome was born out of my own experience as a self-proclaimed "digital Diogenes."

Syncdrome is an Electron application with React in the frontend and Node.js in the backend. This intuitive tool streamlines the search and organization of your files on specific hard drives. With a simple yet powerful interface, Syncdrome allows quick keyword searches and presents results organized by folders.

Installation
------------

1.  Make sure you have [Node.js](https://nodejs.org/) installed on your machine.
    
2.  Clone this repository:
    
    bashCopy code
    
    `git clone https://github.com/alexwing/Syncdrome`
    
3.  Navigate to the project directory:
    
    bashCopy code
    
    `cd Syncdrome`
    
4.  Install the dependencies:
    
    bashCopy code
    
    `npm install`

Configuration
-------------

In the `Settings` section of the application menu, you can configure the working folder where the file catalog will be stored. It's an interesting idea to store the catalog in a cloud storage service, such as Dropbox or Google Drive, for easy access from any device.

The working folder is stored within the application folder in the `resources\config.json` file. You can also configure file extensions to change the color of file icons or add new file extensions.

jsonCopy code

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
  }
}
```

Synchronization
---------------

To start using the search, you first need to create a catalog. Access the `Sync` option in the application menu.

A list of connected hard drives is displayed. Select the drive you want to synchronize and click the `Sync` button. The synchronized catalogs of disk volumes that are not currently connected to the computer are also shown. To remove them from the catalog, click the trash icon.

### Search

To search for a file, simply enter a keyword in the search field and press `Enter` or click the `Search` button. The search results are displayed in a dropdown list, showing disk volumes first, followed by folders and files that match the keyword.

Connected drives are shown with a green `ok` icon. For folders and files on connected drives, an `Open` button is displayed, allowing you to open the file with the system's default program or show the folder in the file explorer.

Batch File Version
------------------

The `ContentDrive.bat` batch file is used to generate text files with the content of the hard drives. The batch file description is as follows:

Copy file to hard drive and run it. The file will create a text file with the list of all files on the drive. The text file will be saved in the Google drive/ Dropbox (or other folder). The file name will be the drive name with the extension `.txt`. For example, if the drive name is `My Passport`, the file name will be `My Passport.txt`.

In current version, not is necessary to copy the file to the hard drive, you can run syncronization from the application.


```bat
@rem  Batch file to create a list of all files on a drive. 
@rem  The list is saved in the Google drive folder.

@ set drive="C:\Users\Windows\Mi unidad\Software\DiscosDuros\"

@echo off

for /f "tokens=1-5*" %%1 in ('vol') do (
   set vol=%%6 & goto done
)
:done
set vol=%vol:~0,-1%
dir . /s /b > %drive%%vol:~5%".txt" 

@echo on
@echo List of files on %vol% saved in %drive%%vol:~5%".txt"
@pause

```

Code Details
------------

*   The application uses Express.js for route handling and server creation.
*   The code searches through all text files (`*.txt`) in the specified directory and groups the results by folder.
*   Each result includes information such as line number, clean file name, type (file or folder), file name, and folder path.


About
-----

Syncdrome simplifies the organization and search of your digital files on specific hard drives. Developed by Alejandro Aranda, it is an Electron application with React on the frontend and Node.js on the backend.

As someone who tends to accumulate digital files in a disorganized manner, I felt the need to develop a tool that would simplify my digital life. Syncdrome was born out of my own experience as a self-proclaimed "digital Diogenes."

Syncdrome is an Electron application with React in the frontend and Node.js in the backend. This intuitive tool streamlines the search and organization of your files on specific hard drives. With a simple yet powerful interface, Syncdrome allows quick keyword searches and presents results organized by folders.

License
-------

This project is under the MIT License. See the [LICENSE](LICENSE) file for more details.

You can access the Syncdrome repository on [GitHub](https://github.com/alexwing/Syncdrome).

### Contribute and Support

If you find value in Syncdrome and want to contribute to its continuous development, consider making a donation on my [GitHub Sponsors](https://github.com/sponsors/alexwing) page. Your support is highly appreciated! 🚀✨

GitHub Sponsors is a new way to support open-source developers contributing to projects like Syncdrome. If Syncdrome is a useful tool for you, consider supporting my work with a donation. Your support allows me to dedicate more time to open-source projects like this one.

Copyleft © 2024 [Alejandro Aranda](https://aaranda.es/).

### Issues

Report any issues or suggestions related to this project on the [GitHub repository](https://github.com/alexwing/Syncdrome/issues).
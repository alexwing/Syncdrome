# Syncdrome - Content Drives Finder App

This is a simple Express.js server that serves as a tool to create a catalog of all files on specified hard drives, allowing for quick searches by keyword. The search results are returned and organized by folders.

## Installation

1. Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

2. Clone this repository:

   ```bash
   git clone https://github.com/alexwing/content-drives-finder.git
   ```

3. Navigate to the project directory:

   ```bash
   cd content-drives-finder
   ```

4. Install the dependencies:

   ```bash
   npm install
   ```

## Usage

1. Modify the value of the `folder` variable in `app.js` with the path of the directory you want to explore.

   ```javascript
   const folder = "C:\\Users\\Windows\\My Drive\\Software\\HardDrives";
   ```

2. Run the application:

   ```bash
   node app.js
   ```

3. Open your browser and visit the URL:

   [http://localhost:3000/find/{searchParam}](http://localhost:3000/find/{searchParam})

   Replace `{searchParam}` with the keyword you want to search for.

4. Observe the results grouped by text file and folder.

## Batch File Description

The `ContentDrive.bat` batch file is used to generate text files with the content of the hard drives. The batch file description is as follows:

Copy file to hard drive and run it. The file will create a text file with the list of all files on the drive. The text file will be saved in the Google drive folder. The file name will be the drive name with the extension `.txt`. For example, if the drive name is `My Passport`, the file name will be `My Passport.txt`.

replace "drive" with the path of the Google drive folder or other folder where you want to save the text files.

```batch
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

## Code Details

- The application uses Express.js for route handling and server creation.

- The code searches through all text files (`*.txt`) in the specified directory and groups the results by folder.

- Each result includes information such as line number, clean file name, type (file or folder), file name, and folder path.

- The code uses the `reduce` function to group the results by folder.

- The server runs on [http://localhost:3000](http://localhost:3000) by default.

## Contributions

Feel free to contribute and enhance the code. You can do so through pull requests.

## License

This project is under the MIT License. See the [LICENSE](LICENSE) file for more details.

```

//execute a bat file in the root of the drive, from the drive letter
/*
app.get("/execute/:driveLetter", (req, res) => {
  const driveLetter = req.params.driveLetter;
  let file = path.join(driveLetter, "ContentDrive.bat");
  if (!fs.existsSync(file)) {
    file = path.join(driveLetter, "ContentDriveMedia.bat");
  }
  if (fs.existsSync(file)) {
    const cp = require("child_process");
    const cmd = cp.spawnSync(file, [], {
      shell: true,
      encoding: "utf8",
      cwd: driveLetter,
    });
    if (cmd.error) {
      console.log("Error al ejecutar el archivo bat:", cmd.error);
      res.json({
        success: false,
        error: cmd.error,
        stdout: cmd.stdout,
        stderr: cmd.stderr,
      });
    } else {
      res.json({ success: true, stdout: cmd.stdout, stderr: cmd.stderr });
    }
  } else {
    console.log("Archivo bat no encontrado:", file);
    res.json({ success: false });
  }
});
*/
```
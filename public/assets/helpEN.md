## Help

**Syncdrome** creates a catalog of all the files on your hard drives, so you can search your whole personal library by keyword in seconds — even for drives that are not currently connected. When a drive *is* connected, you can browse it, preview files, open them with the system's default program and jump to their folder in the file explorer.

### Installation

Download the latest version from the [Releases](https://github.com/alexwing/Syncdrome/releases) page:

- **Installer (`.msi`)** — the recommended option. Run it and follow the wizard; updates install over the previous version.
- **Standalone (`.zip`)** — no installation required: unzip and run `syncdrome.exe`.

Syncdrome is built with Tauri (Rust backend, React frontend) and currently targets Windows.

### Configuration

In **Settings** you can choose the working folder where the catalogs are stored. A nice trick is to point it at a cloud-synced folder (Dropbox, Google Drive…) so your catalogs are available from any computer.

Settings also manage the **file type categories**: each category has an icon, a color, its file extensions, and which of those extensions count as *media* for the "Only Media" synchronization mode.

The configuration lives in `config.json` inside the `.syncdrome` folder of your home directory.

### Synchronization

Before searching you need to create a catalog. Open **Sync** in the menu:

- Connected drives appear as cards with their letter, name, usage bar and free space. Click **Sync** to catalog a drive.
- **All / Only Media** toggles whether everything is cataloged or only the extensions marked as media in Settings.
- Volumes that were synchronized before but are not connected now are listed too; the trash icon removes their catalog.

Catalogs are plain UTF-8 text files (one path per line, folders marked with a trailing `\`), stored in the working folder next to a `drives.json` file with each drive's details.

### Search

Type a keyword and press `Enter` or click **Search**. Results are grouped by volume (connected volumes first, ordered by drive letter) and then by folder. You can also restrict the search to certain file types with the selector.

Each result row shows the file with its category icon. From a row you can:

- **Click** it to open the preview panel (see below).
- **Double-click** to open the file with the system's default program (connected drives only).
- **Right-click** for the context menu: preview, open, show in folder, add/edit bookmark, copy the name or the full path.
- Use the inline icons to bookmark the file or open it.

### Explorer

The **Explorer** lets you browse synchronized volumes like a file manager:

- Connected drives appear as quick-access cards (ordered by letter); the dropdown also lists disconnected volumes, whose catalogs you can browse offline.
- The list shows type, size and modified date (live data, connected drives only), per-folder item counts, and a quick filter by name or extension.
- **Click** a file to preview it; **double-click** to open it; **right-click** for the context menu.
- The **preview panel** renders images (JPG, PNG, GIF, WebP, SVG…), Markdown, text and code, PDF, video and audio — plus the file's metadata, its bookmark, and Open / Show in folder buttons.
- With a disconnected volume you still get the catalog data (names, types, folder counts); previews and live metadata need the drive connected.

### Bookmarks

**Bookmarks** lists your favorite files grouped by volume (connected first), with their description. You can search by name or description, add a bookmark from a file dialog or by dragging a file into the window, and from each row (or its right-click menu) preview, open, edit, delete, or copy the name/path. Clicking a row opens the preview panel; the bookmark box inside the panel opens the edit dialog.

Bookmarks are stored in an SQLite database (`db.sqlite`) in the working folder.

### File Name Cleaner

The **File Name Cleaner** batch-renames the files of a folder using a recipe:

- **Folder** — pick it with the dialog or paste a path directly.
- **Cut pattern** — everything from its first match to the end of the name is removed. It is tried as a regular expression and, if it does not compile, used as literal text.
- **Substitution rules** — ordered find → replace pairs (regular expressions, case-insensitive). Each rule has a color and a live match counter; hover a rule to highlight its matches in the list.

The list shows a real diff for every file, computed live as you edit the recipe: deleted parts struck through in red, additions in green. Files that would collide on the same final name are flagged and excluded automatically. You can exclude any file with its checkbox, hide unchanged files with the *Only changes* switch, and click any new name to edit it manually (`Enter` confirms, `Esc` restores the computed name).

The cleaner never touches the file extension, collapses duplicate spaces, and trims dangling separators. **Apply** shows how many files it will rename and reports per-file success or errors.

### Folder Sync

**Folder Sync** mirrors a source folder into a destination folder: files that match are kept, missing ones are copied, and files not present in the source are deleted from the destination. A log at the bottom shows each operation as it happens.

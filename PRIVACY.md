# Privacy policy

Syncdrome is a desktop application that catalogs and searches the contents of
your hard drives. It has no account system, no server component and no
analytics: **Syncdrome collects no personal data and sends none to its author.**

## What Syncdrome stores, and where

Everything Syncdrome writes stays on your own machine. Nothing is uploaded.

In the catalog folder you choose in *Settings*:

- `<VolumeName>.txt` — the list of file and folder paths of each synchronized
  drive.
- `drives.json` — size, free space and options of each known drive.
- `db.sqlite` — your bookmarks (name, path, volume and description).

In your user profile:

- `.syncdrome/config.json` — the catalog folder, file type definitions and
  file name cleaner rules.

In the application's local browser storage, purely to restore the interface
where you left it: the last search term, the selected file type filters, the
file name cleaner pattern, and the origin and destination folders of the folder
synchronizer.

You can inspect or delete any of these files at any time. Deleting them removes
the corresponding data permanently.

Note that a drive catalog is a list of the paths of your files, which may itself
be revealing. Choose where you keep the catalog folder accordingly, especially
if you place it inside a folder that is synchronized to a cloud service; that
transfer is performed by that service, not by Syncdrome.

## Network connections

Syncdrome makes no network connection while cataloging, searching or browsing
your drives. It connects to the internet in only these cases:

1. **The About screen** requests the latest release and the recent commit list
   of the public repository from the GitHub API (`api.github.com`), to tell you
   whether a newer version exists and to show the changelog. This happens only
   while that screen is open. No personal data is sent; GitHub receives the
   request as it would from any anonymous visitor and is subject to
   [GitHub's privacy statement](https://docs.github.com/site-policy/privacy-policies/github-general-privacy-statement).
2. **The installer** offers to download the Microsoft Edge WebView2 runtime
   from Microsoft when it is not already installed on the system, subject to
   [Microsoft's privacy statement](https://privacy.microsoft.com/privacystatement).

If you never open the About screen and already have WebView2 installed,
Syncdrome makes no outbound connection at all.

## Files you open

Opening a file or a containing folder from Syncdrome hands the path to Windows,
which opens it with whatever application is associated with that file type.
What that application then does is outside Syncdrome's control.

## Changes

This policy applies to Syncdrome as published at
<https://github.com/alexwing/Syncdrome>. Any change to it will be part of the
repository history.

Questions about this policy can be raised as an
[issue](https://github.com/alexwing/Syncdrome/issues).

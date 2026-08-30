# Code signing policy

Free code signing provided by [SignPath.io](https://about.signpath.io), certificate by [SignPath Foundation](https://signpath.org).

## Team roles

Syncdrome is maintained by a single developer, who holds every role:

- **Authors** — [@alexwing](https://github.com/alexwing). May commit to the repository without external review.
- **Reviewers** — [@alexwing](https://github.com/alexwing). Reviews and approves contributions from third parties before they are merged.
- **Approvers** — [@alexwing](https://github.com/alexwing). Authorizes every signing request individually in SignPath.

## Privacy policy

Full policy: [PRIVACY.md](PRIVACY.md).

This program will not transfer any information to other networked systems unless
specifically requested by the user or the person installing or operating it.

Two clarifications about what "specifically requested" covers in Syncdrome:

- **Update check.** The *About* screen queries the public GitHub API
  (`api.github.com`) to compare the installed version with the latest published
  release. It sends no personal data; GitHub receives the request as any
  anonymous visitor would. It only runs when that screen is opened.
- **WebView2 runtime.** The installer offers to download the Microsoft Edge
  WebView2 runtime from Microsoft when it is not already present, which is
  subject to [Microsoft's privacy statement](https://privacy.microsoft.com/privacystatement).

The drive catalogs, bookmarks and settings Syncdrome creates never leave the
machine: they live in the folder configured in *Settings* and in
`%USERPROFILE%\.syncdrome`.

## How releases are built and signed

Releases are built on GitHub-hosted runners by the
[release workflow](.github/workflows/release.yml), which runs when a `v*` tag is
pushed. The workflow uploads the unsigned installer as a GitHub Actions
artifact and submits it to SignPath, which verifies that the build came from
this repository before signing it. The signed installer is then attached to the
[GitHub release](https://github.com/alexwing/Syncdrome/releases).

Builds made on a developer machine are not signed with the SignPath
certificate.

## SignPath artifact configuration

For reference, the artifact configuration registered in SignPath. GitHub stores
workflow artifacts as ZIP archives, so the root element is `<zip-file>`:

```xml
<artifact-configuration xmlns="http://signpath.io/artifact-configuration/v1">
  <zip-file>
    <msi-file path="syncdrome_*_x64_en-US.msi">
      <pe-file path="syncdrome.exe">
        <authenticode-sign/>
      </pe-file>
      <authenticode-sign/>
    </msi-file>
    <pe-file path="syncdrome.exe">
      <authenticode-sign/>
    </pe-file>
  </zip-file>
</artifact-configuration>
```

The workflow uploads two files: the installer and the same executable on its
own, which is published as the portable ZIP. The `<pe-file>` nested inside
`<msi-file>` signs the copy the installer carries; the one next to it signs the
portable copy.

// Path helpers kept dependency-free: api.tsx and utils.tsx both need them and
// importing one from the other would close an import cycle.

/***
 * Join a drive letter, a relative folder and an optional file name into a
 * Windows path. Drive letters arrive as "D:\" and catalog folders may start or
 * end with a separator, so the parts are joined and then collapsed to avoid
 * "D:\\Backup" style paths that the shell refuses to open.
 * @param parts
 * @returns {string}
 */
export const buildWindowsPath = (
  ...parts: (string | null | undefined | false)[]
): string => {
  const joined = parts
    .filter((p): p is string => typeof p === "string" && p !== "")
    .map((p) => p.replace(/\//g, "\\"))
    .join("\\");
  const isUnc = joined.startsWith("\\\\");
  const collapsed = joined.replace(/\\{2,}/g, "\\");
  return isUnc ? `\\${collapsed}` : collapsed;
};

/***
 * Parent folder of a relative catalog path, "" when already at the top level
 * @param folder
 * @returns {string}
 */
export const parentFolder = (folder: string): string => {
  const clean = folder.replace(/\//g, "\\").replace(/\\+$/, "");
  const i = clean.lastIndexOf("\\");
  return i > 0 ? clean.slice(0, i) : "";
};

/***
 * Last segment of a relative catalog path
 * @param folder
 * @returns {string}
 */
export const folderName = (folder: string): string => {
  const clean = folder.replace(/\//g, "\\").replace(/\\+$/, "");
  const i = clean.lastIndexOf("\\");
  return i >= 0 ? clean.slice(i + 1) : clean;
};

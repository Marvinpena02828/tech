export function convertDriveUrl(url: string) {  // If already converted, return as-is
  if (url.includes('drive.google.com/uc?export=view')) {
    return url;
  }
  // Pattern for typical Google Drive “view” URLs
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);

  if (!match) return url; // Not a Drive URL → return unchanged

  const fileId = match[1];
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

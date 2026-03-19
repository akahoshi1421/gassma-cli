const SPREADSHEET_URL_PATTERN = /\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/;

const extractSpreadsheetId = (
  urlOrId: string | undefined,
): string | undefined => {
  if (urlOrId === undefined) return undefined;

  const match = urlOrId.match(SPREADSHEET_URL_PATTERN);
  if (match) return match[1];

  return urlOrId;
};

export { extractSpreadsheetId };

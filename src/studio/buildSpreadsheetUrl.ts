const FULL_URL_PATTERN = /^https?:\/\//;

const buildSpreadsheetUrl = (urlOrId: string): string => {
  if (FULL_URL_PATTERN.test(urlOrId)) return urlOrId;
  return `https://docs.google.com/spreadsheets/d/${urlOrId}/edit`;
};

export { buildSpreadsheetUrl };

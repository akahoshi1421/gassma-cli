const pad2 = (value: number): string => String(value).padStart(2, "0");

const formatMigrationTimestamp = (date: Date): string =>
  [
    String(date.getUTCFullYear()),
    pad2(date.getUTCMonth() + 1),
    pad2(date.getUTCDate()),
    pad2(date.getUTCHours()),
    pad2(date.getUTCMinutes()),
    pad2(date.getUTCSeconds()),
  ].join("");

const sanitizeMigrationName = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const buildMigrationDirName = (date: Date, name?: string): string => {
  const timestamp = formatMigrationTimestamp(date);
  const sanitized = sanitizeMigrationName(name ?? "");
  if (sanitized === "") return timestamp;
  return `${timestamp}_${sanitized}`;
};

export { buildMigrationDirName };

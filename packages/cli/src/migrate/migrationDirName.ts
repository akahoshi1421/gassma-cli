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

const buildMigrationDirName = (date: Date, name?: string): string => {
  const timestamp = formatMigrationTimestamp(date);
  if (name === undefined || name === "") return timestamp;
  return `${timestamp}_${name}`;
};

export { buildMigrationDirName };

const GITIGNORE_ENTRIES = [
  ".clasp.json",
  ".clasprc.json",
  ".env",
  "node_modules/",
  "dist/*",
  "!dist/appsscript.json",
];

const generateGitignore = (): string => `${GITIGNORE_ENTRIES.join("\n")}\n`;

const mergeGitignore = (existingContent: string): string => {
  const existingLines = existingContent.split("\n").map((line) => line.trim());
  const missing = GITIGNORE_ENTRIES.filter(
    (entry) => !existingLines.includes(entry),
  );

  if (missing.length === 0) return existingContent;

  const separator = existingContent.endsWith("\n") ? "" : "\n";
  return `${existingContent}${separator}${missing.join("\n")}\n`;
};

export { generateGitignore, mergeGitignore };

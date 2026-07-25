const templateEntries = (template: string): string[] =>
  template
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");

const mergeGitignore = (template: string, existingContent: string): string => {
  const existingLines = existingContent.split("\n").map((line) => line.trim());
  const missing = templateEntries(template).filter(
    (entry) => !existingLines.includes(entry),
  );

  if (missing.length === 0) return existingContent;

  const separator = existingContent.endsWith("\n") ? "" : "\n";
  return `${existingContent}${separator}${missing.join("\n")}\n`;
};

export { mergeGitignore };

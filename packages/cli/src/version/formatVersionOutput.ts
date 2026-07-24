const formatVersionOutput = (version: string, json: boolean): string => {
  if (json) return JSON.stringify({ gassma: version });
  return `gassma v${version}`;
};

export { formatVersionOutput };

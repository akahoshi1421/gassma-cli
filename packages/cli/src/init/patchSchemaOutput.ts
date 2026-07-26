const DEFAULT_OUTPUT = "./src/generated/gassma";

const patchSchemaOutput = (
  template: string,
  output: string | undefined,
): string => {
  if (output === undefined) return template;
  return template.replace(`"${DEFAULT_OUTPUT}"`, () => `"${output}"`);
};

export { patchSchemaOutput };

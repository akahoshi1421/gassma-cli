const IDENTIFIER_PATTERN = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

const RESERVED_WORDS = new Set([
  "arguments",
  "await",
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "debugger",
  "default",
  "delete",
  "do",
  "else",
  "enum",
  "eval",
  "export",
  "extends",
  "false",
  "finally",
  "for",
  "function",
  "if",
  "implements",
  "import",
  "in",
  "instanceof",
  "interface",
  "let",
  "new",
  "null",
  "package",
  "private",
  "protected",
  "public",
  "return",
  "static",
  "super",
  "switch",
  "this",
  "throw",
  "true",
  "try",
  "typeof",
  "var",
  "void",
  "while",
  "with",
  "yield",
]);

const canBeTopLevelFunctionName = (name: string): boolean =>
  IDENTIFIER_PATTERN.test(name) && !RESERVED_WORDS.has(name);

const generateStubs = (exportNames: string[], globalName: string): string =>
  exportNames
    .filter((name) => name !== "default" && canBeTopLevelFunctionName(name))
    .map(
      (name) =>
        `function ${name}() { return ${globalName}.${name}.apply(this, arguments); }`,
    )
    .join("\n");

export { generateStubs };

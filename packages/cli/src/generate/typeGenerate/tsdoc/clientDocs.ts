import { REFERENCE_BASE_URL, renderDocBlock } from "./docBlock";
import { getModelNaming } from "./modelNaming";

const FENCE = "```";
const MEMBER_INDENT = "  ";
const FALLBACK_MODEL = "Model";

const clientDocLines = (
  plural: string,
  variablePlural: string,
  accessor: string,
) => [
  "##  GASsma Client",
  "",
  "Type-safe Google Sheets client for TypeScript & Google Apps Script",
  "@example",
  FENCE,
  "const gassma = new GassmaClient()",
  `// Fetch zero or more ${plural}`,
  `const ${variablePlural} = ${accessor}.findMany()`,
  FENCE,
  "",
  "",
  `Read more in our [docs](${REFERENCE_BASE_URL}/reference/basic).`,
];

const constructorDocLines = (schemaName: string) => [
  "Creates a GASsma client.",
  `@param {Gassma${schemaName}ClientOptions} options - Spreadsheet id and model configuration.`,
  "@example",
  FENCE,
  "const gassma = new GassmaClient()",
  FENCE,
  "",
  FENCE,
  'const gassma = new GassmaClient({ id: "<spreadsheet id>" })',
  FENCE,
];

const transactionDocLines = (model: string) => [
  "Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.",
  `Read more here: ${REFERENCE_BASE_URL}/reference/transaction`,
  "@example",
  FENCE,
  "const [alice, bob] = gassma.$transaction((tx) => {",
  `  const alice = tx.${model}.create({ data: { ... } })`,
  `  const bob = tx.${model}.create({ data: { ... } })`,
  "  return [alice, bob]",
  "})",
  FENCE,
];

const EXTENDS_DOC_LINES = [
  "Creates an extended client with additional behaviour.",
  `Read more here: ${REFERENCE_BASE_URL}/reference/client-extensions/result`,
  "@example",
  FENCE,
  "const extended = gassma.$extends({",
  "  result: {",
  "    // ... provide result extensions here",
  "  }",
  "})",
  FENCE,
];

const TRANSACTION_CLIENT_DOC_LINES = [
  "`GassmaClient` proxy available in interactive transactions.",
];

const getClientDocs = (schemaName: string, sheetNames: string[]) => {
  const naming = getModelNaming(
    schemaName,
    sheetNames[0] ?? FALLBACK_MODEL,
    [],
  );
  const member = (lines: string[]) => renderDocBlock(MEMBER_INDENT, lines);

  return {
    transactionClient: renderDocBlock("", TRANSACTION_CLIENT_DOC_LINES),
    client: renderDocBlock(
      "",
      clientDocLines(naming.plural, naming.variablePlural, naming.accessor),
    ),
    constructor: member(constructorDocLines(schemaName)),
    transaction: member(transactionDocLines(naming.model)),
    extends: member(EXTENDS_DOC_LINES),
  };
};

export { getClientDocs };

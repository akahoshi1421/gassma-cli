import pluralize from "pluralize";
import { getRemovedCantUseVarChar } from "../../util/getRemovedCantUseVarChar";

type ModelNaming = {
  model: string;
  clean: string;
  plural: string;
  variable: string;
  variablePlural: string;
  accessor: string;
  prefix: string;
  field: string;
  fieldCapital: string;
};

const IDENTIFIER_PATTERN = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

const toLowerHead = (word: string) =>
  word.charAt(0).toLowerCase() + word.slice(1);

const toUpperHead = (word: string) =>
  word.charAt(0).toUpperCase() + word.slice(1);

const toAccessor = (model: string) =>
  IDENTIFIER_PATTERN.test(model)
    ? `gassma.${model}`
    : `gassma[${JSON.stringify(model)}]`;

const toSampleField = (columnNames: string[]) => {
  const first = columnNames[0];
  if (first === undefined) return "id";

  return first.at(-1) === "?" ? first.slice(0, -1) : first;
};

const getModelNaming = (
  schemaName: string,
  model: string,
  columnNames: string[],
): ModelNaming => {
  const clean = getRemovedCantUseVarChar(model);
  const variable = toLowerHead(clean);
  const field = toSampleField(columnNames);

  return {
    model,
    clean,
    plural: pluralize(model),
    variable,
    variablePlural: pluralize(variable),
    accessor: toAccessor(model),
    prefix: `Gassma${schemaName}${clean}`,
    field,
    fieldCapital: toUpperHead(field),
  };
};

export { getModelNaming };
export type { ModelNaming };

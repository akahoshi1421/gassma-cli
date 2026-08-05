import { isNumberColumn } from "../../util/isNumberColumn";
import { skipUnion } from "../util/skipUnion";

const getRemovedQuestionMark = (columnName: string) =>
  columnName.at(-1) === "?"
    ? columnName.substring(0, columnName.length - 1)
    : columnName;

const getAggregateObject = (columnNames: string[], sk: string) => {
  const fields = columnNames
    .map(
      (columnName) =>
        `"${getRemovedQuestionMark(columnName)}"?: "asc" | "desc"${sk}`,
    )
    .join("; ");

  return `{ ${fields} }`;
};

const getOneGassmaOrderByWithAggregation = (
  sheetContent: Record<string, unknown[]>,
  schemaName: string,
  sheetName: string,
  strict?: boolean,
) => {
  const sk = skipUnion(strict);
  const columnNames = Object.keys(sheetContent);
  const numberColumnNames = columnNames.filter((columnName) =>
    isNumberColumn(sheetContent[columnName]),
  );

  const scalarLines = columnNames.reduce(
    (pre, columnName) =>
      `${pre}  "${getRemovedQuestionMark(columnName)}"?: "asc" | "desc" | Gassma.SortOrderInput${sk};\n`,
    "",
  );

  const allObject = getAggregateObject(columnNames, sk);
  const numberObject = getAggregateObject(numberColumnNames, sk);
  const numberLine = (aggregate: string) =>
    numberColumnNames.length === 0
      ? ""
      : `  "${aggregate}"?: ${numberObject}${sk};\n`;

  const aggregateLines = `${numberLine("_avg")}  "_count"?: ${allObject}${sk};
  "_max"?: ${allObject}${sk};
  "_min"?: ${allObject}${sk};
${numberLine("_sum")}`;

  return `\nexport type Gassma${schemaName}${sheetName}OrderByWithAggregation = {\n${scalarLines}${aggregateLines}};\n`;
};

export { getOneGassmaOrderByWithAggregation };

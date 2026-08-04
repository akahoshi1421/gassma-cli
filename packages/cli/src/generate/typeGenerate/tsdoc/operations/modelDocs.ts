import { REFERENCE_BASE_URL } from "../docBlock";
import type { ModelNaming } from "../modelNaming";

const controllerClassDocLines = ({ model }: ModelNaming) => [
  `The delegate class that exposes CRUD operations for the **${model}** model.`,
];

const fieldsDocLines = ({ model }: ModelNaming) => [
  `Fields of the ${model} model`,
];

const changeSettingsDocLines = () => [
  "Change the range this model reads and writes on the spreadsheet.",
  `Read more here: ${REFERENCE_BASE_URL}/reference/settings/changeSettings`,
  "@param {number} startRowNumber - The row number the header row lives on.",
  "@param {number | string} startColumnValue - The first column of the range.",
  "@param {number | string} endColumnValue - The last column of the range.",
];

const sheetPropertyDocLines = ({
  accessor,
  model,
  plural,
  variablePlural,
}: ModelNaming) => [
  `\`${accessor}\`: Exposes CRUD operations for the **${model}** model.`,
  "Example usage:",
  "```ts",
  `// Fetch zero or more ${plural}`,
  `const ${variablePlural} = ${accessor}.findMany()`,
  "```",
];

const rowTypeDocLines = ({ model }: ModelNaming) => [`Model ${model}`, ""];

export {
  changeSettingsDocLines,
  controllerClassDocLines,
  fieldsDocLines,
  rowTypeDocLines,
  sheetPropertyDocLines,
};

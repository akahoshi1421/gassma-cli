import { REFERENCE_BASE_URL } from "../docBlock";
import type { ModelNaming } from "../modelNaming";

const AUTOINCREMENT_LINK = `Read more here: ${REFERENCE_BASE_URL}/reference/config/autoincrement`;

const ROLLBACK_NOTE =
  "Throws `GassmaAutoincrementInTransactionError` inside `$transaction`, because the counter is never rolled back.";

const getAutoincrementDocLines = (
  { accessor, model }: ModelNaming,
  fields: string[],
) => {
  const field = fields[0];
  const paramField = `@param {string} field - An autoincrement field of ${model}.`;
  const noFieldNote = `${model} has no autoincrement field, so this cannot be called.`;
  const body = (usable: string[], example: string[]) =>
    field === undefined
      ? [noFieldNote, AUTOINCREMENT_LINK]
      : [...usable, AUTOINCREMENT_LINK, ...example];

  return {
    getAutoincrement: [
      `Get the value the next \`create\` will issue for an autoincrement field of ${model}.`,
      ...body(
        [
          "Reading the counter is allowed inside `$transaction`.",
          "Throws `GassmaAutoincrementNotConfiguredError` when the field is not an autoincrement field.",
        ],
        [
          paramField,
          "@example",
          `// The ${field} the next ${model} will get`,
          `const next = ${accessor}.$getAutoincrement("${field}")`,
        ],
      ),
    ],
    setAutoincrement: [
      `Set the value the next \`create\` will issue for an autoincrement field of ${model}.`,
      ...body(
        [
          "`next` is the value that will be issued next, so it must be an integer of 1 or more.",
          ROLLBACK_NOTE,
        ],
        [
          paramField,
          "@param {number} next - The value the next `create` will issue.",
          "@example",
          `// Let the next ${model} continue from 1000`,
          `${accessor}.$setAutoincrement("${field}", 1000)`,
        ],
      ),
    ],
    syncAutoincrement: [
      `Line the counter of ${model} up with the rows already in the sheet.`,
      ...body(
        [
          "The counter becomes the largest value in the column plus one, which is also the return value.",
          ROLLBACK_NOTE,
        ],
        [
          paramField,
          "@example",
          "// Adopt a sheet that already has rows",
          `const next = ${accessor}.$syncAutoincrement("${field}")`,
        ],
      ),
    ],
  };
};

export { getAutoincrementDocLines };

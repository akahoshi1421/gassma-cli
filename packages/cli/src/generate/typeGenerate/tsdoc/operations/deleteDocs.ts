import { REFERENCE_BASE_URL } from "../docBlock";
import type { ModelNaming } from "../modelNaming";
import { WHERE_LINES } from "./readDocs";

const DELETE_BASE = `${REFERENCE_BASE_URL}/reference/crud/delete`;
const DELETE_ALL_WARNING =
  "Calling `deleteMany` without arguments deletes **all** rows in the sheet. This cannot be undone.";

const getDeleteDocLines = (naming: ModelNaming) => {
  const { accessor, clean, model, plural, prefix } = naming;

  return {
    deleteSingle: [
      `Delete a ${model}.`,
      `Read more here: ${DELETE_BASE}/delete`,
      `@param {${prefix}DeleteSingleData} deleteData - Arguments to delete one ${model}.`,
      "@example",
      `// Delete one ${model}`,
      `const ${clean} = ${accessor}.delete({`,
      "  where: {",
      `    // ... filter to delete one ${model}`,
      "  }",
      "})",
      "",
    ],
    deleteMany: [
      `Delete zero or more ${plural}.`,
      `Read more here: ${DELETE_BASE}/deleteMany`,
      `@param {${prefix}DeleteData} deleteData - Arguments to filter ${plural} to delete.`,
      "@example",
      `// Delete a few ${plural}`,
      `const { count } = ${accessor}.deleteMany({`,
      ...WHERE_LINES,
      "})",
      "",
    ],
    deleteManyNoArgs: [
      `Delete every ${model}.`,
      DELETE_ALL_WARNING,
      `Read more here: ${DELETE_BASE}/deleteMany`,
      "@example",
      `// Delete every ${model} in the sheet`,
      `const { count } = ${accessor}.deleteMany()`,
    ],
  };
};

export { getDeleteDocLines };

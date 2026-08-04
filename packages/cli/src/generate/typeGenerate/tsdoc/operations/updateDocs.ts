import { REFERENCE_BASE_URL } from "../docBlock";
import type { ModelNaming } from "../modelNaming";
import { UNDEFINED_NOTE } from "./readDocs";

const UPDATE_BASE = `${REFERENCE_BASE_URL}/reference/crud/update`;
const DATA_LINES = ["  data: {", "    // ... provide data here", "  }"];
const WHERE_THEN_DATA = [
  "  where: {",
  "    // ... provide filter here",
  "  },",
  ...DATA_LINES,
];

const getUpdateDocLines = (naming: ModelNaming) => {
  const { accessor, field, fieldCapital, model, plural, prefix } = naming;
  const { variable, variablePlural } = naming;

  return {
    update: [
      `Update one ${model}.`,
      `Read more here: ${UPDATE_BASE}/update`,
      `@param {${prefix}UpdateSingleData} updateData - Arguments to update one ${model}.`,
      "@example",
      `// Update one ${model}`,
      `const ${variable} = ${accessor}.update({`,
      ...WHERE_THEN_DATA,
      "})",
      "",
    ],
    updateMany: [
      `Update zero or more ${plural}.`,
      UNDEFINED_NOTE,
      `Read more here: ${UPDATE_BASE}/updateMany`,
      `@param {${prefix}UpdateData} updateData - Arguments to update one or more rows.`,
      "@example",
      `// Update many ${plural}`,
      `const { count } = ${accessor}.updateMany({`,
      ...WHERE_THEN_DATA,
      "})",
      "",
    ],
    updateManyAndReturn: [
      `Update zero or more ${plural} and returns the data updated in the spreadsheet.`,
      UNDEFINED_NOTE,
      `Read more here: ${UPDATE_BASE}/updateManyAndReturn`,
      `@param {${prefix}UpdateManyAndReturnData} updateData - Arguments to update many ${plural}.`,
      "@example",
      `// Update many ${plural}`,
      `const ${variablePlural} = ${accessor}.updateManyAndReturn({`,
      ...WHERE_THEN_DATA,
      "})",
      "",
      `// Update zero or more ${plural} and only return the \`${field}\``,
      `const ${variable}With${fieldCapital}Only = ${accessor}.updateManyAndReturn({`,
      `  select: { ${field}: true },`,
      ...WHERE_THEN_DATA,
      "})",
      "",
    ],
    upsert: [
      `Create or update one ${model}.`,
      `Read more here: ${UPDATE_BASE}/upsert`,
      `@param {${prefix}UpsertSingleData} upsertData - Arguments to update or create a ${model}.`,
      "@example",
      `// Update or create a ${model}`,
      `const ${variable} = ${accessor}.upsert({`,
      "  create: {",
      `    // ... data to create a ${model}`,
      "  },",
      "  update: {",
      "    // ... in case it already exists, update",
      "  },",
      "  where: {",
      `    // ... the filter for the ${model} we want to update`,
      "  }",
      "})",
    ],
  };
};

export { getUpdateDocLines };

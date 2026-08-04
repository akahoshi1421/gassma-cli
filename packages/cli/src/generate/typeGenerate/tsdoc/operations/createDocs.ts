import { REFERENCE_BASE_URL } from "../docBlock";
import type { ModelNaming } from "../modelNaming";

const CREATE_BASE = `${REFERENCE_BASE_URL}/reference/crud/create`;

const dataArrayLines = ["  data: [", "    // ... provide data here", "  ]"];

const getCreateDocLines = (naming: ModelNaming) => {
  const { accessor, clean, field, fieldCapital, model, plural, variable } =
    naming;

  return {
    createMany: [
      `Create many ${plural}.`,
      `Read more here: ${CREATE_BASE}/createMany`,
      `@param {${naming.prefix}CreateManyData} createdData - Arguments to create many ${plural}.`,
      "@example",
      `// Create many ${plural}`,
      `const ${variable} = ${accessor}.createMany({`,
      ...dataArrayLines,
      "})",
      "",
    ],
    createManyAndReturn: [
      `Create many ${plural} and returns the data saved in the spreadsheet.`,
      "Note, that providing `undefined` is treated as the value not being there.",
      `Read more here: ${CREATE_BASE}/createManyAndReturn`,
      `@param {${naming.prefix}CreateManyAndReturnData} createdData - Arguments to create many ${plural}.`,
      "@example",
      `// Create many ${plural}`,
      `const ${variable} = ${accessor}.createManyAndReturn({`,
      ...dataArrayLines,
      "})",
      "",
      `// Create many ${plural} and only return the \`${field}\``,
      `const ${variable}With${fieldCapital}Only = ${accessor}.createManyAndReturn({`,
      `  select: { ${field}: true },`,
      ...dataArrayLines,
      "})",
      "",
    ],
    create: [
      `Create a ${model}.`,
      `Read more here: ${CREATE_BASE}/create`,
      `@param {${naming.prefix}CreateData} createdData - Arguments to create a ${model}.`,
      "@example",
      `// Create one ${model}`,
      `const ${clean} = ${accessor}.create({`,
      "  data: {",
      `    // ... data to create a ${model}`,
      "  }",
      "})",
      "",
    ],
  };
};

export { getCreateDocLines };

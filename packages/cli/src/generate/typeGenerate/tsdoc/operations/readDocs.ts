import { REFERENCE_BASE_URL } from "../docBlock";
import type { ModelNaming } from "../modelNaming";

const READ_BASE = `${REFERENCE_BASE_URL}/reference/crud/read`;
const UNDEFINED_NOTE =
  "Note, that providing `undefined` is treated as the value not being there.";
const WHERE_LINES = ["  where: {", "    // ... provide filter here", "  }"];

const getReadDocLines = (naming: ModelNaming) => {
  const { accessor, field, fieldCapital, model, plural, prefix } = naming;
  const { variable, variablePlural } = naming;

  const findOne = (operation: string, head: string[]) => [
    ...head,
    UNDEFINED_NOTE,
    `Read more here: ${READ_BASE}/${operation}`,
    `@param {${prefix}FindFirstData} findData - Arguments to find a ${model}`,
    "@example",
    `// Get one ${model}`,
    `const ${variable} = ${accessor}.${operation}({`,
    ...WHERE_LINES,
    "})",
  ];

  const findOneNoArgs = (operation: string, head: string) => [
    head,
    `Read more here: ${READ_BASE}/${operation}`,
    "@example",
    `// Get the first ${model}`,
    `const ${variable} = ${accessor}.${operation}()`,
  ];

  return {
    findFirst: findOne("findFirst", [
      `Find the first ${model} that matches the filter.`,
    ]),
    findFirstNoArgs: findOneNoArgs("findFirst", `Find the first ${model}.`),
    findFirstOrThrow: findOne("findFirstOrThrow", [
      `Find the first ${model} that matches the filter or`,
      "throw `NotFoundError` if no matches were found.",
    ]),
    findFirstOrThrowNoArgs: findOneNoArgs(
      "findFirstOrThrow",
      `Find the first ${model} or throw \`NotFoundError\` if no ${plural} exist.`,
    ),
    findMany: [
      `Find zero or more ${plural} that matches the filter.`,
      UNDEFINED_NOTE,
      `Read more here: ${READ_BASE}/findMany`,
      `@param {${prefix}FindManyData} findData - Arguments to filter and select certain fields only.`,
      "@example",
      `// Get all ${plural}`,
      `const ${variablePlural} = ${accessor}.findMany()`,
      "",
      `// Get first 10 ${plural}`,
      `const ${variablePlural} = ${accessor}.findMany({ take: 10 })`,
      "",
      `// Only select the \`${field}\``,
      `const ${variable}With${fieldCapital}Only = ${accessor}.findMany({ select: { ${field}: true } })`,
      "",
    ],
    findManyNoArgs: [
      `Find all ${plural}.`,
      `Read more here: ${READ_BASE}/findMany`,
      "@example",
      `// Get all ${plural}`,
      `const ${variablePlural} = ${accessor}.findMany()`,
    ],
  };
};

export { getReadDocLines, UNDEFINED_NOTE, WHERE_LINES };

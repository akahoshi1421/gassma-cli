import { REFERENCE_BASE_URL } from "../docBlock";
import type { ModelNaming } from "../modelNaming";
import { UNDEFINED_NOTE } from "./readDocs";

const STATISTICS_BASE = `${REFERENCE_BASE_URL}/reference/statistics`;

const getStatisticsDocLines = (naming: ModelNaming) => {
  const { accessor, field, model, plural, prefix } = naming;

  return {
    aggregate: [
      `Allows you to perform aggregations operations on a ${model}.`,
      UNDEFINED_NOTE,
      `Read more here: ${STATISTICS_BASE}/aggregate`,
      `@param {${prefix}AggregateData} aggregateData - Select which aggregations you would like to apply and on what fields.`,
      "@example",
      `// Count the ${plural} that match the filter`,
      `const aggregations = ${accessor}.aggregate({`,
      "  _count: true,",
      "  where: {",
      "    // ... provide filter here",
      "  },",
      "  take: 10,",
      "})",
    ],
    count: [
      `Count the number of ${plural}.`,
      UNDEFINED_NOTE,
      `Read more here: ${STATISTICS_BASE}/count`,
      `@param {${prefix}CountData} coutData - Arguments to filter ${plural} to count.`,
      "@example",
      `// Count the number of ${plural}`,
      `const count = ${accessor}.count({`,
      "  where: {",
      `    // ... the filter for the ${plural} we want to count`,
      "  }",
      "})",
    ],
    countNoArgs: [
      `Count every ${model}.`,
      `Read more here: ${STATISTICS_BASE}/count`,
      "@example",
      `// Count every ${model}`,
      `const count = ${accessor}.count()`,
    ],
    groupBy: [
      `Group by ${model}.`,
      UNDEFINED_NOTE,
      `Read more here: ${STATISTICS_BASE}/groupBy`,
      `@param {${prefix}GroupByData} groupByData - Group by arguments.`,
      "@example",
      `// Group by ${field}, get count`,
      `const result = ${accessor}.groupBy({`,
      `  by: ['${field}'],`,
      "  _count: true,",
      "})",
      "",
    ],
  };
};

export { getStatisticsDocLines };

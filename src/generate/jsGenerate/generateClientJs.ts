import type { RelationsConfig } from "../read/extractRelations";

const generateClientJs = (relations: RelationsConfig): string => {
  const relationsJson =
    Object.keys(relations).length === 0
      ? "{}"
      : JSON.stringify(relations, null, 2);

  return `const relations = ${relationsJson};

function createGassmaClient(options) {
  const mergedOptions = Object.assign({}, options, { relations: relations });
  return new Gassma.GassmaClient(mergedOptions);
}
`;
};

export { generateClientJs };

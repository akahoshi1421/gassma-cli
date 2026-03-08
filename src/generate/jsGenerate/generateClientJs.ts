import type { RelationsConfig } from "../read/extractRelations";

const generateClientJs = (
  relations: RelationsConfig,
  schemaName: string,
): string => {
  const lowerName = schemaName.charAt(0).toLowerCase() + schemaName.slice(1);
  const relationsJson =
    Object.keys(relations).length === 0
      ? "{}"
      : JSON.stringify(relations, null, 2);

  return `const ${lowerName}Relations = ${relationsJson};

function createGassma${schemaName}Client(options) {
  var mergedOptions = Object.assign({}, options, { relations: ${lowerName}Relations });
  return new Gassma.GassmaClient(mergedOptions);
}
`;
};

export { generateClientJs };

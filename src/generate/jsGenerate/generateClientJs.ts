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

class GassmaClient {
  constructor(options) {
    const mergedOptions = Object.assign({}, options, { relations: ${lowerName}Relations });
    const client = new Gassma.GassmaClient(mergedOptions);
    this.sheets = client.sheets;
  }
}

exports.GassmaClient = GassmaClient;
`;
};

export { generateClientJs };

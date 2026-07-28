// prismaReader drops @ignore fields and @@ignore models, but Prisma keeps
// them in the database schema, so migrate parses an ignore-free copy.
const stripIgnoreAttributes = (schemaText: string): string =>
  schemaText.replace(/@@ignore\b/g, "").replace(/@ignore\b/g, "");

export { stripIgnoreAttributes };

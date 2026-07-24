import { parsePrismaSchema } from "@loancrate/prisma-schema-parser";
import type { ModelDeclaration } from "@loancrate/prisma-schema-parser";

type AddTypesConfig = {
  [modelName: string]: {
    [fieldName: string]: string[];
  };
};

const GASSMA_ADD_TYPE_PREFIX = "@gassma.addType ";
const GASSMA_REPLACE_TYPE_PREFIX = "@gassma.replaceType ";

const extractAddTypes = (schemaText: string): AddTypesConfig =>
  extractByPrefix(schemaText, GASSMA_ADD_TYPE_PREFIX);

const extractByPrefix = (
  schemaText: string,
  prefix: string,
): AddTypesConfig => {
  const ast = parsePrismaSchema(schemaText);
  const result: AddTypesConfig = {};

  ast.declarations.forEach((decl) => {
    if (decl.kind !== "model") return;
    processModel(decl, result, prefix);
  });

  return result;
};

const extractReplaceTypes = (schemaText: string): AddTypesConfig =>
  extractByPrefix(schemaText, GASSMA_REPLACE_TYPE_PREFIX);

const processModel = (
  model: ModelDeclaration,
  result: AddTypesConfig,
  prefix: string,
): void => {
  const members = model.members;

  members.forEach((member, index) => {
    if (member.kind !== "commentBlock") return;

    const nextMember = members[index + 1];
    if (!nextMember || nextMember.kind !== "field") return;

    member.comments.forEach((comment) => {
      if (comment.kind !== "docComment") return;
      if (!comment.text.startsWith(prefix)) return;

      const typesString = comment.text.slice(prefix.length);
      const types = typesString
        .split(",")
        .map((t) => t.trim().replace(/^"|"$/g, ""));

      if (!result[model.name.value]) result[model.name.value] = {};
      result[model.name.value][nextMember.name.value] = types;
    });
  });
};

export { extractAddTypes, extractReplaceTypes };
export type { AddTypesConfig };

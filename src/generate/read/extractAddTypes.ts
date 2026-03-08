import { parsePrismaSchema } from "@loancrate/prisma-schema-parser";
import type { ModelDeclaration } from "@loancrate/prisma-schema-parser";

type AddTypesConfig = {
  [modelName: string]: {
    [fieldName: string]: string[];
  };
};

const GASSMA_ADD_TYPE_PREFIX = "@gassma.addType ";

const extractAddTypes = (schemaText: string): AddTypesConfig => {
  const ast = parsePrismaSchema(schemaText);
  const result: AddTypesConfig = {};

  ast.declarations.forEach((decl) => {
    if (decl.kind !== "model") return;
    processModel(decl, result);
  });

  return result;
};

const processModel = (
  model: ModelDeclaration,
  result: AddTypesConfig,
): void => {
  const members = model.members;

  members.forEach((member, index) => {
    if (member.kind !== "commentBlock") return;

    const nextMember = members[index + 1];
    if (!nextMember || nextMember.kind !== "field") return;

    member.comments.forEach((comment) => {
      if (comment.kind !== "docComment") return;
      if (!comment.text.startsWith(GASSMA_ADD_TYPE_PREFIX)) return;

      const typesString = comment.text.slice(GASSMA_ADD_TYPE_PREFIX.length);
      const types = typesString.split(",").map((t) => t.trim());

      if (!result[model.name.value]) result[model.name.value] = {};
      result[model.name.value][nextMember.name.value] = types;
    });
  });
};

export { extractAddTypes };
export type { AddTypesConfig };

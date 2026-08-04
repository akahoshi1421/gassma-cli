import {
  parsePrismaSchema,
  findFirstAttribute,
} from "@loancrate/prisma-schema-parser";
import type { ModelDeclaration } from "@loancrate/prisma-schema-parser";
import { getFieldReferences } from "./relationHelpers";

type OptionalRelationsConfig = Record<string, string[]>;

const collectOptionalRelationFields = (model: ModelDeclaration): string[] => {
  const fieldNames: string[] = [];

  model.members.forEach((member) => {
    if (member.kind !== "field") return;
    if (member.type.kind !== "optional") return;
    if (member.type.type.kind !== "typeId") return;

    const attr = findFirstAttribute(member.attributes, "relation");
    if (!attr) return;
    if (!getFieldReferences(attr.args, "fields")) return;
    if (!getFieldReferences(attr.args, "references")) return;

    fieldNames.push(member.name.value);
  });

  return fieldNames;
};

const extractOptionalRelations = (
  schemaText: string,
): OptionalRelationsConfig => {
  const ast = parsePrismaSchema(schemaText);
  const result: OptionalRelationsConfig = {};

  ast.declarations.forEach((decl) => {
    if (decl.kind !== "model") return;
    result[decl.name.value] = collectOptionalRelationFields(decl);
  });

  return result;
};

export { extractOptionalRelations };
export type { OptionalRelationsConfig };

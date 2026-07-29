import { findFirstAttribute } from "@loancrate/prisma-schema-parser";
import type {
  FieldDeclaration,
  ModelDeclaration,
} from "@loancrate/prisma-schema-parser";
import type { RelationsConfig } from "./extractRelations";
import { getFieldReferences } from "./relationHelpers";

const toLowercaseFirst = (s: string): string =>
  s.charAt(0).toLowerCase() + s.slice(1);

const isSelfSideA = (
  model: ModelDeclaration,
  member: FieldDeclaration,
): boolean => {
  const partner = model.members.find((m): m is FieldDeclaration => {
    if (m.kind !== "field") return false;
    if (m === member) return false;
    if (m.type.kind !== "list") return false;
    const t = m.type.type;
    return t.kind === "typeId" && t.name.value === model.name.value;
  });
  if (!partner) return true;
  return member.name.value < partner.name.value;
};

const buildThroughColumns = (
  modelA: ModelDeclaration,
  member: FieldDeclaration,
  targetName: string,
): { field: string; reference: string } => {
  if (modelA.name.value !== targetName)
    return {
      field: `${toLowercaseFirst(modelA.name.value)}Id`,
      reference: `${toLowercaseFirst(targetName)}Id`,
    };

  const base = toLowercaseFirst(targetName);
  return isSelfSideA(modelA, member)
    ? { field: `${base}AId`, reference: `${base}BId` }
    : { field: `${base}BId`, reference: `${base}AId` };
};

const detectImplicitManyToMany = (
  models: ModelDeclaration[],
  result: RelationsConfig,
): void => {
  models.forEach((modelA) => {
    modelA.members.forEach((member) => {
      if (member.kind !== "field") return;
      if (member.type.kind !== "list") return;

      const targetType = member.type.type;
      if (targetType.kind !== "typeId") return;
      const targetName = targetType.name.value;

      if (result[modelA.name.value]?.[member.name.value]) return;

      const attr = findFirstAttribute(member.attributes, "relation");
      if (attr) {
        const fields = getFieldReferences(attr.args, "fields");
        if (fields) return;
      }

      const modelB = models.find((m) => m.name.value === targetName);
      if (!modelB) return;

      const inverseField = modelB.members.find((m) => {
        if (m.kind !== "field") return false;
        if (m.type.kind !== "list") return false;
        const bt = m.type.type;
        return bt.kind === "typeId" && bt.name.value === modelA.name.value;
      });
      if (!inverseField || inverseField.kind !== "field") return;

      const sorted = [modelA.name.value, targetName].sort();
      const throughSheet = `_${sorted[0]}To${sorted[1]}`;

      if (!result[modelA.name.value]) result[modelA.name.value] = {};
      result[modelA.name.value][member.name.value] = {
        type: "manyToMany",
        to: targetName,
        field: "id",
        reference: "id",
        through: {
          sheet: throughSheet,
          ...buildThroughColumns(modelA, member, targetName),
        },
      };
    });
  });
};

export { detectImplicitManyToMany };

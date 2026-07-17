import { parsePrismaSchema } from "@loancrate/prisma-schema-parser";
import type { FieldDeclaration } from "@loancrate/prisma-schema-parser";
import { findDefaultFieldAttribute } from "@loancrate/prisma-schema-parser/dist/attributes";
import { extractEnums } from "./extractEnums";
import type { EnumsConfig } from "./extractEnums";

type StaticDefault = {
  kind: "static";
  value: string | number | boolean;
};

type FunctionDefault = {
  kind: "function";
  name: string;
};

type DefaultInfo = StaticDefault | FunctionDefault;

type DefaultsConfig = {
  [modelName: string]: {
    [fieldName: string]: DefaultInfo;
  };
};

const SKIP_FUNCTIONS = ["autoincrement"];

const resolveFieldTypeName = (field: FieldDeclaration): string | undefined => {
  const { type } = field;
  if (type.kind === "list") return undefined;
  const baseType =
    type.kind === "optional" || type.kind === "required" ? type.type : type;
  if (baseType.kind === "unsupported") return undefined;
  return baseType.name.value;
};

const resolveEnumValue = (
  field: FieldDeclaration,
  valueName: string,
  enums: EnumsConfig,
): string | undefined => {
  const typeName = resolveFieldTypeName(field);
  if (!typeName) return undefined;
  const entries = enums[typeName];
  if (!entries) return undefined;
  const entry = entries.find((e) => e.name === valueName);
  return entry?.value;
};

const extractDefaults = (schemaText: string): DefaultsConfig => {
  const ast = parsePrismaSchema(schemaText);
  const enums = extractEnums(schemaText);
  const result: DefaultsConfig = {};

  ast.declarations.forEach((decl) => {
    if (decl.kind !== "model") return;

    const modelDefaults: Record<string, DefaultInfo> = {};

    decl.members.forEach((member) => {
      if (member.kind !== "field") return;

      const defaultAttr = findDefaultFieldAttribute(member);
      if (!defaultAttr) return;

      const expr = defaultAttr.expression;

      if (expr.kind === "literal") {
        modelDefaults[member.name.value] = {
          kind: "static",
          value: expr.value,
        };
        return;
      }

      if (expr.kind === "path") {
        const value = resolveEnumValue(member, expr.value[0], enums);
        if (value === undefined) return;
        modelDefaults[member.name.value] = { kind: "static", value };
        return;
      }

      if (expr.kind === "functionCall") {
        const funcName = expr.path.value[0];
        if (SKIP_FUNCTIONS.indexOf(funcName) !== -1) return;
        modelDefaults[member.name.value] = {
          kind: "function",
          name: funcName,
        };
      }
    });

    if (Object.keys(modelDefaults).length > 0) {
      result[decl.name.value] = modelDefaults;
    }
  });

  return result;
};

export { extractDefaults };
export type { DefaultsConfig, DefaultInfo, StaticDefault, FunctionDefault };

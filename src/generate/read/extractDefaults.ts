import { parsePrismaSchema } from "@loancrate/prisma-schema-parser";
import { findDefaultFieldAttribute } from "@loancrate/prisma-schema-parser/dist/attributes";

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

const extractDefaults = (schemaText: string): DefaultsConfig => {
  const ast = parsePrismaSchema(schemaText);
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

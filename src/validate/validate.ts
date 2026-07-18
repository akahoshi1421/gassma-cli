import { parsePrismaSchema } from "@loancrate/prisma-schema-parser";
import { countModelsInAst } from "../generate/read/countModels";

type ValidationError = {
  type: "syntax" | "missingGenerator" | "missingOutput" | "noModels";
  message: string;
};

type ValidationResult = {
  valid: boolean;
  errors: ValidationError[];
};

const validateSchema = (schemaText: string): ValidationResult => {
  const errors: ValidationError[] = [];

  try {
    const ast = parsePrismaSchema(schemaText);

    let hasGenerator = false;

    ast.declarations.forEach((decl) => {
      if (decl.kind !== "generator") return;
      hasGenerator = true;

      const hasOutput = decl.members.some(
        (member) => member.kind === "config" && member.name.value === "output",
      );

      if (!hasOutput) {
        errors.push({
          type: "missingOutput",
          message:
            'Generator block is missing "output" field. Please specify the output directory.',
        });
      }
    });

    if (!hasGenerator) {
      errors.push({
        type: "missingGenerator",
        message: "No generator block found. A generator block is required.",
      });
    }

    if (countModelsInAst(ast) === 0) {
      errors.push({
        type: "noModels",
        message:
          "You don't have any models defined in your schema, so nothing will be generated. At least one model is required.",
      });
    }
  } catch (e) {
    errors.push({
      type: "syntax",
      message: e instanceof Error ? e.message : "Unknown syntax error",
    });
  }

  return { valid: errors.length === 0, errors };
};

export { validateSchema };
export type { ValidationResult, ValidationError };

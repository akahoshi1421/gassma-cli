import { parsePrismaSchema } from "@loancrate/prisma-schema-parser";
import { IgnoredRelationColumnError } from "../error/mainError";
import { countModelsInAst } from "../generate/read/countModels";
import { collectUnsupportedAttributes } from "../generate/read/assertNoUnsupportedAttributes";
import { collectCompositeRelations } from "../generate/read/assertNoCompositeRelations";
import { extractRelations } from "../generate/read/extractRelations";

type ValidationError = {
  type:
    | "syntax"
    | "missingGenerator"
    | "missingOutput"
    | "noModels"
    | "ignoredRelationColumn"
    | "unsupportedAttribute"
    | "compositeRelation";
  message: string;
};

type ValidationResult = {
  valid: boolean;
  errors: ValidationError[];
};

const collectIgnoredRelationColumnErrors = (
  schemaText: string,
): ValidationError[] => {
  try {
    extractRelations(schemaText);
  } catch (e) {
    if (e instanceof IgnoredRelationColumnError) {
      return e.details.map((message) => ({
        type: "ignoredRelationColumn",
        message,
      }));
    }
  }
  return [];
};

const collectUnsupportedAttributeErrors = (
  schemaText: string,
): ValidationError[] =>
  collectUnsupportedAttributes(schemaText).map((violation) => ({
    type: "unsupportedAttribute",
    message:
      `\`${violation.attribute}\` on ${violation.target} is not supported. ` +
      violation.reason.split("\n").join(" "),
  }));

const collectCompositeRelationErrors = (
  schemaText: string,
): ValidationError[] =>
  collectCompositeRelations(schemaText).map((violation) => ({
    type: "compositeRelation",
    message:
      `\`@relation\` on ${violation.target} spans more than one column ` +
      `(${violation.columns}), which is not supported yet. ` +
      violation.reason.split("\n").join(" "),
  }));

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

    errors.push(...collectIgnoredRelationColumnErrors(schemaText));
    errors.push(...collectUnsupportedAttributeErrors(schemaText));
    errors.push(...collectCompositeRelationErrors(schemaText));
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

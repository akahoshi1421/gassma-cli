const skipUnion = (strict?: boolean): string =>
  strict ? " | Gassma.SkipValue" : "";

const skipOptionalWrap = (typeExpr: string, strict?: boolean): string =>
  strict ? `Gassma.SkipOptional<${typeExpr}>` : typeExpr;

export { skipUnion, skipOptionalWrap };

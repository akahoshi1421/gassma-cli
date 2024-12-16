const getOneColumnType = (columType: unknown) => {
  if (typeof columType === "string") {
    switch (columType) {
      case "number":
      case "string":
      case "Date":
      case "boolean":
        return columType;
      case "{{number}}":
        return "number";
      case "{{Date}}":
        return "Date";
      case "{{boolean}}":
        return "boolean";
      default:
        return `"${columType}"`;
    }
  }

  return columType;
};

export { getOneColumnType };

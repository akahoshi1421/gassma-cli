const getOneColumnType = (columType: unknown) => {
  if (typeof columType === "string") {
    switch (columType) {
      case "number":
      case "number?":
      case "string":
      case "string?":
      case "Date":
      case "Date?":
      case "boolean":
      case "boolean?":
        return columType;
      default:
        return `"${columType}"`;
    }
  }

  return columType;
};

export { getOneColumnType };

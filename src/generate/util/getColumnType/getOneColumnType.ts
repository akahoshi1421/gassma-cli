const getOneColumnType = (columnType: unknown) => {
  if (typeof columnType === "string") {
    switch (columnType) {
      case "number":
      case "string":
      case "Date":
      case "boolean":
        return columnType;
      case "{{number}}":
        return `"number"`;
      case "{{Date}}":
        return `"Date"`;
      case "{{boolean}}":
        return `"boolean"`;
      default:
        return `"${columnType}"`;
    }
  }

  return columnType;
};

export { getOneColumnType };

const getOneAggregateColumnType = (columnType: unknown) => {
  if (typeof columnType === "string") {
    switch (columnType) {
      case "number":
      case "string":
      case "Date":
      case "boolean":
        return columnType;
      default:
        return "string";
    }
  }

  return typeof columnType;
};

export { getOneAggregateColumnType };

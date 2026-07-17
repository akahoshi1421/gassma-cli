const isNumberColumn = (columnTypes: unknown[]) =>
  columnTypes.some((oneType) => oneType === "number");

export { isNumberColumn };

const getGassmaManyCount = () => {
  return `
export type ManyReturn = {
  count: number;
};

export type CreateManyReturn = ManyReturn;
export type UpdateManyReturn = ManyReturn;
export type DeleteManyReturn = ManyReturn;
export type UpsertManyReturn = ManyReturn;
`;
};

export { getGassmaManyCount };

const getGassmaManyCount = () => {
  return `
declare type ManyReturn = {
  count: number;
};

declare type CreateManyReturn = ManyReturn;
declare type UpdateManyReturn = ManyReturn;
declare type DeleteManyReturn = ManyReturn;
declare type UpsertManyReturn = ManyReturn;
`;
};

export { getGassmaManyCount };

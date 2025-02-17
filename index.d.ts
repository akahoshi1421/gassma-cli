export declare namespace Gassma {
  class GassmaClient {
    constructor(id?: string);

    readonly sheets: GassmaSheet;
  }
}

export type GassmaSheet = {
  "シート1": Gassmaシート1Controller;
  "シート2": Gassmaシート2Controller;
};

export class Gassmaシート1Controller {
  constructor(sheetName: string, id?: string);

  changeSettings(
    startRowNumber: number,
    startColumnNumber: number,
    endColumnNumber: number
  ): void;
  createMany(createdData: Gassmaシート1CreateManyData): CreateManyReturn;
  create(createdData: Gassmaシート1CreateData): Gassmaシート1CreateReturn;
  findFirst(findData: Gassmaシート1FindData): Gassmaシート1FindResult;
  findMany(findData: Gassmaシート1FindManyData): Gassmaシート1FindResult[];
  updateMany(updateData: Gassmaシート1UpdateData): UpdateManyReturn;
  upsert(upsertData: Gassmaシート1UpsertData): UpsertManyReturn;
  deleteMany(deleteData: Gassmaシート1DeleteData): DeleteManyReturn;
  aggregate(aggregateData: Gassmaシート1AggregateData): Gassmaシート1AggregateResult;
  count(coutData: Gassmaシート1CountData): number;
  groupBy(groupByData: Gassmaシート1GroupByData): Gassmaシート1GroupByResult[];
}

export class Gassmaシート2Controller {
  constructor(sheetName: string, id?: string);

  changeSettings(
    startRowNumber: number,
    startColumnNumber: number,
    endColumnNumber: number
  ): void;
  createMany(createdData: Gassmaシート2CreateManyData): CreateManyReturn;
  create(createdData: Gassmaシート2CreateData): Gassmaシート2CreateReturn;
  findFirst(findData: Gassmaシート2FindData): Gassmaシート2FindResult;
  findMany(findData: Gassmaシート2FindManyData): Gassmaシート2FindResult[];
  updateMany(updateData: Gassmaシート2UpdateData): UpdateManyReturn;
  upsert(upsertData: Gassmaシート2UpsertData): UpsertManyReturn;
  deleteMany(deleteData: Gassmaシート2DeleteData): DeleteManyReturn;
  aggregate(aggregateData: Gassmaシート2AggregateData): Gassmaシート2AggregateResult;
  count(coutData: Gassmaシート2CountData): number;
  groupBy(groupByData: Gassmaシート2GroupByData): Gassmaシート2GroupByResult[];
}

type ManyReturn = {
  count: number;
};

export type CreateManyReturn = ManyReturn;
export type UpdateManyReturn = ManyReturn;
export type DeleteManyReturn = ManyReturn;
export type UpsertManyReturn = ManyReturn;

export type Gassmaシート1Use = {
  "id"?: number;
  "name"?: "abc" | "def" | "hij";
  "hoge": 1 | 2;
};

export type Gassmaシート2Use = {
  "address": string;
  "created_at": Date;
  "is"?: boolean;
};

export type Gassmaシート1CreateData = {
  data: Gassmaシート1Use;
}

export type Gassmaシート2CreateData = {
  data: Gassmaシート2Use;
}

export type Gassmaシート1CreateManyData = {
  data: Gassmaシート1Use[];
}

export type Gassmaシート2CreateManyData = {
  data: Gassmaシート2Use[];
}

export type Gassmaシート1idFilterConditions = {
  equals?: number;
  not?: number;
  in?: number[];
  notIn?: number[];
  lt?: number;
  lte?: number;
  gt?: number;
  gte?: number;
  contains?: string;
  startsWith?: string;
  endsWith?: string;
}

export type Gassmaシート1nameFilterConditions = {
  equals?: "abc" | "def" | "hij";
  not?: "abc" | "def" | "hij";
  in?: ("abc" | "def" | "hij")[];
  notIn?: ("abc" | "def" | "hij")[];
  lt?: "abc" | "def" | "hij";
  lte?: "abc" | "def" | "hij";
  gt?: "abc" | "def" | "hij";
  gte?: "abc" | "def" | "hij";
  contains?: string;
  startsWith?: string;
  endsWith?: string;
}

export type Gassmaシート1hogeFilterConditions = {
  equals?: 1 | 2;
  not?: 1 | 2;
  in?: (1 | 2)[];
  notIn?: (1 | 2)[];
  lt?: 1 | 2;
  lte?: 1 | 2;
  gt?: 1 | 2;
  gte?: 1 | 2;
  contains?: string;
  startsWith?: string;
  endsWith?: string;
}

export type Gassmaシート2addressFilterConditions = {
  equals?: string;
  not?: string;
  in?: string[];
  notIn?: string[];
  lt?: string;
  lte?: string;
  gt?: string;
  gte?: string;
  contains?: string;
  startsWith?: string;
  endsWith?: string;
}

export type Gassmaシート2created_atFilterConditions = {
  equals?: Date;
  not?: Date;
  in?: Date[];
  notIn?: Date[];
  lt?: Date;
  lte?: Date;
  gt?: Date;
  gte?: Date;
  contains?: string;
  startsWith?: string;
  endsWith?: string;
}

export type Gassmaシート2isFilterConditions = {
  equals?: boolean;
  not?: boolean;
  in?: boolean[];
  notIn?: boolean[];
  lt?: boolean;
  lte?: boolean;
  gt?: boolean;
  gte?: boolean;
  contains?: string;
  startsWith?: string;
  endsWith?: string;
}

export type Gassmaシート1WhereUse = {
  "id"?: number | Gassmaシート1idFilterConditions;
  "name"?: "abc" | "def" | "hij" | Gassmaシート1nameFilterConditions;
  "hoge"?: 1 | 2 | Gassmaシート1hogeFilterConditions;

  AND?: Gassmaシート1WhereUse[] | Gassmaシート1WhereUse;
  OR?: Gassmaシート1WhereUse[];
  NOT?: Gassmaシート1WhereUse[] | Gassmaシート1WhereUse;
};

export type Gassmaシート2WhereUse = {
  "address"?: string | Gassmaシート2addressFilterConditions;
  "created_at"?: Date | Gassmaシート2created_atFilterConditions;
  "is"?: boolean | Gassmaシート2isFilterConditions;

  AND?: Gassmaシート2WhereUse[] | Gassmaシート2WhereUse;
  OR?: Gassmaシート2WhereUse[];
  NOT?: Gassmaシート2WhereUse[] | Gassmaシート2WhereUse;
};

export type Gassmaシート1UpdateData = {
  where?: Gassmaシート1WhereUse;
  data: Gassmaシート1Use;
}

export type Gassmaシート2UpdateData = {
  where?: Gassmaシート2WhereUse;
  data: Gassmaシート2Use;
}

export type Gassmaシート1UpsertData = {
  where: Gassmaシート1WhereUse;
  update: Gassmaシート1Use;
  data: Gassmaシート1Use;
}

export type Gassmaシート2UpsertData = {
  where: Gassmaシート2WhereUse;
  update: Gassmaシート2Use;
  data: Gassmaシート2Use;
}

export type Gassmaシート1DeleteData = {
  where: Gassmaシート1WhereUse;
}

export type Gassmaシート2DeleteData = {
  where: Gassmaシート2WhereUse;
}

export type Gassmaシート1OrderBy = {
  "id"?: "asc" | "desc";
  "name"?: "asc" | "desc";
  "hoge"?: "asc" | "desc";
};

export type Gassmaシート2OrderBy = {
  "address"?: "asc" | "desc";
  "created_at"?: "asc" | "desc";
  "is"?: "asc" | "desc";
};

export type Gassmaシート1CountData = {
  where?: Gassmaシート1WhereUse;
  orderBy?: Gassmaシート1OrderBy;
  take?: number;
  skip?: number;
}

export type Gassmaシート2CountData = {
  where?: Gassmaシート2WhereUse;
  orderBy?: Gassmaシート2OrderBy;
  take?: number;
  skip?: number;
}

export type Gassmaシート1CreateReturn = {
 id: number;
 name: "abc" | "def" | "hij";
 hoge: 1 | 2;
};

export type Gassmaシート2CreateReturn = {
 address: string;
 created_at: Date;
 is: boolean;
};

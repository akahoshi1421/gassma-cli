import { expectTypeOf } from "vitest";
import type {
  GassmaPostCreateData,
  GassmaPostUpdateData,
  GassmaPostUpdateSingleData,
  GassmaPostUse,
  GassmaUserCreateData,
  GassmaUserUpdateData,
  GassmaUserUpdateSingleData,
  GassmaUserUse,
} from "../__generated__/client";

// create 文脈の op キー集合ロック（本体 NESTED_WRITE_KEYS と一致）
{
  type UC = GassmaUserCreateData["data"];
  type PostsCreate = NonNullable<UC["posts"]>;
  expectTypeOf<keyof PostsCreate>().toEqualTypeOf<
    "create" | "createMany" | "connect" | "connectOrCreate"
  >();

  type ProfileCreate = NonNullable<UC["profile"]>;
  expectTypeOf<keyof ProfileCreate>().toEqualTypeOf<
    "create" | "connect" | "connectOrCreate"
  >();

  type PC = GassmaPostCreateData["data"];
  type TagsCreate = NonNullable<PC["tags"]>;
  expectTypeOf<keyof TagsCreate>().toEqualTypeOf<
    "create" | "connect" | "connectOrCreate"
  >();

  type AuthorCreate = Extract<PC, { author: unknown }>["author"];
  expectTypeOf<keyof AuthorCreate>().toEqualTypeOf<
    "create" | "connect" | "connectOrCreate"
  >();
}

// update 文脈の op キー集合ロック（relation 種別ごとに本体が処理する op のみ）
{
  type PU = GassmaPostUpdateSingleData["data"];
  type AuthorUpdate = NonNullable<PU["author"]>;
  expectTypeOf<keyof AuthorUpdate>().toEqualTypeOf<
    | "create"
    | "connect"
    | "connectOrCreate"
    | "update"
    | "delete"
    | "disconnect"
  >();

  type TagsUpdate = NonNullable<PU["tags"]>;
  expectTypeOf<keyof TagsUpdate>().toEqualTypeOf<
    "create" | "connect" | "connectOrCreate" | "disconnect" | "set"
  >();

  type UU = GassmaUserUpdateSingleData["data"];
  type PostsUpdate = NonNullable<UU["posts"]>;
  expectTypeOf<keyof PostsUpdate>().toEqualTypeOf<
    | "create"
    | "createMany"
    | "connect"
    | "connectOrCreate"
    | "update"
    | "delete"
    | "deleteMany"
    | "disconnect"
    | "set"
  >();

  type ProfileUpdate = NonNullable<UU["profile"]>;
  expectTypeOf<keyof ProfileUpdate>().toEqualTypeOf<
    | "create"
    | "connect"
    | "connectOrCreate"
    | "update"
    | "delete"
    | "disconnect"
  >();
}

// updateMany の data に relation キーは存在しない（scalar のみ）
{
  expectTypeOf<keyof GassmaUserUpdateData["data"]>().toEqualTypeOf<
    keyof GassmaUserUse
  >();
  expectTypeOf<keyof GassmaPostUpdateData["data"]>().toEqualTypeOf<
    keyof GassmaPostUse
  >();
}

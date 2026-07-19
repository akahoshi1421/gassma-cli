import type { GassmaClient } from "../__generated__/client";

declare const client: GassmaClient;

// 列指定は列番号でも列文字でも指定できる
{
  client.User.changeSettings(2, "BA", "BC");
  client.User.changeSettings(2, 1, 3);
  client.User.changeSettings(2, "A", 5);
}

// 列指定に boolean は指定できない
{
  // @ts-expect-error 列指定に boolean は指定できない
  client.User.changeSettings(2, true, 3);
}

// startRowNumber は number のみ
{
  // @ts-expect-error startRowNumber は number のみ
  client.User.changeSettings("2", 1, 3);
}

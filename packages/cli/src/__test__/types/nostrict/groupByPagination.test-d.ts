import { GassmaClient } from "../__generated__/client";

// strictNullChecks が off でも take / skip は orderBy を要求する
const client = new GassmaClient();

{
  // @ts-expect-error take を指定するなら orderBy も必要
  client.User.groupBy({ by: ["isActive"], _count: { id: true }, take: 10 });
}

{
  // @ts-expect-error skip を指定するなら orderBy も必要
  client.User.groupBy({ by: ["isActive"], skip: 0 });
}

{
  client.User.groupBy({
    by: ["isActive"],
    _count: { id: true },
    take: 10,
    orderBy: { isActive: "asc" },
  });
  client.User.groupBy({ by: ["isActive"], _count: { id: true } });
  client.User.findMany({ take: 10, skip: 5 });
}

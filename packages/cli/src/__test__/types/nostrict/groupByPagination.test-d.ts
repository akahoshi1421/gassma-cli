import { GassmaClient } from "../__generated__/client";

// strictNullChecks が off でも groupBy の2つの制約が効く
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
  // @ts-expect-error "age" は by に無い
  client.User.groupBy({ by: ["isActive"], orderBy: { age: "asc" } });
}

{
  client.User.groupBy({
    by: ["isActive"],
    _count: { id: true },
    take: 10,
    orderBy: { isActive: "asc" },
  });
  client.User.groupBy({
    by: ["isActive"],
    orderBy: { _count: { id: "desc" } },
  });
  client.User.groupBy({ by: ["isActive"], _count: { id: true } });
  client.User.findMany({ take: 10, skip: 5, orderBy: { age: "asc" } });
}

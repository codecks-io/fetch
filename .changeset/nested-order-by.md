---
"@codecks/fetch": patch
---

- A hasMany relation with `orderBy` below another relation is in the result type again. With
  `fetchFromRoot` that was every ordered relation, e.g. `account.cards` with `orderBy: "-createdAt"`,
  including `type: "first"`.
- `orderBy: {field: "createdAt", dir: "desc"}` is accepted; the object syntax was rejected for any
  field.
- A `baseUrl` without a trailing slash works; `dispatch` sent `https://api.codecks.iodispatch/…`.

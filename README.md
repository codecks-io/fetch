# @codecks/fetch

A type-safe query SDK for the [Codecks](https://www.codecks.io) API. Describe nested queries in a declarative DSL and get fully inferred TypeScript response types.

## Installation

```bash
npm install @codecks/fetch
```

## Getting started

```ts
import {buildFetchers} from "@codecks/fetch";

const {fetchFromRoot, fetchInstance, fetchInstances, fetchFromInstance} = buildFetchers({
  token: "cdxat_…",
});
```

`token` is an organization token (`cdxat_…`) or a personal token (`cdxut_…`). Create one under
**Organization Settings → Integrations → API Tokens** or **Your Profile → API Tokens**. It is sent
as `Authorization: Bearer <token>` and already names its organization, so no subdomain is needed.

### Configuration options

| Option    | Type                     | Description                                          |
| --------- | ------------------------ | ---------------------------------------------------- |
| `token`   | `string`                 | API token, `cdxat_…` or `cdxut_…` (required)         |
| `baseUrl` | `string`                 | API base URL, defaults to `https://api.codecks.io/`  |
| `headers` | `Record<string, string>` | Additional request headers                           |
| `timeout` | `number`                 | Request timeout in ms; the request aborts after that |
| `fetch`   | `typeof fetch`           | Custom fetch implementation                          |

### Errors

A non-2xx answer throws a `CodecksApiError`:

```ts
import {CodecksApiError} from "@codecks/fetch";

try {
  await fetchFromRoot({account: {fields: ["name"]}});
} catch (e) {
  if (e instanceof CodecksApiError) {
    e.status; // 400, 401, 403, 429, …
    e.code; // "invalid_token", "token_expired", "missing_scope", "unknown_field", …
    e.path; // "_root.account.cards.titel" for a query error
    e.body; // the full response body, e.g. `hint` or `requiredScope`
  }
}
```

### Legacy tokens

`buildLegacyFetchers({accessToken, subdomain, baseUrl, …})` sends the old `X-Auth-Token` and
`X-Account` headers. The API stops accepting `X-Auth-Token` on **2026-12-31**; move to an API token
before then.

## Fetching data

### `fetchFromRoot` — query top-level relations

Use this to query entry points like `account`, `loggedInUser`, or `releases`.

```ts
const result = await fetchFromRoot({
  account: {
    fields: ["name", "subdomain"],
  },
});

console.log(result.account.name);
//          ^ fully typed as string
```

### `fetchInstance` — fetch a single instance by model name and ID

```ts
const card = await fetchInstance("card", "card-123", {
  fields: ["title", "status"],
});

console.log(card.title);
```

### `fetchInstances` — fetch multiple instances

Returns a `Record<Id, Result>`.

```ts
const cards = await fetchInstances("card", ["card-1", "card-2"], {
  fields: ["title"],
});

console.log(cards["card-1"].title);
```

### `fetchFromInstance` — fetch from an existing instance reference

Any previously fetched instance can be passed to query more data from it.

```ts
const account = result.account;
// account has { ~model: "account", ~key: "1" }

const details = await fetchFromInstance(account, {
  fields: ["seats", "activeProjectCount"],
  relations: {
    roles: {fields: ["role"]},
  },
});
```

## Querying relations

Relations are fetched by nesting them under `relations`. They can be nested to any depth.

```ts
const result = await fetchFromRoot({
  account: {
    fields: ["name"],
    relations: {
      // belongsTo — returns a single object (or null if optional)
      disabledBy: {fields: ["name"]},

      // hasMany — returns an array
      roles: {
        fields: ["role"],
        relations: {
          user: {fields: ["name", "fullName"]},
        },
      },
    },
  },
});

// result.account.disabledBy?.name
// result.account.roles[0].user.name
```

## hasMany variants

hasMany relations support several query modes. Non-default variants require an `as` alias.

### Default (array)

```ts
relations: {
  roles: {
    fields: ["role"],
    orderBy: "-accountId",
    limit: 10,
    offset: 0,
  },
}
// result.roles: Array<{role: string, ...}>
```

### Count

```ts
relations: {
  roles: {type: "count", as: "roleCount"},
}
// result.roleCount: number
```

### Exists

```ts
relations: {
  releases: {type: "exists", as: "hasReleases"},
}
// result.hasReleases: boolean
```

### First

Returns a single result or `null`. Requires `orderBy`.

```ts
relations: {
  roles: {
    type: "first",
    as: "firstRole",
    orderBy: "-accountId",
    fields: ["role"],
  },
}
// result.firstRole: {role: string, ...} | null
```

### Multiple queries on the same relation

Pass an array of aliased queries to query the same relation in different ways:

```ts
relations: {
  roles: [
    {as: "adminRoles", fields: ["role"], filter: {role: "admin"}},
    {as: "roleCount", type: "count"},
  ],
}
// result.adminRoles: Array<...>
// result.roleCount: number
```

## Filtering

Filters are available on all hasMany variants.

### Simple equality

```ts
filter: {
  status: "done";
}
// shorthand for {status: {op: "eq", value: "open"}}
```

### Null checks

```ts
filter: {
  assigneeId: null;
}
```

### Comparison operators

```ts
filter: {
  createdAt: {op: "gt", value: "2025-01-01"},
  effort: {op: "lte", value: 5},
}
```

Available operators: `eq`, `neq`, `lt`, `lte`, `gt`, `gte`.

### Set operators

```ts
filter: {
  derivedStatus: {op: "in", value: ["review", "blocked"]},
}
```

Also available: `notIn`.

### String operators

```ts
filter: {
  title: {op: "contains", value: "bug"},
}
```

### Array operators

```ts
filter: {
  tags: {op: "has", value: "urgent"},
  masterTags: {op: "overlaps", value: ["frontend", "backend"]},
}
```

### Logical combinators

```ts
filter: {
  $or: [
    {status: "open"},
    {status: "started"},
  ],
}
```

Also available: `$and`.

### Relation filters and negation

```ts
filter: {
  // cards that have an assignee named "Alice"
  assignee: {name: "Alice"},
  // cards that do NOT belong to deck "Backlog"
  "!deck": {title: "Backlog"},
}
```

## Ordering

```ts
// ascending
orderBy: "createdAt"

// descending (prefix with -)
orderBy: "-createdAt"

// multiple
orderBy: ["status", "-createdAt"]

// object syntax
orderBy: {field: "createdAt", dir: "desc"}
```

## Response shape

Every returned instance includes:

- **Requested fields** — only the fields you asked for
- **Key fields** — always included (e.g. `cardId` for cards, `id` for accounts)
- **`~model`** — the model name (e.g. `"card"`)
- **`~key`** — the instance's unique key

```ts
const card = await fetchInstance("card", "card-123", {
  fields: ["title"],
});
// {
//   cardId: "card-123",
//   title: "My Card",
//   "~model": "card",
//   "~key": "card-123",
// }
```

All response types are fully inferred from your query — TypeScript knows exactly which fields and relations are present.

## Schema reference for LLMs

This package ships with generated markdown files describing every API model, its fields, and relations. These are designed for LLM-based tools (Claude Code, Cursor, Copilot, etc.) that need to discover the API schema without relying on TypeScript autocomplete.

```
node_modules/@codecks/fetch/schema/
  overview.md          # Root entry points + index of all models
  query-syntax.md      # Query DSL reference with examples
  models/
    card.md            # Fields + relations for the card model
    account.md         # Fields + relations for the account model
    ...                # One file per model
```

Point your LLM's project instructions (e.g. `CLAUDE.md`) at `schema/overview.md` as a starting point, then let it drill into individual model files as needed.

## Custom loader

For advanced use cases (batching, caching, custom transports), you can provide your own `DataLoader`:

```ts
import {buildFetchersFromLoader} from "@codecks/fetch";

const {fetchFromRoot} = buildFetchersFromLoader({
  fetchModel: async (model, ids, query) => {
    // your custom loading logic
    return recordOfResults;
  },
});
```

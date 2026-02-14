# Architecture

`@codecks/fetch` is a type-safe query SDK for the Codecks API. It lets you describe nested queries in a declarative DSL and infers the exact response type.

## High-level overview

```
                          ┌─────────────┐
                          │  User code  │
                          └──────┬──────┘
                                 │  fetchFromRoot / fetchInstance / ...
                                 ▼
                          ┌─────────────┐
                          │  Fetchers   │  src/index.ts
                          └──────┬──────┘
                                 │
                                 ▼
                          ┌─────────────┐
                          │ DataLoader  │  src/loaders/loader-utils.ts
                          └──────┬──────┘
                                 │
              ┌──────────────────┼──────────────────┐
              ▼                  ▼                   ▼
     ┌────────────────┐  ┌─────────────┐   ┌────────────────┐
     │ Query helpers  │  │ API (fetch) │   │ Reconciliation │
     │ serialize query│  │             │   │ parse response │
     └────────────────┘  └─────────────┘   └────────────────┘
              │                                     │
              └──────────────┬──────────────────────┘
                             ▼
                      ┌─────────────┐
                      │  ModelPool  │  in-memory instance cache
                      └──────┬──────┘
                             │
                             ▼
                      ┌─────────────┐
                      │   Models    │  ~90 model descriptors
                      └─────────────┘
```

## Source layout

```
src/
├── index.ts                  Entry point. Exports buildFetchers / buildFetchersWithSimpleLoader
├── query-type.ts             Query DSL types + response inference
├── query-helpers.ts          Serializes a typed query into the API wire format
├── reconcile-query.ts        Reconstructs typed results from a flat API response
├── model-pool.ts             In-memory cache that normalises raw API data
├── has-many-filter-type.ts   Filter / ordering types for hasMany queries
├── collection-utils.ts       Small utility (ensureMapValue)
│
├── models/
│   ├── _desc.ts              makeModel / relation helpers & ModelDesc type
│   ├── _fields.ts            Field type constructors (id, string, int, date, ...)
│   ├── _type-helpers.ts      Nominal type + TS utilities
│   ├── _root.ts              Virtual root model (entry point for root queries)
│   ├── index.ts              modelMap – registry mapping name → descriptor
│   └── *.ts                  ~90 concrete model descriptors (Account, Card, User, ...)
│
└── loaders/
    ├── loader-utils.ts       DataLoader interface + configuredFetch helper
    └── simple-loader.ts      Default loader implementation
```

## Modules

### Models (`src/models/`)

Each model is declared with `makeModel()` and produces a `ModelDesc` containing:

- **name** – unique string identifier (e.g. `"card"`)
- **fields** – field descriptors built with `f.id()`, `f.string()`, `f.date()`, `f.belongsTo()`, etc.
- **relations** – named relations built with `relation(targetModel, opts)`.
  Three kinds: `belongsTo` (with a foreign key field), `hasMany`, `hasOne`.
- **keys** – array of field names that uniquely identify an instance (usually `["id"]` or `["cardId"]`)

Example (simplified):

```ts
export type CardId = Nominal<string, "card">;

export const cardDesc = makeModel({
  name: "card",
  fields: {
    cardId: f.id<CardId>(),
    title: f.string({}),
    status: f.string({}),
    assigneeId: f.belongsTo({optional: true}).type<UserId>(),
    // ...
  },
  relations: {
    assignee: relation("user", {type: "belongsTo", fk: "assigneeId"}),
    childCards: relation("card", {type: "hasMany"}),
    totalTimeTrackingSums: relation("timeTrackingSum", {type: "hasOne"}),
    // ...
  },
  keys: ["cardId"],
});
```

All descriptors are re-exported through `modelMap` in `src/models/index.ts`, which is the single registry the rest of the system relies on.

A special `_root` model has no fields or keys and only exposes top-level relations like `account`, `loggedInUser`, `releases`, etc. It serves as the entry point for `fetchFromRoot`.

#### Nominal IDs

Foreign-key fields use `Nominal<string, Tag>` types so that e.g. a `UserId` cannot accidentally be passed where a `CardId` is expected.

### Query type system (`src/query-type.ts`)

A query describes **what to fetch**: which fields and which relations (recursively).

```ts
interface ModelQuery<T, TMap> {
  fields?: (keyof T["fields"])[];
  relations?: RelQuery<T, TMap>;
}
```

For `hasMany` relations, extra options are available:

| Variant                    | Returns     | Extra options                          |
| -------------------------- | ----------- | -------------------------------------- |
| `type?: "query"` (default) | `T[]`       | `filter`, `orderBy`, `limit`, `offset` |
| `type: "count"`            | `number`    | `filter`                               |
| `type: "exists"`           | `boolean`   | `filter`                               |
| `type: "first"`            | `T \| null` | `filter`, `orderBy` (required)         |

All `hasMany` variants except the default require an `as` alias so the result key is unambiguous when multiple queries target the same relation.

**Response inference** – `InferModelQuery` and `InferRelQuery` recursively derive the exact return type from the query literal. Key fields and metadata (`~model`, `~key`) are always included in the result.

### Loader abstraction (`src/loaders/`)

`DataLoader` is a single-method interface:

```ts
type DataLoader = {
  fetchModel: (model, ids, query) => Promise<Record<Id, Result>>;
};
```

The built-in `SimpleLoader` (created via `createSimpleLoader(opts)`) implements this by:

1. Serializing the query into the Codecks API wire format
2. POSTing to the API
3. Feeding the response into a `ModelPool`
4. Reconciling each requested instance against the pool

Configuration options: `accessToken`, `subdomain`, `baseUrl`, custom `fetch`, `headers`, `timeout`.

Custom loaders (e.g. with batching or caching) can be plugged in by passing any `DataLoader` to `buildFetchers`.

### Public API (`src/index.ts`)

`buildFetchers(loader)` returns four methods:

| Method                               | Purpose                                                |
| ------------------------------------ | ------------------------------------------------------ |
| `fetchFromRoot(relQuery)`            | Query top-level relations (account, loggedInUser, ...) |
| `fetchInstance(model, id, query)`    | Fetch a single instance by model name + id             |
| `fetchFromInstance(instance, query)` | Fetch from an already-known `Instance` reference       |
| `fetchInstances(model, ids, query)`  | Fetch multiple instances, returns `Record<Id, Result>` |

`buildFetchersWithSimpleLoader(opts)` is a shortcut that creates a `SimpleLoader` and passes it to `buildFetchers`.

### Query processing pipeline

**Serialization** (`src/query-helpers.ts`):

1. `makeModelQuerySerializable` – converts typed `RelQuery` entries into a flat `Record<string, SerializableRelationQuery>`, computing unique keys for hasMany aliases via `getRelKey`.
2. `serializeModel` – flattens a `SerializableModelQuery` into the array wire format the API expects: `[field1, field2, {relation: [...]}]`.
3. `serializeInstanceQuery` – wraps the above per instance: `{"card(card-123)": [...]}`.

**Response handling** (`src/model-pool.ts` + `src/reconcile-query.ts`):

1. `ModelPool.add(response)` – ingests the flat API response, parsing `date` fields into `Date` objects and `day` fields into `{year, month, day}`.
2. `reconcileInstanceQuery` – walks the original query tree and rebuilds a nested result object from the pool:
   - Adds `~model` / `~key` metadata
   - Always includes key fields
   - Copies requested fields
   - Recursively resolves `belongsTo` (single or null), `hasOne` (single), and `hasMany` (array / count / exists / first)

### Filters & ordering (`src/has-many-filter-type.ts`)

Filters support field-level conditions, relation-level sub-filters, negation (`!field`), and logical combinators (`$and`, `$or`).

Field operators: `eq`, `neq`, `lt`, `lte`, `gt`, `gte`, `in`, `notIn`, `contains` (strings), `has` / `overlaps` (arrays).

Ordering accepts `"fieldName"` (asc), `"-fieldName"` (desc), or `{field, dir}` objects. Multiple orderings can be passed as an array.

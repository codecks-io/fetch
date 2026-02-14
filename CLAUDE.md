# @codecks/fetch

Type-safe query SDK for the Codecks API. Declarative query DSL with full TypeScript inference, normalized caching, batched requests, optimistic updates, and React integration.

## Commands

```bash
npm run build          # Build with tsdown
npm run test           # Run vitest in watch mode
npm run test:run       # Run vitest once
npm run typecheck      # tsc --noEmit
npm run format         # Prettier write
npm run check-format   # Prettier check
npm run ci             # typecheck + build + check-format + test:run
```

## Source Layout

```
src/
├── index.ts                 Entry point: buildFetchers / buildFetchersWithSimpleLoader
├── query-type.ts            Query DSL types + response type inference
├── query-helpers.ts         Serializes typed queries into API wire format
├── reconcile-query.ts       Reconstructs typed results from flat API response
├── model-pool.ts            In-memory cache normalizing raw API data
├── has-many-filter-type.ts  Filter/ordering types for hasMany relations
├── models/
│   ├── _desc.ts             makeModel() + ModelDesc type
│   ├── _fields.ts           Field type constructors (id, string, int, date, belongsTo, ...)
│   ├── _type-helpers.ts     Nominal<string, Tag> type utility
│   ├── _root.ts             Virtual root model (entry point for root queries)
│   ├── index.ts             modelMap registry: name → descriptor
│   └── *.ts                 ~90 model descriptors (Account, Card, User, ...)
├── loaders/
│   ├── loader-utils.ts      DataLoader interface + configuredFetch helper
│   └── simple-loader.ts     Default loader implementation
└── _exploration/            Data store layer (normalized cache + React hooks)
    ├── store.ts             Central coordinator: cache + loader
    ├── immediate-cache.ts   Field-level normalized cache (fresh/dirty/optimistic)
    ├── loader.ts            BatchedLoader with deduplication
    ├── api-requester.ts     Consolidates requests, rate limits
    ├── optimistic-manager.ts  Optimistic update layer stack
    ├── user-query-manager.ts  Reactive query subscriptions + structural sharing
    ├── create-hooks.ts      React hook factory (useFetch, useFetchFromRoot)
    ├── react-hooks.ts       Hook internals (useSyncExternalStore + Suspense)
    └── utils/
        ├── deepUpdateTree.ts      Structural sharing for data trees
        └── concurrency-limiter.ts  Async concurrency control

tests/                       Vitest + MSW (mock service worker)
docs/architecture.md         Full architecture walkthrough
```

## Key Concepts

**Query DSL**: Queries describe fields and relations to fetch. `InferModelQuery` recursively infers the exact return type from the query literal. Key fields (`~model`, `~key`) are always included.

**Models**: Declared with `makeModel()`. Each has fields (built with `f.id()`, `f.string()`, `f.belongsTo()`, etc.), relations (`belongsTo`, `hasMany`, `hasOne`), and keys. IDs use `Nominal<string, Tag>` types for type safety.

**hasMany variants**: `type: "query"` (default, returns array), `"count"` (number), `"exists"` (boolean), `"first"` (single or null). Non-default variants require an `as` alias.

**Data store** (`_exploration/`): Normalized field-level cache with three states: fresh, dirty, optimistic. Queries subscribe to field-level keys and re-render only when data actually changes (structural sharing via `deepUpdateTree`). See `src/_exploration/VISION.md` and `src/_exploration/LIFECYCLE.md` for details.

**Batching**: Requests are collected in a microtask window, deduplicated, and consolidated into single HTTP calls.

## Conventions

- TypeScript strict mode, ESM (`"type": "module"`)
- Prettier: no bracket spacing, trailing commas (es5), 100 char width
- Tests: vitest + MSW for API mocking
- Changesets for versioning (`npm run local-release`)
- React 19 peer dependency (for `_exploration/` hooks)

# @codecks/fetch

## 0.1.7

### Patch Changes

- f122ccb: Fix crash when reconciling a hasMany relation that the API returns as `null`
  instead of an empty array (e.g. a self-referential `childCards` on a card with
  no children). Such relations now reconcile to `[]` rather than throwing
  `Cannot read properties of null (reading 'map')`.
- 5f2639c: Tighten hasMany query types to reject queries the API rejects at runtime:
  - `fkAsArray` relations (card `childCards`/`inDeps`/`outDeps`/`cardReferences`/
    `attachments`, workflowItem `inDeps`/`outDeps`) are now marked as such and
    only accept plain selection (`fields`/`relations`) plus the `count`/`exists`
    aggregates. `filter`, `orderBy`, `limit`, `offset`, and `type: "first"` were
    always rejected server-side ("doesn't support relQueries") and are now compile
    errors.
  - A hasMany subset now requires an order: `limit` requires `orderBy`, and
    `offset` requires `limit` (and thus `orderBy`). Previously `limit` on its own
    type-checked but 500'd with "needs an order ... to be able to use subset".

## 0.1.6

### Patch Changes

- add optimistic updates, separate cache-invalidation partKeys from field-level query subscriptions, differentiate fields from relations in exploration, fix parsing of null dates

## 0.1.5

### Patch Changes

- eaa6372: fix count/exists queries for hooks, add meta-data, ensure keys are always strings

## 0.1.4

### Patch Changes

- 6e53d86: ensure proper return values for react hooks

## 0.1.3

### Patch Changes

- 4c5752f: ensure proper types for hooks

## 0.1.2

### Patch Changes

- af7e2f0: Embed modelmap within store

## 0.1.1

### Patch Changes

- e56fe2e: fix exported entries

## 0.1.0

### Minor Changes

- 2a50b24: Add exploration for data store and react hooks

## 0.0.4

### Patch Changes

- 140b059: rework loader vs fetch abstraction, update exported function names

## 0.0.3

### Patch Changes

- c9bb8bc: fix root complex queries, fix handling of count and exists queries

## 0.0.2

### Patch Changes

- 4805174: Fix the shape of root queries

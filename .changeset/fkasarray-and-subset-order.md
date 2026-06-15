---
"@codecks/fetch": patch
---

Tighten hasMany query types to reject queries the API rejects at runtime:

- `fkAsArray` relations (card `childCards`/`inDeps`/`outDeps`/`cardReferences`/
  `attachments`, workflowItem `inDeps`/`outDeps`) are now marked as such and
  only accept plain selection (`fields`/`relations`) plus the `count`/`exists`
  aggregates. `filter`, `orderBy`, `limit`, `offset`, and `type: "first"` were
  always rejected server-side ("doesn't support relQueries") and are now compile
  errors.
- A hasMany subset now requires an order: `limit` requires `orderBy`, and
  `offset` requires `limit` (and thus `orderBy`). Previously `limit` on its own
  type-checked but 500'd with "needs an order ... to be able to use subset".

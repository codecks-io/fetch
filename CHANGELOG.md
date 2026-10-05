# @codecks/fetch

## 2.0.1

### Patch Changes

- 0c5c278: - A hasMany relation with `orderBy` below another relation is in the result type again. With
  `fetchFromRoot` that was every ordered relation, e.g. `account.cards` with `orderBy: "-createdAt"`,
  including `type: "first"`.
  - `orderBy: {field: "createdAt", dir: "desc"}` is accepted; the object syntax was rejected for any
    field.
  - A `baseUrl` without a trailing slash works; `dispatch` sent `https://api.codecks.iodispatch/…`.

## 2.0.0

### Major Changes

- cfb4c0b: The models are generated from the Codecks API reference, so they only contain what the API documents, typed the way the API documents them.
  - Undocumented models, fields and relations are gone from the types and from `schema/*.md`, e.g.
    `account.seats`, `account.roles` and the `_root` relations other than `account`,
    `loggedInUser` and `releases`. The API still answers them, but they can change without notice.
  - Fields and relations the API marks `preview` carry `@experimental`; deprecated ones carry
    `@deprecated` with their removal date, so editors strike them through on a query's result.
    `schema/*.md` shows the same markers.
  - Enums are typed as open unions: `card.status` is
    `"not_started" | "started" | "snoozing" | "done" | (string & {})`. The values autocomplete, but a
    `switch` over one isn't exhaustive, since the API may add values.
  - json and array fields are typed instead of `any`: `card.checkboxInfo` is `Checkbox[]`,
    `milestone.userCapacities` is `{[userId: UserId]: number}`. Ids inside arrays and maps are
    nominal: `card.mentionedUsers` is `UserId[]`. Timestamps and days nested in a json value stay
    strings; top-level ones still parse to a `Date` and `{year, month, day}`.
  - The reference's named types (`Priority`, `Checkbox`, `DefaultCard`, `Workdays`, …) and every
    model's id type (`CardId`, `UserId`, …) are exported from the package.
  - Foreign keys come from the reference instead of being guessed from the relation name.
    `resolvableEntryReaction.resolvableEntryId` is gone, the fk is `entryId` (now a
    `ResolvableEntryId`). `resolvable.closedById` is gone; query the `closedBy` relation, which is
    now nullable.
  - Other field types follow the API where the old descriptors typed them as `string`: `file.size`
    and `workflowItem.version` are numbers, `isGlobal`, `handSyncEnabled` and `hasGuardians` are
    booleans, `manualOrderLabels` and `sprintConfig.moveOnFinish` are arrays.
  - New documented fields: the account settings needed to read cards and Runs (`priorityLabels`,
    `effortScale`, `workdays`, `startWeekday`, the `*Enabled` switches), `card.isBlockingDep` and `version`,
    `deck.isDeleted`, `user.kind`, `isIntegration` and `profileImage`, `project.coverFile`,
    `file.createdAt` and `uploader`, `deck.deckType`, `resolvable.reopenedAt` and
    `reopenedBy`, `sprintConfig.runLabelTemplate`, and `date` on the progress models.

### Minor Changes

- ec386b2: `dispatch(name, params)` calls an action of the API, e.g.
  `dispatch("cards/update", {id, status: "done"})`. Its params and response are typed from the API
  reference for all of its actions; each action's JSDoc holds its description and required scopes,
  and `schema/actions.md` lists them. Enums in params are closed: only the values the API accepts
  type-check. `ActionMap`, `ActionName`, `ActionParams` and `ActionResponse` are exported.

  A refused action throws a `CodecksApiError` whose message is the API's reason, e.g.
  `[403] requires card:write`.

  **Breaking** for custom loaders: `DataLoader` needs a `dispatch(name, params)` method that posts
  the params to `dispatch/<name>` and returns the answer's `payload`.

- 6629cba: Models, fields and relations carry the API reference's descriptions as JSDoc, so editors show what
  e.g. `card.title` or `card.masterTags` holds; `schema/*.md` lists them too.

  The models also follow the latest reference: `attachment.creator`, `cardHistory.changer` and
  `file.uploader` may be `null`, and `sprint.creator` is gone from the types.

### Patch Changes

- f41e44b: The models follow the latest API reference: every model and many more fields and relations carry a
  description, e.g. the `account` settings and all of `deck`. `queueEntry.sortIndex` may be `null`.

## 1.0.1

### Patch Changes

- af098af: `CodecksApiError.code` holds the reason for a refused token, e.g. `token_expired` or `invalid_token`, instead of `Unauthorized`.

## 1.0.0

### Major Changes

- d16ff81: Authenticate with the new API tokens over `Authorization: Bearer`.
  - `buildFetchers({token})` takes an organization (`cdxat_…`) or personal (`cdxut_…`) token and
    sends it as a bearer header. Other token formats throw, since the API would ignore them and
    answer as if logged out. `baseUrl` defaults to `https://api.codecks.io/`; no subdomain is needed.
  - The previous `buildFetchersWithSimpleLoader` is renamed to `buildLegacyFetchers` and keeps sending
    `X-Auth-Token` / `X-Account`. The API stops accepting `X-Auth-Token` on 2026-12-31.
  - The previous `buildFetchers(loader)` is renamed to `buildFetchersFromLoader(loader)`.
  - `ApiRequester` (`@codecks/fetch/_exploration/api-requester`) now requires `token` and uses bearer auth.
  - A non-2xx answer throws `CodecksApiError` with `status`, `code`, `path` and the parsed `body`,
    also when the body isn't JSON.
  - The `timeout` option now aborts the request; it was accepted but ignored before.

## 1.0.0-rc.0

### Major Changes

- d16ff81: Authenticate with the new API tokens over `Authorization: Bearer`.
  - `buildFetchers({token})` takes an organization (`cdxat_…`) or personal (`cdxut_…`) token and
    sends it as a bearer header. Other token formats throw, since the API would ignore them and
    answer as if logged out. `baseUrl` defaults to `https://api.codecks.io/`; no subdomain is needed.
  - The previous `buildFetchersWithSimpleLoader` is renamed to `buildLegacyFetchers` and keeps sending
    `X-Auth-Token` / `X-Account`. The API stops accepting `X-Auth-Token` on 2026-12-31.
  - The previous `buildFetchers(loader)` is renamed to `buildFetchersFromLoader(loader)`.
  - `ApiRequester` (`@codecks/fetch/_exploration/api-requester`) now requires `token` and uses bearer auth.
  - A non-2xx answer throws `CodecksApiError` with `status`, `code`, `path` and the parsed `body`,
    also when the body isn't JSON.
  - The `timeout` option now aborts the request; it was accepted but ignored before.

## 0.1.8

### Patch Changes

- 55aa143: Fix crash when the API names an id but answers `null` for the record — a card, user or
  other row the token may not read because it was deleted or sits in a project the token
  does not cover. Such a record is now skipped instead of being handed to `Object.entries`,
  which threw `Cannot convert undefined or null to object` and failed the whole request.

  A withheld record reconciles to `null` on a `belongsTo` or `hasOne`, and is dropped from
  a `hasMany` array (from both the array and its `~`-prefixed list of ids, so the two stay
  aligned) — the inferred type has no null members. Two consequences worth knowing: a
  non-optional `belongsTo` pointing at a withheld record now yields `null` where its type
  says otherwise, and a `hasMany` page can come back shorter than the `$limit` that was
  asked for, so paging while `length === limit` can stop one page early.

  `reconcileInstanceQuery` no longer warns `no instance found in pool` for these ids, since
  the caller cannot act on them. An id the response never mentioned at all still warns.

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

# Plan: Type the models from the reference's JTD schemas

## Status (2026-09-28)

All phases done, uncommitted in both repos.

| phase | what                                                        | where   | state |
| ----- | ----------------------------------------------------------- | ------- | ----- |
| 1     | relations carry `kind` and `fk`, every fk is a listed field | codecks | done  |
| 2     | generator reads `schema`; `definitions.ts`; typed field fns | here    | done  |
| 3     | schema docs render the same types                           | here    | done  |
| 4     | cleanup, changeset, README                                  | here    | done  |

Found while doing it:

- **A belongsTo's fk can be its own name**: `resolvable.closedBy` and `reopenedBy` have fk
  `closedBy`/`reopenedBy`. The reference emits `fk` as is and lists no separate field (a field
  named like a relation is the relation). The SDK emits such a relation without `fk`, and drops the
  made-up `closedById`/`reopenedById`. A belongsTo's nullability now comes from the relation's own
  `optional` opt instead of its fk field.
- The generator is split: `scripts/models-from-reference.ts` (`renderSchema`, `generate`, pure)
  and `scripts/generate-models.ts` (CLI). It also writes `src/models/ids.ts`, re-exporting every
  `*Id` type from the package entry.

## Goal

The codecks repo's `shared/api-reference.json` now describes every field, definition, param and
response key with a JSON Type Definition (RFC 8927) `schema` (see
`codecks/notes/plans/api-field-types.md`). This package still types fields from the reference
before that work: `card.priority` is `string`, `card.checkboxInfo` is `any[]`,
`milestone.userCapacities` is `any`. It should read the schemas and duplicate nothing by hand.

## Where we are

- **The generator can't read the current reference.** `generate-models.ts` expects
  `RefField = {name, type, nullable}`. Since phase 6 a field is `{name, schema, stability,
deprecated?}`, so `FIELD_FNS[field.type]` throws `Unknown type 'undefined'` on the first field.
  Every file in `src/models/` comes from the older reference.
- **The generator guesses belongsTo fks.** The reference doesn't state a relation's kind or fk. The
  generator treats `!many && asField` as belongsTo with fk `${name}Id`. For 38 belongsTo relations
  that fk isn't in the reference's field list (`card.assigneeId`, `creatorId`, `coverFileId`, …), so
  the SDK makes those fields up. One guess is wrong: `resolvableEntryReaction.resolvableEntry` has
  fk `entryId`, and the SDK generates a `resolvableEntryId` field the API doesn't have, next to an
  untyped `entryId: f.string`.
- **Leftovers:** `f.bigint` has no caller and the reference has no bigint. `f.object` (tag `"obj"`)
  types everything as `any`. `generate-schema-docs.ts` describes types from the descriptor's `type`
  tag.
- **Stability handling is done and stays.** Internal items are absent from the reference and can't
  be queried (`ModelQuery.fields` is `keyof T["fields"]`, with no escape hatch). Preview items are
  allowed and carry `stability: "preview"` plus `@experimental`. Deprecated ones carry
  `@deprecated`. `InferModelQuery` maps over the model's fields, so the JSDoc survives into results.

## Decisions

- **Internal stays out, preview stays in.** No escape hatch for undocumented fields: they change
  without notice, and a few are still typed by hand in the web app (`card.meta`). Preview needs no
  opt-in; `@experimental` is the signal.
- **The reference is the only input.** No per-field overrides in this repo. When the reference is
  missing something (fks, relation kind), it gets fixed in the codecks repo, not patched here.
- **The generator throws on anything it can't place**: an unknown schema form, a `ref` without a
  definition, a `model` or `keyModel` naming an undocumented model, a belongsTo whose fk isn't a
  listed field. A silent `any` is what this plan removes.
- **Enums are open unions**: `"a" | "b" | "c" | (string & {})`, as the codecks plan asks, because
  enums may gain values. The literals still autocomplete. The cost: a `switch` over one isn't
  exhaustive, and a value outside the listed ones is legal. Nested enums (inside a definition or a
  json field) follow the same rule.
- **Wire format at runtime doesn't change.** A top-level `timestamp` still becomes a `Date` and a
  top-level day a `{year, month, day}` (`parseField` in `model-pool.ts`). Inside a json value,
  timestamps and days stay strings: the runtime doesn't walk json values.
- **A day that is an id prop stays a string** (`milestoneProgress.date`, `sprintProgress.date`,
  `sprintConfigProgress.date`). The cache key is built from key values as they come over the wire;
  the codecks plan made the same call.
- **Ids are nominal wherever the schema names a model**: a top-level string with `metadata.model`,
  an element (`card.mentionedUsers: UserId[]`), a nested property
  (`DefaultCard.assigneeId: UserId | null`), a `values` key (`{[userId: UserId]: number}`).
- **Named types go into one generated file**, `src/models/definitions.ts`, one
  `export type <Name> = …` per entry of the reference's `definitions`, re-exported from the package
  entry. Models import from it, and it imports id types from the models (type-only, so the cycle is
  fine).
- **The rendered types don't ship at runtime.** Descriptors keep only what the runtime reads
  (`type` tag, `optional`, tier). Schema docs get their type strings from a sidecar the generator
  writes (phase 3).

## Phase 1 (codecks repo): relations carry their kind and fk

`buildApiReference` (`node-api/src/lib/api-reference.ts`) emits for every relation:

```json
{"name": "resolvableEntry", "model": "resolvableEntry", "kind": "belongsTo", "fk": "entryId", …}
```

`kind` is `belongsTo | hasOne | hasMany`. `fk` is set on a belongsTo. A hasMany stored as an array
column keeps `asField: true`. Every belongsTo fk is also listed in the model's `fields`, with
`metadata.model` (the importer already adds these fields and returns them camelCased since phase
3; the reference just doesn't list the ones the model JSON doesn't name). The fk field takes the
relation's tier when it has none of its own.

`asField` stays for now, so the old generator keeps working until phase 2 lands.

## Phase 2: generate the models from `schema`

**Input** — `shared/api-reference.json`:

```json
{"name": "priority", "schema": {"ref": "Priority", "nullable": true}, "stability": "stable"}
{"name": "userCapacities", "schema": {"values": {"type": "int32"}, "metadata": {"keyModel": "user"}}, "stability": "preview"}
```

**What happens**

- `RefField` becomes `{name, schema, stability, deprecated?}`, `RefRelation` gains `kind` and `fk`,
  and `ApiReference` gains `definitions: Record<string, {schema}>`. The relation code reads
  `kind` and `fk` instead of guessing. `belongsToFks` goes: every fk is a listed field.
- `renderSchema(schema): string` renders JTD as TS:

  | JTD                                                    | TS                             |
  | ------------------------------------------------------ | ------------------------------ |
  | `{}`                                                   | `unknown`                      |
  | `type: boolean` / `int32` (and other numeric types)    | `boolean` / `number`           |
  | `type: string`                                         | `string`                       |
  | `type: string`, `metadata.model: "user"`               | `UserId`                       |
  | `type: string`, `metadata.format: "day"`               | `string` (nested) — see below  |
  | `type: timestamp`                                      | `string` (nested) — see below  |
  | `enum: [a, b]`                                         | `"a" \| "b" \| (string & {})`  |
  | `ref: "Priority"`                                      | `Priority`                     |
  | `elements: S`                                          | `S[]`, `(S)[]` if S is a union |
  | `properties` / `optionalProperties`                    | `{a: A; b?: B}`                |
  | `values: S`, `metadata.keyModel: "user"`               | `{[userId: UserId]: S}`        |
  | `values: S` without `keyModel`                         | `{[key: string]: S}`           |
  | `nullable: true`                                       | `… \| null`                    |
  | `discriminator`, `additionalProperties`, anything else | throw                          |

- A field's top-level schema picks the field function; everything else goes through
  `renderSchema`:

  | top-level schema                       | field                              |
  | -------------------------------------- | ---------------------------------- |
  | the model's single id prop             | `f.id<CardId>()`                   |
  | fk of a belongsTo                      | `f.belongsTo(opts).type<UserId>()` |
  | `type: timestamp`                      | `f.date(opts)`                     |
  | `format: "day"`, not an id prop        | `f.day(opts)`                      |
  | `type: int32` / `boolean`              | `f.int(opts)` / `f.bool(opts)`     |
  | `type: string`, no metadata            | `f.string(opts)`                   |
  | anything else (enum, ref, elements, …) | `f.typed(opts).type<…>()`          |

  `optional: true` comes from the top-level `nullable`, and the field function adds `| null`, so
  `renderSchema` is called without it. A `ref` whose definition is an enum, and inline enums, both
  land on `f.typed`.

- `_fields.ts`: add `typed`, curried like `belongsTo` because `const Opts` inference breaks when a
  caller passes another type argument explicitly:

  ```ts
  export const typed = <const Opts extends BaseOpts>(opts: Opts) => ({
    type: <T>() => withOpts<TypedField<"typed", T, Opts>>("typed", opts),
  });
  ```

  Remove `object`, `array` and `bigint`. `parseField` needs no change: `"typed"` falls through to
  `default`.

- The generator writes `src/models/definitions.ts` from `reference.definitions`, sorted by name,
  and imports the names a model file uses. `src/index.ts` re-exports it
  (`export type * from "./models/definitions"`), plus the `*Id` types if they aren't exported yet.

**Output** — `src/models/Card.ts`:

```ts
import type {CardVisibility, Checkbox, CheckboxStats, DerivedStatus, Priority} from "./definitions";
…
    checkboxInfo: f.typed({stability: "preview"}).type<Checkbox[]>(),
    mentionedUsers: f.typed({stability: "preview"}).type<UserId[]>(),
    priority: f.typed({optional: true}).type<Priority>(),
    status: f.typed({}).type<"not_started" | "started" | "snoozing" | "done" | (string & {})>(),
```

`src/models/definitions.ts`:

```ts
import type {UserId} from "./User";

export type Priority = "a" | "b" | "c" | (string & {});
export type Checkbox = {label: string; checked: boolean};
export type DefaultCard = {content?: string; assigneeId?: UserId | null; priority?: Priority | null; …};
```

**Tests**

- Type tests (`expectTypeOf`) on a query result: `card.priority` is `Priority | null`,
  `milestone.userCapacities` is `{[userId: UserId]: number}`, `card.mentionedUsers` is `UserId[]`,
  `resolvableEntryReaction.entryId` is `ResolvableEntryId`, and `resolvableEntryId` is not a field.
- A generator unit test feeding `renderSchema` each row of the table, including the throwing
  forms.
- Existing tests keep passing; fixtures in `tests/mocks/handlers.ts` that used a now-tighter field
  may need real values.

## Phase 3: schema docs

`generate-schema-docs.ts` runs at build and reads the runtime descriptors, which don't know
`Priority` or `Checkbox[]`. The generator also writes `src/models/_types.json`:

```json
{
  "fields": {"card.priority": "Priority", "card.checkboxInfo": "Checkbox[]", …},
  "definitions": {"Priority": "\"a\" | \"b\" | \"c\" | (string & {})", …}
}
```

It's committed, and nothing in `src/` imports it, so it doesn't reach the bundle. The docs script
reads it for every field (`FIELD_TYPE_MAP` goes, except `date` and `day`, which describe the parsed
runtime value), and writes a `schema/types.md` listing the definitions that model pages link to.

## Phase 4: cleanup

- Rewrite `.changeset/documented-models-only.md` for the tighter types: enums, typed json and
  arrays, nominal ids in arrays and maps, `definitions` exports, `resolvableEntryId` gone.
- README: a short section on the open enum unions and on `definitions`.
- `CLAUDE.md` / `docs/architecture.md`: `definitions.ts` and `_types.json` are generated;
  `f.typed` replaces `f.object` / `f.array`.

## Not in this plan

- **Actions.** The reference's `actions` carry JTD params and responses, but this package has no
  mutation layer. When it gets one, it reuses `renderSchema`.
- **Runtime validation** (ajv with `keywords: ["model", "format", "keyModel"]`). Not needed to type
  results. Maybe a dev-only check later.
- **The four `{}` fields** (`project.spaces`, `*Progress.progress`) stay `unknown` until the codecks
  repo gives them a schema.

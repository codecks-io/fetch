// Type-level tests. These have no runtime assertions; they fail the build via
// `npm run typecheck` if the query types stop catching the documented mistakes.
// See docs/api-findings.md for the runtime behaviour each case mirrors.
import type {modelMap} from "../src/models";
import type {ModelQuery} from "../src/query-type";

type ModelMap = typeof modelMap;

const cardQuery = <const Q extends ModelQuery<ModelMap["card"], ModelMap>>(q: Q): Q => q;
const accountQuery = <const Q extends ModelQuery<ModelMap["account"], ModelMap>>(q: Q): Q => q;

// ── #4: a hasMany subset (limit/offset) requires orderBy ──────────────────────

// ok: limit together with orderBy
accountQuery({relations: {cards: {fields: ["cardId"], limit: 50, orderBy: "accountSeq"}}});
// ok: orderBy on its own (no subset)
accountQuery({relations: {cards: {fields: ["cardId"], orderBy: "accountSeq"}}});

// @ts-expect-error limit without orderBy is rejected server-side
accountQuery({relations: {cards: {fields: ["cardId"], limit: 50}}});
// @ts-expect-error offset is only meaningful alongside limit (+ orderBy)
accountQuery({relations: {cards: {fields: ["cardId"], offset: 10, orderBy: "accountSeq"}}});

// ── #3: fkAsArray relations only support plain selection + count/exists ────────

// ok: plain field selection (returns an array)
cardQuery({relations: {childCards: {fields: ["cardId"]}}});
// ok: nested relations
cardQuery({relations: {childCards: {fields: ["cardId"], relations: {deck: {fields: ["title"]}}}}});
// ok: aliased plain selection
cardQuery({relations: {inDeps: {fields: ["cardId"], as: "deps"}}});
// ok: count / exists aggregates
cardQuery({relations: {childCards: {type: "count", as: "n"}}});
cardQuery({relations: {inDeps: {type: "exists", as: "hasDeps"}}});

// @ts-expect-error orderBy is not supported on fkAsArray relations
cardQuery({relations: {childCards: {fields: ["cardId"], orderBy: "accountSeq"}}});
// @ts-expect-error limit is not supported on fkAsArray relations
cardQuery({relations: {childCards: {fields: ["cardId"], limit: 50, orderBy: "accountSeq"}}});
// @ts-expect-error offset is not supported on fkAsArray relations
cardQuery({relations: {outDeps: {fields: ["cardId"], offset: 5}}});
// @ts-expect-error filter is not supported on fkAsArray relations
cardQuery({relations: {cardReferences: {fields: ["cardId"], filter: {status: "started"}}}});
// @ts-expect-error type: "first" is not supported on fkAsArray relations
cardQuery({relations: {childCards: {type: "first", as: "firstChild", orderBy: "accountSeq"}}});

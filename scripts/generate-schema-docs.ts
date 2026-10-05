import {modelMap} from "../src/models/index";
import {_rootDesc} from "../src/models/_root";
import {readFileSync, writeFileSync, mkdirSync, rmSync} from "fs";
import {join} from "path";

const ROOT_DIR = join(import.meta.dirname, "..");
const SCHEMA_DIR = join(ROOT_DIR, "schema");

/** An action's param or response key, its type including a top-level `| null`. */
type ActionEntry = {name: string; type: string; required: boolean; description?: string} & TierOpts;

/**
 * Written by `generate-models.ts` next to the descriptors: the TS type of every field (without the
 * top-level `| null`, that's the descriptor's `optional`) and of every definition, the
 * description of every model, field and relation that has one, by `card` / `card.title`, and
 * every action.
 */
const TYPES: {
  fields: Record<string, string>;
  definitions: Record<string, string>;
  descriptions: Record<string, string>;
  actions: Record<
    string,
    {
      description?: string;
      requires: string | null;
      params: ActionEntry[];
      response: ActionEntry[] | null;
    } & TierOpts
  >;
} = JSON.parse(readFileSync(join(ROOT_DIR, "src", "models", "_types.json"), "utf8"));

/** `date` and `day` fields are parsed at runtime, so the docs describe the parsed value. */
const PARSED_TYPES: Record<string, {type: string; note: string}> = {
  date: {type: "Date", note: " (sent as an ISO timestamp)"},
  day: {type: "{year: number; month: number; day: number}", note: " (sent as `YYYY-MM-DD`)"},
};

/** `UserId` → `user`, for every documented model. */
const ID_TYPE_TO_MODEL = new Map(
  Object.keys(modelMap)
    .filter((name) => name !== "_root")
    .map((name) => [`${name[0].toUpperCase()}${name.slice(1)}Id`, name])
);

type DocDir = "models" | "root";

/** Link to a definition's entry in types.md or an id type's model page, if `name` is either. */
function typeLink(name: string, dir: DocDir, selfModel?: string): string | null {
  if (name in TYPES.definitions) {
    return `[\`${name}\`](${dir === "models" ? "../types.md" : "types.md"}#${name.toLowerCase()})`;
  }
  const model = ID_TYPE_TO_MODEL.get(name);
  if (model && model !== selfModel) {
    return `[\`${name}\`](${dir === "models" ? "" : "models/"}${model}.md)`;
  }
  return null;
}

/**
 * Renders a TS type as markdown. A simple type (`Priority`, `UserId[]`, `CardId | null`) links its
 * names inline. An object type stays one code span, followed by links to the names it uses.
 */
function linkType(type: string, dir: DocDir, selfModel?: string): string {
  const parts = type.split(/\b([A-Z]\w*)\b/);
  if (type.includes("{")) {
    const links = [...new Set(parts.filter((_, i) => i % 2 === 1))]
      .map((name) => typeLink(name, dir, selfModel))
      .filter((link) => link !== null);
    return `\`${type}\`${links.length ? ` (uses ${links.join(", ")})` : ""}`;
  }
  const out: string[] = [];
  let code = "";
  for (const part of parts) {
    const link = typeLink(part, dir, selfModel);
    if (link === null) {
      code += part;
      continue;
    }
    if (code) out.push(`\`${code}\``);
    code = "";
    out.push(link);
  }
  if (code) out.push(`\`${code}\``);
  return out.join("");
}

function describeFieldType(modelName: string, fieldName: string, field: FieldEntry): string {
  const type = TYPES.fields[`${modelName}.${fieldName}`];
  if (type === undefined) {
    throw new Error(
      `No type for '${modelName}.${fieldName}' in src/models/_types.json. Run the model generator.`
    );
  }
  const parsed = PARSED_TYPES[field.type];
  const shown = `${parsed?.type ?? type}${field.optional ? " | null" : ""}`;
  return `${linkType(shown, "models", modelName)}${parsed?.note ?? ""}`;
}

type TierOpts = {
  stability?: "stable" | "preview";
  deprecated?: {since: string; removeAfter: string; use?: string};
};
type FieldEntry = {type: string; optional?: boolean} & TierOpts;
type RelationEntry = {
  relName: string;
  options: {type: string; fk?: string; fkAsArray?: boolean; optional?: boolean} & TierOpts;
};
type ModelDesc = {
  name: string;
  keys: string[];
  fields: Record<string, FieldEntry>;
  relations: Record<string, RelationEntry>;
} & TierOpts;

const PREVIEW_NOTE =
  "may change in any release. Each change is listed in the [API changelog](https://manual.codecks.io/api-changelog/).";

/** Appended to a field, relation or model line, e.g. ` — **preview**`. */
function describeTier(tier: TierOpts): string {
  const parts: string[] = [];
  if (tier.stability === "preview") parts.push("**preview**");
  if (tier.deprecated) {
    const {since, removeAfter, use} = tier.deprecated;
    parts.push(
      `**deprecated** since ${since}, removed after ${removeAfter}${use ? `, use \`${use}\`` : ""}`
    );
  }
  return parts.length ? ` — ${parts.join(", ")}` : "";
}

/** The item's description as a continuation of its list entry, or `""`. */
function describeText(item: string): string {
  const text = TYPES.descriptions[item];
  return text ? `\n  ${text}` : "";
}

function generateModelDoc(modelName: string, desc: ModelDesc): string {
  const lines: string[] = [];
  lines.push(`# ${modelName}`);
  lines.push("");
  if (TYPES.descriptions[modelName]) {
    lines.push(TYPES.descriptions[modelName]);
    lines.push("");
  }
  if (desc.stability === "preview") {
    lines.push(`**preview**: this model ${PREVIEW_NOTE}`);
    lines.push("");
  }
  if (desc.deprecated) {
    lines.push(`This model is${describeTier({deprecated: desc.deprecated}).slice(2)}.`);
    lines.push("");
  }
  if (desc.keys.length > 0) {
    lines.push(`Key: \`${desc.keys.join("`, `")}\``);
    lines.push("");
  }

  // Fields
  const fieldEntries = Object.entries(desc.fields);
  if (fieldEntries.length > 0) {
    lines.push("## Fields");
    lines.push("");
    for (const [name, field] of fieldEntries) {
      const type = describeFieldType(desc.name, name, field);
      let fkOf = "";
      if (field.type === "belongsTo") {
        const rel = Object.entries(desc.relations).find(
          ([, r]) => r.options.type === "belongsTo" && r.options.fk === name
        );
        fkOf = rel ? `, foreign key of \`${rel[0]}\`` : ", foreign key";
      }
      lines.push(
        `- \`${name}\`: ${type}${fkOf}${describeTier(field)}${describeText(`${modelName}.${name}`)}`
      );
    }
    lines.push("");
  }

  // Relations
  const relationEntries = Object.entries(desc.relations);
  if (relationEntries.length > 0) {
    const belongsTo = relationEntries.filter(([, r]) => r.options.type === "belongsTo");
    const hasMany = relationEntries.filter(([, r]) => r.options.type === "hasMany");
    const hasOne = relationEntries.filter(([, r]) => r.options.type === "hasOne");

    lines.push("## Relations");
    lines.push("");

    if (belongsTo.length > 0) {
      lines.push("### belongsTo");
      lines.push("");
      for (const [name, rel] of belongsTo) {
        // Without an fk the API returns the relation under its own name; there's no id field.
        const via = rel.options.fk ? ` (via \`${rel.options.fk}\`)` : "";
        const opt = rel.options.optional ? ", optional" : "";
        lines.push(
          `- \`${name}\` → [${rel.relName}](${rel.relName}.md)${via}${opt}${describeTier(rel.options)}${describeText(`${modelName}.${name}`)}`
        );
      }
      lines.push("");
    }

    if (hasOne.length > 0) {
      lines.push("### hasOne");
      lines.push("");
      for (const [name, rel] of hasOne) {
        lines.push(
          `- \`${name}\` → [${rel.relName}](${rel.relName}.md)${describeTier(rel.options)}${describeText(`${modelName}.${name}`)}`
        );
      }
      lines.push("");
    }

    if (hasMany.length > 0) {
      lines.push("### hasMany");
      lines.push("");
      for (const [name, rel] of hasMany) {
        const fkAsArray = rel.options.fkAsArray
          ? " — `fkAsArray` (plain selection + `count`/`exists` only; no `filter`/`orderBy`/`limit`/`offset`/`first`)"
          : "";
        lines.push(
          `- \`${name}\` → [${rel.relName}](${rel.relName}.md)${fkAsArray}${describeTier(rel.options)}${describeText(`${modelName}.${name}`)}`
        );
      }
      lines.push("");
    }
  }

  return lines.join("\n");
}

function generateOverview(): string {
  const lines: string[] = [];
  lines.push("# @codecks/fetch Schema Overview");
  lines.push("");
  lines.push("## Stability");
  lines.push("");
  lines.push(
    "These files list what the Codecks API documents. Anything else the API answers is internal and can change without notice."
  );
  lines.push("");
  lines.push(
    "- **stable** (unmarked): changes only after a deprecation and 6 months' notice, see [Stability](https://manual.codecks.io/api/#stability)."
  );
  lines.push(`- **preview**: ${PREVIEW_NOTE} The TypeScript types mark these \`@experimental\`.`);
  lines.push(
    "- **deprecated**: still answered until the date given, then removed. The TypeScript types mark these `@deprecated`."
  );
  lines.push("");

  // Root entry points
  lines.push("## Root Entry Points");
  lines.push("");
  lines.push("These relations are available when using `fetchFromRoot`:");
  lines.push("");
  for (const [name, rel] of Object.entries(_rootDesc.relations)) {
    const r = rel as RelationEntry;
    lines.push(
      `- \`${name}\` (${r.options.type}) → [${r.relName}](models/${r.relName}.md)${describeTier(r.options)}${describeText(`_root.${name}`)}`
    );
  }
  lines.push("");

  lines.push("## Types");
  lines.push("");
  lines.push(
    `Model pages give each field's TypeScript type. Named types (enums, json shapes) are listed in [types.md](types.md) and exported from the package: ${Object.keys(
      TYPES.definitions
    )
      .sort()
      .map((name) => linkType(name, "root"))
      .join(", ")}.`
  );
  lines.push("");
  lines.push(
    'Enums are open unions like `"a" | "b" | (string & {})`: the API may add values, so handle unknown ones.'
  );
  lines.push("");

  lines.push("## Actions");
  lines.push("");
  lines.push(
    `Changes go through \`dispatch(name, params)\`. [actions.md](actions.md) lists all ${Object.keys(TYPES.actions).length}, with their params and responses.`
  );
  lines.push("");

  // Model index
  lines.push("## All Models");
  lines.push("");

  const models = Object.entries(modelMap).filter(([name]) => name !== "_root");
  for (const [name, desc] of models) {
    const d = desc as ModelDesc;
    const fieldCount = Object.keys(d.fields).length;
    const relCount = Object.keys(d.relations).length;
    const keys = d.keys.length > 0 ? ` (key: ${d.keys.join(", ")})` : "";
    lines.push(
      `- [${name}](models/${name}.md)${keys} — ${fieldCount} fields, ${relCount} relations${describeTier(d)}`
    );
  }
  lines.push("");

  return lines.join("\n");
}

function generateTypes(): string {
  const lines: string[] = [];
  lines.push("# Types");
  lines.push("");
  lines.push(
    "Named types used by the [models](overview.md#all-models). Each is exported from `@codecks/fetch`."
  );
  lines.push("");
  lines.push(
    "Enums are open unions: `(string & {})` keeps autocompletion for the listed values but admits new ones the API may add."
  );
  lines.push("");
  for (const name of Object.keys(TYPES.definitions).sort()) {
    const type = TYPES.definitions[name];
    lines.push(`## ${name}`);
    lines.push("");
    lines.push("```ts");
    lines.push(`type ${name} = ${type};`);
    lines.push("```");
    lines.push("");
    const refs = [...new Set(type.match(/\b[A-Z]\w*\b/g) ?? [])].filter(
      (ref) => ref in TYPES.definitions || ID_TYPE_TO_MODEL.has(ref)
    );
    if (refs.length > 0) {
      lines.push(`Uses ${refs.map((ref) => linkType(ref, "root")).join(", ")}.`);
      lines.push("");
    }
    const usedBy = Object.entries(TYPES.fields)
      .filter(([, fieldType]) => new RegExp(`\\b${name}\\b`).test(fieldType))
      .map(([key]) => {
        const [model] = key.split(".");
        return `[\`${key}\`](models/${model}.md)`;
      });
    if (usedBy.length > 0) {
      lines.push(`Used by ${usedBy.join(", ")}.`);
      lines.push("");
    }
  }
  return lines.join("\n");
}

function generateActions(): string {
  const lines: string[] = [];
  const entryLine = (e: ActionEntry, parentIsPreview: boolean) => {
    const tier = describeTier(parentIsPreview ? {deprecated: e.deprecated} : e);
    const optional = e.required ? "" : " (optional)";
    const text = e.description ? `\n  ${e.description}` : "";
    return `- \`${e.name}\`: ${linkType(e.type, "root")}${optional}${tier}${text}`;
  };
  lines.push("# Actions");
  lines.push("");
  lines.push(
    "Every change goes through an action, sent with `dispatch`. It returns the action's response, or `undefined` for an action without one."
  );
  lines.push("");
  lines.push("```ts");
  lines.push(
    'const {id, accountSeq} = await dispatch("cards/create", {content: "Fix login", deckId});'
  );
  lines.push('await dispatch("cards/update", {id, status: "done"});');
  lines.push("```");
  lines.push("");
  lines.push(
    "An enum in the params lists only the values the API accepts, unlike the open enums of the models. A param that is optional and nullable has three meanings: left out, it stays as it is; `null` clears it; a value sets it."
  );
  lines.push("");
  for (const [name, action] of Object.entries(TYPES.actions)) {
    const isPreview = action.stability === "preview";
    lines.push(`## ${name}`);
    lines.push("");
    if (action.description) {
      lines.push(action.description);
      lines.push("");
    }
    if (isPreview) {
      lines.push(`**preview**: this action ${PREVIEW_NOTE}`);
      lines.push("");
    }
    if (action.deprecated) {
      lines.push(`This action is${describeTier({deprecated: action.deprecated}).slice(2)}.`);
      lines.push("");
    }
    if (action.requires) {
      lines.push(action.requires);
      lines.push("");
    }
    lines.push("Params:");
    lines.push("");
    for (const param of action.params) lines.push(entryLine(param, isPreview));
    lines.push("");
    if (action.response) {
      lines.push("Response:");
      lines.push("");
      for (const key of action.response) lines.push(entryLine(key, isPreview));
    } else {
      lines.push("Response: none.");
    }
    lines.push("");
  }
  return lines.join("\n");
}

function generateQuerySyntax(): string {
  return `# Query Syntax Reference

## Basic Query

\`\`\`ts
const {fetchFromRoot, fetchInstance} = buildFetchers({
  token: "cdxat_…",
});

// Fetch from root entry points
const result = await fetchFromRoot({
  account: {fields: ["name", "subdomain"]},
});
// result.account.name, result.account.subdomain

// Fetch a specific instance by model + ID
const card = await fetchInstance("card", cardId, {
  fields: ["title", "status", "effort"],
});
// card.title, card.status, card.effort
\`\`\`

## Field Selection

\`fields\` is an array of field names to include in the response.
Key fields (like \`cardId\` for card, \`id\` for most models) are always returned.
The meta fields \`~model\` and \`~key\` are always included.

\`\`\`ts
{fields: ["title", "status", "createdAt"]}
\`\`\`

## Nested Relations

Use \`relations\` to traverse the object graph:

\`\`\`ts
const result = await fetchFromRoot({
  account: {
    fields: ["name"],
    relations: {
      cards: {
        fields: ["title", "status"],
        relations: {
          assignee: {fields: ["name"]},
          deck: {fields: ["title"]},
        },
      },
    },
  },
});
\`\`\`

## hasMany Variants

hasMany relations support different query types:

### Default (array)
\`\`\`ts
{cards: {fields: ["title", "status"]}}
// returns: cards: Array<{title, status, ...}>
\`\`\`

### count
\`\`\`ts
{cards: {type: "count", as: "cardCount"}}
// returns: cardCount: number
\`\`\`

### exists
\`\`\`ts
{cards: {type: "exists", as: "hasCards"}}
// returns: hasCards: boolean
\`\`\`

### first
\`\`\`ts
{cards: {type: "first", as: "latestCard", orderBy: "-createdAt", fields: ["title"]}}
// returns: latestCard: {title, ...} | null
\`\`\`

### Multiple variants of the same relation
Pass an array of queries with \`as\` aliases:
\`\`\`ts
{
  cards: [
    {as: "openCards", filter: {status: "started"}, fields: ["title"]},
    {as: "cardCount", type: "count"},
  ]
}
// returns: openCards: Array<...>, cardCount: number
\`\`\`

## Filtering (hasMany only)

\`\`\`ts
{
  cards: {
    fields: ["title"],
    filter: {
      status: "started",                          // exact match
      effort: {op: "gte", value: 3},              // comparison: lt, lte, gt, gte
      assigneeId: {op: "eq", value: userId},      // equality: eq, neq (supports null)
      tags: {op: "has", value: "bug"},             // array contains
      title: {op: "contains", value: "search"},   // string contains
      priority: {op: "in", value: ["high", "critical"]},  // in set
    },
  },
}
\`\`\`

### Logical operators
\`\`\`ts
{
  cards: {
    fields: ["title"],
    filter: {
      $or: [
        {status: "started"},
        {status: "done"},
      ],
    },
  },
}
\`\`\`

### Filter by relation
\`\`\`ts
{
  cards: {
    fields: ["title"],
    filter: {
      assignee: {name: "Alice"},           // cards where assignee.name = "Alice"
      "!milestone": {name: "Alpha"},       // negated: cards NOT in the "Alpha" milestone
    },
  },
}
\`\`\`

## Ordering (hasMany only)

\`\`\`ts
// Simple: field name, prefix with - for descending
{cards: {fields: ["title"], orderBy: "createdAt"}}
{cards: {fields: ["title"], orderBy: "-createdAt"}}

// Multiple
{cards: {fields: ["title"], orderBy: ["status", "-createdAt"]}}
\`\`\`

## Pagination (hasMany only)

A subset (\`limit\`/\`offset\`) requires an \`orderBy\` — the API rejects a subset
without an order. \`offset\` is only meaningful together with \`limit\`. The types
enforce this, so \`limit\` on its own is a compile error.

\`\`\`ts
{cards: {fields: ["title"], orderBy: "-createdAt", limit: 10, offset: 20}}
\`\`\`

## \`fkAsArray\` relations (limited capabilities)

A handful of hasMany relations are stored server-side as a plain id-array column
rather than a joined table. These are flagged as \`fkAsArray\` on their model
pages and currently are:

- \`card\`: \`childCards\`, \`inDeps\`, \`outDeps\`, \`cardReferences\`, \`attachments\`
- \`workflowItem\`: \`inDeps\`, \`outDeps\`

They support **only** plain selection (\`fields\` + nested \`relations\`) and the
\`count\`/\`exists\` aggregates. \`filter\`, \`orderBy\`, \`limit\`, \`offset\`, and
\`type: "first"\` are not supported (the API rejects them), and the types reflect
that.

\`\`\`ts
{childCards: {fields: ["cardId"]}}      // OK → array
{childCards: {type: "count", as: "n"}}  // OK → number
{childCards: {type: "exists", as: "hasChildren"}} // OK → boolean

// compile errors:
{childCards: {fields: ["cardId"], orderBy: "accountSeq"}}
{childCards: {fields: ["cardId"], limit: 50, orderBy: "accountSeq"}}
{childCards: {fields: ["cardId"], filter: {status: "started"}}}
\`\`\`
`;
}

// --- Main ---

// Clean and recreate
rmSync(SCHEMA_DIR, {recursive: true, force: true});
mkdirSync(join(SCHEMA_DIR, "models"), {recursive: true});

// Write overview
writeFileSync(join(SCHEMA_DIR, "overview.md"), generateOverview());

// Write named types
writeFileSync(join(SCHEMA_DIR, "types.md"), generateTypes());

writeFileSync(join(SCHEMA_DIR, "actions.md"), generateActions());

// Write query syntax
writeFileSync(join(SCHEMA_DIR, "query-syntax.md"), generateQuerySyntax());

// Write per-model files
const models = Object.entries(modelMap).filter(([name]) => name !== "_root");
for (const [name, desc] of models) {
  const doc = generateModelDoc(name, desc as ModelDesc);
  writeFileSync(join(SCHEMA_DIR, "models", `${name}.md`), doc);
}

console.log(
  `Generated schema docs: overview.md, types.md, actions.md, query-syntax.md, ${models.length} model files in schema/models/`
);

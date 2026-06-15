import {modelMap} from "../src/models/index";
import {_rootDesc} from "../src/models/_root";
import {writeFileSync, mkdirSync, rmSync} from "fs";
import {join} from "path";

const SCHEMA_DIR = join(import.meta.dirname, "..", "schema");

const FIELD_TYPE_MAP: Record<string, string> = {
  id: "string",
  string: "string",
  int: "number",
  bigint: "bigint",
  bool: "boolean",
  date: "Date (ISO string)",
  day: "{year, month, day}",
  obj: "object",
  array: "array",
  belongsTo: "string (foreign key ID)",
};

function describeFieldType(type: string): string {
  return FIELD_TYPE_MAP[type] ?? type;
}

type FieldEntry = {type: string; optional?: boolean};
type RelationEntry = {relName: string; options: {type: string; fk?: string}};
type ModelDesc = {
  name: string;
  keys: string[];
  fields: Record<string, FieldEntry>;
  relations: Record<string, RelationEntry>;
};

function generateModelDoc(modelName: string, desc: ModelDesc): string {
  const lines: string[] = [];
  lines.push(`# ${modelName}`);
  lines.push("");
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
      const opt = (field as any).optional ? ", optional" : "";
      if (field.type === "belongsTo") {
        // Find the matching relation to show the target model
        const rel = Object.values(desc.relations).find(
          (r) => r.options.type === "belongsTo" && r.options.fk === name
        );
        const target = rel ? ` → ${rel.relName}` : "";
        lines.push(`- \`${name}\`: ${describeFieldType(field.type)}${target}${opt}`);
      } else {
        lines.push(`- \`${name}\`: ${describeFieldType(field.type)}${opt}`);
      }
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
        lines.push(
          `- \`${name}\` → [${rel.relName}](${rel.relName}.md) (via \`${rel.options.fk}\`)`
        );
      }
      lines.push("");
    }

    if (hasOne.length > 0) {
      lines.push("### hasOne");
      lines.push("");
      for (const [name, rel] of hasOne) {
        lines.push(`- \`${name}\` → [${rel.relName}](${rel.relName}.md)`);
      }
      lines.push("");
    }

    if (hasMany.length > 0) {
      lines.push("### hasMany");
      lines.push("");
      for (const [name, rel] of hasMany) {
        lines.push(`- \`${name}\` → [${rel.relName}](${rel.relName}.md)`);
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

  // Root entry points
  lines.push("## Root Entry Points");
  lines.push("");
  lines.push("These relations are available when using `fetchFromRoot`:");
  lines.push("");
  for (const [name, rel] of Object.entries(_rootDesc.relations)) {
    const r = rel as RelationEntry;
    lines.push(`- \`${name}\` (${r.options.type}) → [${r.relName}](models/${r.relName}.md)`);
  }
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
      `- [${name}](models/${name}.md)${keys} — ${fieldCount} fields, ${relCount} relations`
    );
  }
  lines.push("");

  return lines.join("\n");
}

function generateQuerySyntax(): string {
  return `# Query Syntax Reference

## Basic Query

\`\`\`ts
const {fetchFromRoot, fetchInstance} = buildFetchersWithSimpleLoader({
  token: "your-api-token",
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
      "!deck": {isDeleted: "true"},        // negated: cards NOT in deleted decks
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

\`\`\`ts
{cards: {fields: ["title"], limit: 10, offset: 20}}
\`\`\`
`;
}

// --- Main ---

// Clean and recreate
rmSync(SCHEMA_DIR, {recursive: true, force: true});
mkdirSync(join(SCHEMA_DIR, "models"), {recursive: true});

// Write overview
writeFileSync(join(SCHEMA_DIR, "overview.md"), generateOverview());

// Write query syntax
writeFileSync(join(SCHEMA_DIR, "query-syntax.md"), generateQuerySyntax());

// Write per-model files
const models = Object.entries(modelMap).filter(([name]) => name !== "_root");
for (const [name, desc] of models) {
  const doc = generateModelDoc(name, desc as ModelDesc);
  writeFileSync(join(SCHEMA_DIR, "models", `${name}.md`), doc);
}

console.log(
  `Generated schema docs: overview.md, query-syntax.md, ${models.length} model files in schema/models/`
);

// The shape of `shared/api-reference.json` in the codecks repo, which lists only the `stable` and
// `preview` models and fields; `internal` ones never reach this package.
type Stability = "stable" | "preview";
type Deprecation = {since: string; removeAfter: string; use?: string};
type Tier = {stability: Stability; deprecated?: Deprecation};
/** A JSON Type Definition (RFC 8927), with the codecks repo's `metadata` keys. */
export type Schema = {
  type?: string;
  enum?: string[];
  ref?: string;
  elements?: Schema;
  properties?: {[key: string]: Schema};
  optionalProperties?: {[key: string]: Schema};
  values?: Schema;
  nullable?: boolean;
  metadata?: {model?: string; keyModel?: string; format?: string};
};
type RefField = Tier & {name: string; schema: Schema};
type RefRelation = Tier & {
  name: string;
  model: string;
  kind: "belongsTo" | "hasOne" | "hasMany";
  fk?: string;
  nullable: boolean;
  asField: boolean;
};
type RefModel = Tier & {
  name: string;
  idProps: string[];
  fields: RefField[];
  relations: RefRelation[];
};
export type ApiReference = {
  models: RefModel[];
  definitions: {[name: string]: {schema: Schema}};
  deprecations: {item: string; anchor: string}[];
};

const CHANGELOG_URL = "https://manual.codecks.io/api-changelog/";

const capitalizeFirst = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const NUMBER_TYPES = new Set([
  "int8",
  "uint8",
  "int16",
  "uint16",
  "int32",
  "uint32",
  "float32",
  "float64",
]);
const SCHEMA_KEYS = new Set([
  "type",
  "enum",
  "ref",
  "elements",
  "properties",
  "optionalProperties",
  "values",
  "nullable",
  "metadata",
]);
const METADATA_KEYS = new Set(["model", "keyModel", "format"]);

/** What rendering a schema needs to know, and what it collects for a file's imports. */
export type RenderContext = {
  definitions: ApiReference["definitions"];
  /** the model names whose id type the rendered code uses */
  idModels: Set<string>;
  /** the definitions the rendered code uses */
  refs: Set<string>;
  /** throws for a model without a single key or not in the reference */
  idTypeOf: (modelName: string) => string;
};

const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;

/**
 * Renders `schema` as a TS type. Timestamps and days are strings: the runtime only parses them at
 * the top level of a field, never inside a json value.
 */
export const renderSchema = (schema: Schema, ctx: RenderContext, item: string): string => {
  for (const key of Object.keys(schema)) {
    if (!SCHEMA_KEYS.has(key)) throw new Error(`${item}: unsupported schema form '${key}'`);
  }
  for (const key of Object.keys(schema.metadata ?? {})) {
    if (!METADATA_KEYS.has(key)) throw new Error(`${item}: unsupported metadata '${key}'`);
  }
  const forms = ["type", "enum", "ref", "elements", "values"].filter((k) => k in schema);
  const isProps = "properties" in schema || "optionalProperties" in schema;
  if (forms.length + (isProps ? 1 : 0) > 1) throw new Error(`${item}: mixes schema forms`);
  const {metadata = {}} = schema;
  if (metadata.model && schema.type !== "string") {
    throw new Error(`${item}: 'metadata.model' on a non-string`);
  }
  if (metadata.keyModel && !schema.values) {
    throw new Error(`${item}: 'metadata.keyModel' outside a values schema`);
  }
  if (metadata.format !== undefined && (metadata.format !== "day" || schema.type !== "string")) {
    throw new Error(`${item}: unsupported format '${metadata.format}'`);
  }

  const render = (): {ts: string; isUnion: boolean} => {
    if (schema.type !== undefined) {
      if (schema.type === "boolean") return {ts: "boolean", isUnion: false};
      if (NUMBER_TYPES.has(schema.type)) return {ts: "number", isUnion: false};
      if (schema.type === "timestamp") return {ts: "string", isUnion: false};
      if (schema.type === "string") {
        if (!metadata.model) return {ts: "string", isUnion: false};
        ctx.idModels.add(metadata.model);
        return {ts: ctx.idTypeOf(metadata.model), isUnion: false};
      }
      throw new Error(`${item}: unsupported type '${schema.type}'`);
    }
    if (schema.enum) {
      const literals = schema.enum.map((v) => JSON.stringify(v));
      return {ts: [...literals, "(string & {})"].join(" | "), isUnion: true};
    }
    if (schema.ref !== undefined) {
      if (!(schema.ref in ctx.definitions)) {
        throw new Error(`${item}: ref '${schema.ref}' has no definition`);
      }
      ctx.refs.add(schema.ref);
      return {ts: schema.ref, isUnion: false};
    }
    if (schema.elements) {
      const inner = renderSchema(schema.elements, ctx, `${item}[]`);
      const needsParens = schema.elements.enum || schema.elements.nullable;
      return {ts: needsParens ? `(${inner})[]` : `${inner}[]`, isUnion: false};
    }
    if (isProps) {
      const entries = [
        ...Object.entries(schema.properties ?? {}).map(([k, s]) => [k, s, ""] as const),
        ...Object.entries(schema.optionalProperties ?? {}).map(([k, s]) => [k, s, "?"] as const),
      ].map(([key, s, opt]) => {
        const name = IDENTIFIER.test(key) ? key : JSON.stringify(key);
        return `${name}${opt}: ${renderSchema(s, ctx, `${item}.${key}`)}`;
      });
      return {ts: `{${entries.join("; ")}}`, isUnion: false};
    }
    if (schema.values) {
      const value = renderSchema(schema.values, ctx, `${item}{}`);
      if (!metadata.keyModel) return {ts: `{[key: string]: ${value}}`, isUnion: false};
      ctx.idModels.add(metadata.keyModel);
      return {
        ts: `{[${metadata.keyModel}Id: ${ctx.idTypeOf(metadata.keyModel)}]: ${value}}`,
        isUnion: false,
      };
    }
    return {ts: "unknown", isUnion: false};
  };
  const {ts} = render();
  return schema.nullable ? `${ts} | null` : ts;
};

const jsDoc = (anchors: Map<string, string>, item: string, tier: Tier, indent: string) => {
  const lines: string[] = [];
  if (tier.stability === "preview") {
    lines.push("@experimental `preview` in the Codecks API: may change in any release.");
  }
  if (tier.deprecated) {
    const {since, removeAfter, use} = tier.deprecated;
    const anchor = anchors.get(item);
    lines.push(
      `@deprecated since ${since}, removed after ${removeAfter}.${use ? ` Use \`${use}\` instead.` : ""}`
    );
    if (anchor) lines.push(`${CHANGELOG_URL}#${anchor}`);
  }
  if (!lines.length) return "";
  if (lines.length === 1) return `${indent}/** ${lines[0]} */\n`;
  return `${indent}/**\n${lines.map((l) => `${indent} * ${l}`).join("\n")}\n${indent} */\n`;
};

/** The runtime part of a tier, read by `generate-schema-docs.ts`. `stable` is the default. */
const tierOpts = (tier: Tier) => {
  const parts: string[] = [];
  if (tier.stability !== "stable") parts.push(`stability: "${tier.stability}"`);
  if (tier.deprecated) parts.push(`deprecated: ${JSON.stringify(tier.deprecated)}`);
  return parts;
};

const optsLiteral = (parts: string[]) => `{${parts.join(", ")}}`;

const fileNameOf = (modelName: string) =>
  modelName === "_root" ? "_root" : capitalizeFirst(modelName);

const importIds = (idModels: Set<string>, idTypeOf: (m: string) => string, from: string) =>
  [...idModels].sort().map((m) => `import type {${idTypeOf(m)}} from "${from}${fileNameOf(m)}";`);

/** Every generated file's content, keyed by file name within `src/models/`. */
export const generate = (reference: ApiReference) => {
  const anchors = new Map(reference.deprecations.map((d) => [d.item, d.anchor]));
  const modelsByName = new Map(reference.models.map((m) => [m.name, m]));
  const {definitions} = reference;

  /** Only models with a single key get a nominal id type that other models can point to. */
  const idTypeOf = (modelName: string) => {
    const model = modelsByName.get(modelName);
    if (!model) throw new Error(`'${modelName}' isn't a documented model`);
    if (model.idProps.length !== 1) throw new Error(`'${modelName}' has no single key`);
    return `${capitalizeFirst(modelName)}Id`;
  };
  const newContext = (): RenderContext => ({
    definitions,
    idModels: new Set(),
    refs: new Set(),
    idTypeOf,
  });

  /** For `_types.json`: each field's and definition's type as TS, without its top-level `null`. */
  const types = {
    fields: {} as {[item: string]: string},
    definitions: {} as {[name: string]: string},
  };

  function generateModel(model: RefModel) {
    const Name = capitalizeFirst(model.name);
    const ctx = newContext();
    const fieldLines: string[] = [];
    const relationLines: string[] = [];
    const fieldsByName = new Map(model.fields.map((f) => [f.name, f]));
    const hasOwnIdType = model.name !== "_root" && model.idProps.length === 1;
    const relationNames = new Set(model.relations.map((r) => r.name));

    const belongsToFks = new Map<string, RefRelation>();
    for (const rel of model.relations) {
      const item = `${model.name}.${rel.name}`;
      const getOpts = () => {
        switch (rel.kind) {
          case "belongsTo": {
            if (!rel.fk) throw new Error(`${item}: a belongsTo without an fk`);
            idTypeOf(rel.model);
            const nullable = rel.nullable ? ["optional: true"] : [];
            // `resolvable.closedBy`'s fk is its own name: the relation is its own field
            if (relationNames.has(rel.fk)) {
              if (rel.fk !== rel.name) throw new Error(`${item}: its fk is another relation`);
              return [`type: "belongsTo"`, ...nullable];
            }
            if (!fieldsByName.has(rel.fk)) {
              throw new Error(`${item}: its fk '${rel.fk}' isn't a listed field`);
            }
            belongsToFks.set(rel.fk, rel);
            return [`type: "belongsTo"`, `fk: "${rel.fk}"`, ...nullable];
          }
          case "hasOne":
            return [`type: "hasOne"`];
          case "hasMany":
            return rel.asField ? [`type: "hasMany"`, `fkAsArray: true`] : [`type: "hasMany"`];
          default:
            throw new Error(`${item}: unknown relation kind '${(rel as RefRelation).kind}'`);
        }
      };
      if (!modelsByName.has(rel.model)) throw new Error(`${item}: '${rel.model}' isn't documented`);
      const opts = [...getOpts(), ...tierOpts(rel)];
      relationLines.push(
        `${jsDoc(anchors, item, rel, "    ")}    ${rel.name}: relation("${rel.model}", ${optsLiteral(opts)}),`
      );
    }

    for (const field of [...model.fields].sort((a, b) => (a.name > b.name ? 1 : -1))) {
      const {name} = field;
      const item = `${model.name}.${name}`;
      const {nullable, ...schema} = field.schema;
      const opts = optsLiteral([...(nullable ? ["optional: true"] : []), ...tierOpts(field)]);
      const isIdProp = model.idProps.includes(name);
      const rel = belongsToFks.get(name);
      const {metadata = {}} = schema;
      // renders the type even when the field function doesn't need it, so that anything the
      // reference holds that this script can't place throws
      const ts = renderSchema(schema, ctx, item);
      types.fields[item] = ts;
      const getCall = () => {
        if (hasOwnIdType && name === model.idProps[0]) {
          if (metadata.model !== model.name) throw new Error(`${item}: an id of another model`);
          return `f.id<${Name}Id>()`;
        }
        if (rel) {
          if (metadata.model !== rel.model) {
            throw new Error(`${item}: the fk of '${rel.name}' names the model '${metadata.model}'`);
          }
          return `f.belongsTo(${opts}).type<${ts}>()`;
        }
        if (schema.type === "timestamp") return `f.date(${opts})`;
        // a day that is a key stays the string the cache key is built from
        if (metadata.format === "day" && !isIdProp) return `f.day(${opts})`;
        if (schema.type === "int32") return `f.int(${opts})`;
        if (schema.type === "boolean") return `f.bool(${opts})`;
        if (schema.type === "string" && !metadata.model) return `f.string(${opts})`;
        return `f.typed(${opts}).type<${ts}>()`;
      };
      const call = getCall();
      fieldLines.push(`${jsDoc(anchors, item, field, "    ")}    ${name}: ${call},`);
    }

    ctx.idModels.delete(model.name);
    const imports = [
      `import {makeModel${relationLines.length ? ", relation" : ""}} from "./_desc";`,
      ...(fieldLines.length ? [`import * as f from "./_fields";`] : []),
      ...(hasOwnIdType ? [`import type {Nominal} from "./_type-helpers";`] : []),
      ...(ctx.refs.size
        ? [`import type {${[...ctx.refs].sort().join(", ")}} from "./definitions";`]
        : []),
      ...importIds(ctx.idModels, idTypeOf, "./"),
    ];
    const modelOpts = tierOpts(model).map((p) => `  ${p},\n`);

    return `${imports.join("\n")}

${hasOwnIdType ? `export type ${Name}Id = Nominal<string, "${model.name}">;\n` : ""}${jsDoc(anchors, model.name, model, "")}export const ${model.name}Desc = makeModel({
  name: "${model.name}",
${modelOpts.join("")}  fields: {
${fieldLines.join("\n")}
  },
  relations: {
${relationLines.join("\n")}
  },
  keys: [${model.idProps.map((k) => `"${k}"`).join(", ")}],
});
`;
  }

  const files: {[fileName: string]: string} = {};
  for (const model of reference.models) {
    files[`${fileNameOf(model.name)}.ts`] = generateModel(model);
  }

  const defCtx = newContext();
  const defLines = Object.keys(definitions)
    .sort()
    .map((name) => {
      const ts = renderSchema(definitions[name].schema, defCtx, name);
      types.definitions[name] = ts;
      return `export type ${name} = ${ts};`;
    });
  files["definitions.ts"] = `${[...importIds(defCtx.idModels, idTypeOf, "./")].join("\n")}${
    defCtx.idModels.size ? "\n\n" : ""
  }${defLines.join("\n")}
`;

  files["index.ts"] = `${reference.models
    .map((m) => `import {${m.name}Desc} from "./${fileNameOf(m.name)}";`)
    .join("\n")}

export const modelMap = {
${reference.models.map((m) => `${jsDoc(anchors, m.name, m, "  ")}  ${m.name}: ${m.name}Desc,`).join("\n")}
};
`;

  /** Every single-key model's id type, for `src/index.ts` to re-export. */
  files["ids.ts"] = `${reference.models
    .filter((m) => m.name !== "_root" && m.idProps.length === 1)
    .map((m) => `export type {${idTypeOf(m.name)}} from "./${fileNameOf(m.name)}";`)
    .join("\n")}
`;

  files["_types.json"] = `${JSON.stringify(types, null, 2)}\n`;
  return files;
};

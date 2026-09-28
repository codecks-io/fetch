import {describe, expect, it} from "vitest";
import {renderSchema, type RenderContext, type Schema} from "../scripts/models-from-reference";

const context = (): RenderContext => ({
  definitions: {Priority: {schema: {enum: ["a", "b", "c"]}}},
  idModels: new Set(),
  refs: new Set(),
  idTypeOf: (model) => {
    if (model !== "user") throw new Error(`'${model}' isn't a documented model`);
    return "UserId";
  },
});
const render = (schema: Schema) => renderSchema(schema, context(), "test");

describe("renderSchema", () => {
  it.each<[Schema, string]>([
    [{}, "unknown"],
    [{type: "boolean"}, "boolean"],
    [{type: "int32"}, "number"],
    [{type: "float64"}, "number"],
    [{type: "string"}, "string"],
    [{type: "string", metadata: {model: "user"}}, "UserId"],
    [{type: "string", metadata: {format: "day"}}, "string"],
    [{type: "timestamp"}, "string"],
    [{enum: ["a", "b"]}, `"a" | "b" | (string & {})`],
    [{ref: "Priority"}, "Priority"],
    [{elements: {type: "string"}}, "string[]"],
    [{elements: {enum: ["a"]}}, `("a" | (string & {}))[]`],
    [{elements: {type: "string", nullable: true}}, "(string | null)[]"],
    [
      {properties: {a: {type: "int32"}}, optionalProperties: {b: {type: "string"}}},
      "{a: number; b?: string}",
    ],
    [{properties: {"a-b": {type: "int32"}}}, `{"a-b": number}`],
    [{values: {type: "int32"}, metadata: {keyModel: "user"}}, "{[userId: UserId]: number}"],
    [{values: {type: "int32"}}, "{[key: string]: number}"],
    [{type: "string", nullable: true}, "string | null"],
    [{ref: "Priority", nullable: true}, "Priority | null"],
  ])("renders %j as %s", (schema, ts) => {
    expect(render(schema)).toBe(ts);
  });

  it("collects the ids and definitions it uses", () => {
    const ctx = context();
    renderSchema(
      {
        properties: {
          p: {ref: "Priority"},
          u: {elements: {type: "string", metadata: {model: "user"}}},
        },
      },
      ctx,
      "test"
    );
    expect([...ctx.refs]).toEqual(["Priority"]);
    expect([...ctx.idModels]).toEqual(["user"]);
  });

  it.each<[string, Schema]>([
    ["a discriminator", {discriminator: "kind", mapping: {}} as Schema],
    ["additionalProperties", {properties: {}, additionalProperties: true} as Schema],
    ["an unknown type", {type: "bigint"}],
    ["a ref without a definition", {ref: "Nope"}],
    ["an undocumented model", {type: "string", metadata: {model: "secret"}}],
    ["an undocumented keyModel", {values: {type: "int32"}, metadata: {keyModel: "secret"}}],
    ["an unknown format", {type: "string", metadata: {format: "email"}}],
    ["unknown metadata", {type: "string", metadata: {color: "red"}} as Schema],
    ["mixed forms", {type: "string", enum: ["a"]}],
    ["a nested bad schema", {elements: {discriminator: "kind"} as Schema}],
  ])("throws on %s", (_, schema) => {
    expect(() => render(schema)).toThrow();
  });
});

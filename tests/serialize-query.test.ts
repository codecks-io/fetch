import { expect, test } from "vitest";
import { serializeRootQuery } from "../src/query-helpers";

test("simple field", () => {
  expect(
    serializeRootQuery({
      account: { fields: ["name"] },
    }),
  ).toEqual({ _root: { account: ["name"] } });
});

test("belongs to", () => {
  expect(
    serializeRootQuery({
      account: { relations: { disabledByUser: { fields: ["name"] } } },
    }),
  ).toEqual({ _root: { account: [{ disabledBy: ["name"] }] } });
});

test("has many", () => {
  expect(
    serializeRootQuery({
      account: { relations: { roles: { fields: ["role"] } } },
    }),
  ).toEqual({ _root: { account: [{ roles: ["role"] }] } });
});

test("has many", () => {
  expect(
    serializeRootQuery({
      account: { relations: { roles: { fields: ["role"] } } },
    }),
  ).toEqual({ _root: { account: [{ roles: ["role"] }] } });
});

test("complex", () => {
  expect(
    serializeRootQuery({
      account: {
        fields: ["subdomain"],
        relations: {
          roles: {
            fields: ["role"],
            relations: { user: { fields: ["name"] } },
          },
        },
      },
    }),
  ).toEqual({
    _root: { account: ["subdomain", { roles: ["role", { user: ["name"] }] }] },
  });
});

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
      account: { relations: { disabledBy: { fields: ["name"] } } },
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

test("has many named", () => {
  expect(
    serializeRootQuery({
      account: { relations: { roles: [{ fields: ["role"], as: "myRoles" }] } },
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

test("has many count", () => {
  expect(
    serializeRootQuery({
      account: { relations: { roles: { type: "count", as: "roleCount" } } },
    }),
  ).toEqual({ _root: { account: ["count(roles)"] } });
});

test("has many first", () => {
  expect(
    serializeRootQuery({
      account: {
        fields: ["name"],
        relations: {
          roles: {
            type: "first",
            as: "firstRole",
            orderBy: "-accountId",
            fields: ["role"],
          },
        },
      },
    }),
  ).toEqual({
    _root: {
      account: [
        "name",
        { 'roles({"$first":true,"$order":"-accountId"})': ["role"] },
      ],
    },
  });
});

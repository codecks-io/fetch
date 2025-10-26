import {expect, test} from "vitest";
import {makeModelQuerySerializable, serializeInstanceQuery} from "../src/query-helpers";
import {modelMap} from "../src/models";
import type {RelQuery} from "../src/query-type";
import type {_rootDesc} from "../src/models/_root";

const serializeRootQuery = <T extends RelQuery<typeof _rootDesc, typeof modelMap>>(
  q: T
): Record<string, unknown> => {
  return serializeInstanceQuery(makeModelQuerySerializable({relations: q}), [
    {"~model": "_root", "~key": ""},
  ]);
};

test("simple field", () => {
  expect(
    serializeRootQuery({
      account: {fields: ["name"]},
    })
  ).toEqual({_root: [{account: ["name"]}]});
});

test("belongs to", () => {
  expect(
    serializeRootQuery({
      account: {relations: {disabledBy: {fields: ["name"]}}},
    })
  ).toEqual({_root: [{account: [{disabledBy: ["name"]}]}]});
});

test("has many", () => {
  expect(
    serializeRootQuery({
      account: {relations: {roles: {fields: ["role"]}}},
    })
  ).toEqual({_root: [{account: [{roles: ["role"]}]}]});
});

test("has many", () => {
  expect(
    serializeRootQuery({
      account: {relations: {roles: {fields: ["role"]}}},
    })
  ).toEqual({_root: [{account: [{roles: ["role"]}]}]});
});

test("has many named", () => {
  expect(
    serializeRootQuery({
      account: {relations: {roles: [{fields: ["role"], as: "myRoles"}]}},
    })
  ).toEqual({_root: [{account: [{roles: ["role"]}]}]});
});

test("complex", () => {
  expect(
    serializeRootQuery({
      account: {
        fields: ["subdomain"],
        relations: {
          roles: {
            fields: ["role"],
            relations: {user: {fields: ["name"]}},
          },
        },
      },
    })
  ).toEqual({
    _root: [{account: ["subdomain", {roles: ["role", {user: ["name"]}]}]}],
  });
});

test("has many count", () => {
  expect(
    serializeRootQuery({
      account: {relations: {roles: {type: "count", as: "roleCount"}}},
    })
  ).toEqual({_root: [{account: ["count:roles"]}]});
});

test("has many count on root", () => {
  expect(
    serializeRootQuery({
      releases: {
        type: "count",
        as: "releaseCount",
        filter: {
          createdAt: {op: "gt", value: "2025-01-01"},
        },
      },
    })
  ).toEqual({
    _root: ['count:releases({"createdAt":{"op":"gt","value":"2025-01-01"}})'],
  });
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
    })
  ).toEqual({
    _root: [
      {
        account: ["name", {'roles({"$first":true,"$order":"-accountId"})': ["role"]}],
      },
    ],
  });
});

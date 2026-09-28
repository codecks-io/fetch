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
      loggedInUser: {fields: ["name"]},
      account: {relations: {cards: {relations: {deck: {fields: ["title"]}}}}},
    })
  ).toEqual({_root: [{loggedInUser: ["name"], account: [{cards: [{deck: ["title"]}]}]}]});
});

test("has many", () => {
  expect(
    serializeRootQuery({
      account: {relations: {projects: {fields: ["name"]}}},
    })
  ).toEqual({_root: [{account: [{projects: ["name"]}]}]});
});

test("has many named", () => {
  expect(
    serializeRootQuery({
      account: {relations: {projects: [{fields: ["name"], as: "myProjects"}]}},
    })
  ).toEqual({_root: [{account: [{projects: ["name"]}]}]});
});

test("complex", () => {
  expect(
    serializeRootQuery({
      account: {
        fields: ["name"],
        relations: {
          cards: {
            fields: ["title"],
            relations: {assignee: {fields: ["name"]}},
          },
        },
      },
    })
  ).toEqual({
    _root: [{account: ["name", {cards: ["title", {assignee: ["name"]}]}]}],
  });
});

test("has many count", () => {
  expect(
    serializeRootQuery({
      account: {relations: {projects: {type: "count", as: "projectCount"}}},
    })
  ).toEqual({_root: [{account: ["count:projects"]}]});
});

test("has many count with a filter", () => {
  expect(
    serializeRootQuery({
      account: {
        relations: {
          cards: {
            type: "count",
            as: "cardCount",
            filter: {
              createdAt: {op: "gt", value: new Date("2025-01-01T00:00:00.000Z")},
            },
          },
        },
      },
    })
  ).toEqual({
    _root: [
      {account: ['count:cards({"createdAt":{"op":"gt","value":"2025-01-01T00:00:00.000Z"}})']},
    ],
  });
});

test("has many first", () => {
  expect(
    serializeRootQuery({
      account: {
        fields: ["name"],
        relations: {
          projects: {
            type: "first",
            as: "newestProject",
            orderBy: "-createdAt",
            fields: ["name"],
          },
        },
      },
    })
  ).toEqual({
    _root: [
      {
        account: ["name", {'projects({"$first":true,"$order":"-createdAt"})': ["name"]}],
      },
    ],
  });
});

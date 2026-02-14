import {test, expect} from "vitest";
import {ApiRequester} from "../src/_exploration/api-requester";
import type {MissingDataRequest} from "../src/_exploration/loader-types";
import {getRelKey, makeRelQuerySerializable} from "../src/query-helpers";

const testRequest = async (requests: MissingDataRequest[]) => {
  let body = null;
  const requester = new ApiRequester({
    fetch: async (path, opts) => {
      body = JSON.parse(opts?.body as string).query;
      return {status: 200, json: async () => ({})} as Response;
    },
  });
  await requester.request(requests);
  return body;
};

test("ApiRequester - single field request", async () => {
  const requests: MissingDataRequest[] = [
    {type: "field", model: "account", id: "1", field: "name"},
    {type: "field", model: "account", id: "1", field: "subdomain"},
  ];

  expect(await testRequest(requests)).toEqual({
    "account(1)": ["name", "subdomain"],
  });
});

test("ApiRequester - relation request", async () => {
  const requests: MissingDataRequest[] = [
    {type: "field", model: "account", id: "1", field: "name"},
    {
      type: "relation",
      model: "account",
      id: "1",
      relKey: "disabledBy",
      contents: makeRelQuerySerializable({fields: ["name"]}),
    },
  ];

  expect(await testRequest(requests)).toEqual({
    "account(1)": ["name", {disabledBy: ["name"]}],
  });
});

test("ApiRequester - hasMany relation", async () => {
  const requests: MissingDataRequest[] = [
    {type: "field", model: "account", id: "1", field: "name"},
    {
      type: "relation",
      model: "account",
      id: "1",
      relKey: "roles",
      contents: makeRelQuerySerializable({fields: ["role"]}),
    },
  ];

  expect(await testRequest(requests)).toEqual({
    "account(1)": ["name", {roles: ["role"]}],
  });
});

test("ApiRequester - empty requests", async () => {
  expect(await testRequest([])).toBeNull();
});

test("ApiRequester - hasMany with orderBy (first)", async () => {
  const q = {
    as: "firstRole",
    type: "first",
    orderBy: "-accountId",
    fields: ["role"],
  } as any;
  const requests: MissingDataRequest[] = [
    {type: "field", model: "account", id: "1", field: "name"},
    {
      type: "relation",
      model: "account",
      id: "1",
      relKey: getRelKey(q, "roles"),
      contents: makeRelQuerySerializable(q),
    },
  ];

  expect(await testRequest(requests)).toEqual({
    "account(1)": ["name", {'roles({"$first":true,"$order":"-accountId"})': ["role"]}],
  });
});

test("ApiRequester - multiple hasMany relation", async () => {
  const requests: MissingDataRequest[] = [
    {type: "field", model: "account", id: "1", field: "name"},
    {
      type: "relation",
      model: "account",
      id: "1",
      relKey: "roles",
      contents: makeRelQuerySerializable({
        relations: {
          user: {fields: ["name"]},
        },
      }),
    },
    {
      type: "relation",
      model: "account",
      id: "1",
      relKey: "roles",
      contents: makeRelQuerySerializable({
        relations: {
          user: {fields: ["fullName"]},
        },
      }),
    },
  ];

  expect(await testRequest(requests)).toEqual({
    "account(1)": ["name", {roles: [{user: ["name", "fullName"]}]}],
  });
});

test("ApiRequester - multiple belongsTo", async () => {
  const requests: MissingDataRequest[] = [
    {type: "field", model: "account", id: "1", field: "name"},
    {
      type: "relation",
      model: "account",
      id: "1",
      relKey: "disabledBy",
      contents: makeRelQuerySerializable({fields: ["name"]}),
    },
    {
      type: "relation",
      model: "account",
      id: "1",
      relKey: "disabledBy",
      contents: makeRelQuerySerializable({fields: ["fullName"]}),
    },
  ];

  // The two relation requests should be merged
  expect(await testRequest(requests)).toEqual({
    "account(1)": ["name", {disabledBy: ["name", "fullName"]}],
  });
});

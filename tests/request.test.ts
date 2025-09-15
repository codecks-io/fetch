import { test, expect } from "vitest";
import { buildFetchers } from "../src/queries";

const myAccountInstance = { "~model": "account", "~key": "1" } as const;

const getFetchers = () =>
  buildFetchers({
    baseUrl: "https://api.example.com/",
  });

test("base root test", async () => {
  const { fetchFromRoot } = getFetchers();
  const response = await fetchFromRoot({
    account: {
      fields: ["name"],
    },
  });
  // response.account.
  expect(response).toEqual({
    account: { "~model": "account", "~key": "1", name: "myOrg", id: 1 },
  });
});

test("base model test", async () => {
  const { fetchFromInstance } = getFetchers();
  const response = await fetchFromInstance(myAccountInstance, {
    fields: ["name", "subdomain"],
  });
  expect(response).toEqual({
    "~model": "account",
    "~key": "1",
    id: 1,
    name: "myOrg",
    subdomain: "myorg",
  });
});

test("belongsTo", async () => {
  const { fetchFromInstance } = getFetchers();
  const response = await fetchFromInstance(myAccountInstance, {
    fields: ["name"],
    relations: { disabledBy: { fields: ["name"] } },
  });
  expect(response).toEqual({
    "~model": "account",
    "~key": "1",
    id: 1,
    name: "myOrg",
    disabledById: 2,
    disabledBy: {
      "~model": "user",
      "~key": "2",
      id: 2,
      name: "daniel",
    },
  });
});

test("belongsToIsNull", async () => {
  const { fetchFromInstance } = getFetchers();
  const response = await fetchFromInstance(
    { "~model": "account", "~key": "2" },
    { fields: ["name"], relations: { disabledBy: { fields: ["name"] } } },
  );
  expect(response).toEqual({
    "~model": "account",
    "~key": "2",
    id: 2,
    name: "myOrg2",
    disabledById: null,
    disabledBy: null,
  });
});

test("hasMany", async () => {
  const { fetchFromInstance } = getFetchers();
  const response = await fetchFromInstance(myAccountInstance, {
    fields: ["name"],
    relations: { roles: { fields: ["role"] } },
  });
  response.roles[0];

  expect(response).toEqual({
    "~model": "account",
    "~key": "1",
    id: 1,
    name: "myOrg",
    "~roles": ["[1,1]", "[1,2]"],
    roles: [
      {
        "~model": "accountRole",
        "~key": "[1,1]",
        accountId: 1,
        userId: 1,
        role: "admin",
      },
      {
        "~model": "accountRole",
        "~key": "[1,2]",
        accountId: 1,
        userId: 2,
        role: "member",
      },
    ],
  });
});

test("hasManyNamed", async () => {
  const { fetchFromInstance } = getFetchers();
  const response = await fetchFromInstance(myAccountInstance, {
    fields: ["name"],
    relations: { roles: { as: "myRoles", fields: ["role"] } },
  });
  response.myRoles[0];

  expect(response).toEqual({
    "~model": "account",
    "~key": "1",
    id: 1,
    name: "myOrg",
    "~myRoles": ["[1,1]", "[1,2]"],
    myRoles: [
      {
        "~model": "accountRole",
        "~key": "[1,1]",
        accountId: 1,
        userId: 1,
        role: "admin",
      },
      {
        "~model": "accountRole",
        "~key": "[1,2]",
        accountId: 1,
        userId: 2,
        role: "member",
      },
    ],
  });
});

test("hasManyNamedInArray", async () => {
  const { fetchFromInstance } = getFetchers();
  const response = await fetchFromInstance(myAccountInstance, {
    fields: ["name"],
    relations: { roles: [{ as: "myRoles", fields: ["role"] }] },
  });
  response.myRoles[0];

  expect(response).toEqual({
    "~model": "account",
    "~key": "1",
    id: 1,
    name: "myOrg",
    "~myRoles": ["[1,1]", "[1,2]"],
    myRoles: [
      {
        "~model": "accountRole",
        "~key": "[1,1]",
        accountId: 1,
        userId: 1,
        role: "admin",
      },
      {
        "~model": "accountRole",
        "~key": "[1,2]",
        accountId: 1,
        userId: 2,
        role: "member",
      },
    ],
  });
});

test("transform fields", async () => {
  const { fetchFromInstance } = getFetchers();
  const response = await fetchFromInstance(myAccountInstance, {
    fields: ["createdAt"],
  });
  expect(response).toEqual({
    "~model": "account",
    "~key": "1",
    id: 1,
    createdAt: new Date("2015-01-01T00:00:00.000Z"),
  });
});

test("hasMany - count", async () => {
  const { fetchFromInstance } = getFetchers();
  const response = await fetchFromInstance(myAccountInstance, {
    fields: ["name"],
    relations: { roles: { type: "count", as: "roleCount" } },
  });
  response.roleCount;
  expect(response).toEqual({
    "~model": "account",
    "~key": "1",
    id: 1,
    name: "myOrg",
    roleCount: 1,
  });
});

test("hasMany - first", async () => {
  const { fetchFromInstance } = getFetchers();
  const response = await fetchFromInstance(myAccountInstance, {
    fields: ["name"],
    relations: {
      roles: {
        type: "first",
        as: "firstRole",
        orderBy: "-accountId",
        fields: ["role"],
        filter: {
          role: null,
        },
      },
    },
  });
  response.firstRole;
});

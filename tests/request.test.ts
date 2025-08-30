import { test, expect } from "vitest";
import { buildFetchers } from "../src/queries";
import { accountDesc } from "../src/models/Account";

const getFetchers = () =>
  buildFetchers({
    baseUrl: "https://api.example.com/",
  });

test("base root test", async () => {
  const { fetchFromRoot } = getFetchers();
  const response = await fetchFromRoot({
    account: {
      fields: ["name", "billingCity"],
    },
  });
  await expect(response).toEqual({
    account: { "~model": "account", "~key": "1", name: "myOrg", id: 1 },
  });
});

test("base model test", async () => {
  const { fetchFromInstance } = getFetchers();
  const response = await fetchFromInstance(
    { "~model": accountDesc, "~key": "1" },
    { fields: ["name", "subdomain"] },
  );
  await expect(response).toEqual({
    "~model": "account",
    "~key": "1",
    id: 1,
    name: "myOrg",
    subdomain: "myorg",
  });
});

test("belongsTo", async () => {
  const { fetchFromInstance } = getFetchers();
  const response = await fetchFromInstance(
    { "~model": accountDesc, "~key": "1" },
    { fields: ["name"], relations: { disabledBy: { fields: ["name"] } } },
  );
  await expect(response).toEqual({
    "~model": "account",
    "~key": "1",
    id: 1,
    name: "myOrg",
    disabledBy: 2,
    disabledByUser: {
      "~model": "user",
      "~key": "2",
      id: 2,
      name: "daniel",
    },
  });
});

// test("belongsToIsNull", async () => {
//   const { fetchFromInstance } = getFetchers();
//   const response = await fetchFromInstance(
//     { "~model": accountDesc, "~key": "2" },
//     { fields: ["name"], relations: { disabledByUser: { fields: ["name"] } } },
//   );
//   await expect(response).toEqual({
//     "~model": "account",
//     "~key": "2",
//     id: 2,
//     name: "myOrg2",
//     disabledBy: null,
//     disabledByUser: null,
//   });
// });

test("hasMany", async () => {
  const { fetchFromInstance } = getFetchers();
  const response = await fetchFromInstance(
    { "~model": accountDesc, "~key": "1" },
    { fields: ["name"], relations: { roles: { fields: ["role"] } } },
  );

  await expect(response).toEqual({
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

// test("haOne", async () => {
//   const { fetchFromRoot } = getFetchers();
//   const response = await fetchFromRoot({ account: { fields: ["name"] } });

//   // TODO:
//   await expect(response).toEqual(null);
// });

// test("hasManyNamed", async () => {
//   const { fetchFromInstance } = getFetchers();
//   const response = await fetchFromInstance(
//     { "~model": accountDesc, "~key": "1" },
//     {
//       fields: ["name"],
//       relations: { roles: { as: "myRoles", fields: ["role"] } },
//     },
//   );
//   await expect(response).toEqual({
//     "~model": "account",
//     "~key": "1",
//     id: 1,
//     name: "myOrg",
//     "~myRoles": ["[1,1]", "[1,2]"],
//     myRoles: [
//       {
//         "~model": "accountRole",
//         "~key": "[1,1]",
//         accountId: 1,
//         userId: 1,
//         role: "admin",
//       },
//       {
//         "~model": "accountRole",
//         "~key": "[1,2]",
//         accountId: 1,
//         userId: 2,
//         role: "member",
//       },
//     ],
//   });
// });

test("hasManyNamedInArray", async () => {
  const { fetchFromInstance } = getFetchers();
  const response = await fetchFromInstance(
    { "~model": accountDesc, "~key": "1" },
    {
      fields: ["name"],
      relations: { roles: [{ as: "myRoles", fields: ["role"] }] },
    },
  );

  await expect(response).toEqual({
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

// test("transform fields", async () => {
//   const { fetchFromInstance } = getFetchers();
//   const response = await fetchFromInstance(
//     { "~model": accountDesc, "~key": "1" },
//     { fields: ["createdAt"] },
//   );
//   await expect(response).toEqual({
//     "~model": "account",
//     "~key": "1",
//     id: 1,
//     createdAt: new Date("2015-01-01T00:00:00.000Z"),
//   });
// });

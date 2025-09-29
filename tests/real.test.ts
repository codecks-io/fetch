import {test, expect} from "vitest";
import {buildFetchers} from "../src";

const getFetchers = () =>
  buildFetchers({
    baseUrl: "https://api.codecks.io/",
    subdomain: "mmensch",
  });

test("real test with public data", async () => {
  const {fetchFromRoot} = getFetchers();
  const response = await fetchFromRoot({
    account: {
      fields: ["subdomain"],
    },
  });
  expect(response).toEqual({
    account: {
      "~model": "account",
      "~key": "14c3021c-95ad-11e9-b939-5368e19a8f5e",
      subdomain: "mmensch",
      id: "14c3021c-95ad-11e9-b939-5368e19a8f5e",
    },
  });
});

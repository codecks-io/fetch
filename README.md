# @codecks/fetch

## Usage

```ts
import {buildFetchers} from "@codecks/fetch";

const {fetchFromRoot, fetchInstance} = buildFetchers({
  baseUrl: "https://api.codecks.io/",
});

const rootResponse = await fetchFromRoot({
  account: {
    fields: ["name"],
  },
});

console.log(rootResponse);
// > {account: {id: 1, name: "myOrg"}}

const card = await fetchInstance("card", 1, {
  fields: ["title"],
});

console.log(card);
// > {cardId: 1, title: "My Title"}
```

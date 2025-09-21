import {makeModel} from "./_desc";
import * as f from "./_fields";

export const cardsStatusHistoryDesc = makeModel({
  name: "cardsStatusHistory",
  fields: {
    status: f.string({}),
    count: f.int({}),
    date: f.day({}),
  },
  relations: {},
  keys: ["date", "status", "count"],
});


import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import { resolvableDesc } from "./Resolvable";
import { userDesc } from "./User";
import { resolvableEntryDesc } from "./ResolvableEntry";


export const resolvableEntryHistoryDesc = makeModel("resolvableEntryHistory")
  .fields({
    content: f.string(),
    lastChangedAt: f.date(),
    version: f.int(),
    resolvableId: belongsTo("resolvable", () => resolvableDesc),
    authorId: belongsTo("author", () => userDesc),
    entryId: belongsTo("entry", () => resolvableEntryDesc),
  })
  .hasMany({
    
  })
  .compoundKey("entryId", "version");


import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import { type SprintConfigId } from "./SprintConfig";


export const sprintConfigProgressDesc = makeModel({
  name: "sprintConfigProgress",
  fields: {
    progress: f.object({}),
    sprintConfigId: f.belongsTo({}).type<SprintConfigId>(),
  },
  relations: {
    sprintConfig: relation("sprintConfig", { type: "belongsTo", fk: "sprintConfigId" }),
  },
  keys: ["sprintConfigId", "date"]
})
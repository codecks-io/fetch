import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import {type SprintId} from "./Sprint";

export const sprintProgressDesc = makeModel({
  name: "sprintProgress",
  fields: {
    progress: f.object({}),
    sprintId: f.belongsTo({}).type<SprintId>(),
  },
  relations: {
    sprint: relation("sprint", {type: "belongsTo", fk: "sprintId"}),
  },
  keys: ["sprintId", "date"],
});

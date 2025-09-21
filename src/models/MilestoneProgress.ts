import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import {type MilestoneId} from "./Milestone";

export const milestoneProgressDesc = makeModel({
  name: "milestoneProgress",
  fields: {
    progress: f.object({}),
    milestoneId: f.belongsTo({}).type<MilestoneId>(),
  },
  relations: {
    milestone: relation("milestone", {type: "belongsTo", fk: "milestoneId"}),
  },
  keys: ["milestoneId", "date"],
});

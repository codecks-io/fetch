
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import { type DiscordGuildId } from "./DiscordGuild";


export const dailyDiscordGuildVoteMembershipDesc = makeModel({
  name: "dailyDiscordGuildVoteMembership",
  fields: {
    t: f.date({}),
    membershipCount: f.int({}),
    discordGuildId: f.belongsTo({}).type<DiscordGuildId>(),
  },
  relations: {
    discordGuild: relation("discordGuild", { type: "belongsTo", fk: "discordGuildId" }),
  },
  keys: ["t", "guildId"]
})
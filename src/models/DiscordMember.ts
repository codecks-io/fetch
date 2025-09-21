import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import type {Nominal} from "./_type-helpers";
import {type DiscordGuildId} from "./DiscordGuild";

export type DiscordMemberId = Nominal<string, "discordMember">;
export const discordMemberDesc = makeModel({
  name: "discordMember",
  fields: {
    id: f.id<DiscordMemberId>(),
    discordUserId: f.string({}),
    name: f.string({}),
    nick: f.string({}),
    avatar: f.string({}),
    discriminator: f.string({}),
    createdAt: f.date({}),
    deckyScore: f.int({}),
    discordGuildId: f.belongsTo({}).type<DiscordGuildId>(),
  },
  relations: {
    discordGuild: relation("discordGuild", {type: "belongsTo", fk: "discordGuildId"}),
  },
  keys: ["id"],
});

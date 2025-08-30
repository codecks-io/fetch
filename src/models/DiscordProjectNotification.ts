
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { type ProjectId } from "./Project";
import { type DiscordGuildId } from "./DiscordGuild";

export type DiscordProjectNotificationId = Nominal<string, "discordProjectNotification">;
export const discordProjectNotificationDesc = makeModel({
  name: "discordProjectNotification",
  fields: {
    id: f.id<DiscordProjectNotificationId>(),
    discordChannelId: f.string({}),
    disabledTypes: f.object({}),
    createdAt: f.date({}),
    projectId: f.belongsTo({}).type<ProjectId>(),
    discordGuildId: f.belongsTo({}).type<DiscordGuildId>(),
  },
  relations: {
    project: relation("project", { type: "belongsTo", fk: "projectId" }),
    discordGuild: relation("discordGuild", { type: "belongsTo", fk: "discordGuildId" }),
  },
  keys: ["id"]
})
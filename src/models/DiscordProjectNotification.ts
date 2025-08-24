
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { projectDesc } from "./Project";
import { discordGuildDesc } from "./DiscordGuild";

export type DiscordProjectNotificationId = Nominal<string, "discordProjectNotification">;
export const discordProjectNotificationDesc = makeModel("discordProjectNotification")
  .fields({
    id: f.id<DiscordProjectNotificationId>(),
    discordChannelId: f.string(),
    disabledTypes: f.object<any>(),
    createdAt: f.date(),
    projectId: belongsTo("project", () => projectDesc),
    discordGuildId: belongsTo("discordGuild", () => discordGuildDesc),
  })
  .hasMany({
    
  })
  .key("id");

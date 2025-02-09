/*
 * Rivercord, a modification for Discord's desktop app
 * Copyright (c) 2023 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { addAccessory } from "@api/MessageAccessories";
import { getUserSettingLazy } from "@api/UserSettings";
import ErrorBoundary from "@components/ErrorBoundary";
import { Flex } from "@components/Flex";
import { Link } from "@components/Link";
import { openUpdaterModal } from "@components/RivercordSettings/UpdaterTab";
import { Devs, SUPPORT_CHANNEL_ID } from "@utils/constants";
import { sendMessage } from "@utils/discord";
import { Logger } from "@utils/Logger";
import { Margins } from "@utils/margins";
import { isPluginDev, tryOrElse } from "@utils/misc";
import { relaunch } from "@utils/native";
import { onlyOnce } from "@utils/onlyOnce";
import { makeCodeblock } from "@utils/text";
import definePlugin from "@utils/types";
import { checkForUpdates, isOutdated, update } from "@utils/updater";
import { Alerts, Button, Card, ChannelStore, Forms, GuildMemberStore, Parser, RelationshipStore, showToast, Toasts, UserStore } from "@webpack/common";

import gitHash from "~git-hash";
import plugins, { PluginMeta } from "~plugins";

import settings from "./settings";

const RIVERCORD_GUILD_ID = "1015060230222131221";
const VENBOT_USER_ID = "1017176847865352332";
const KNOWN_ISSUES_CHANNEL_ID = "1222936386626129920";
const CodeBlockRe = /```js\n(.+?)```/s;

const AllowedChannelIds = [
    SUPPORT_CHANNEL_ID,
    "1024286218801926184", // Rivercord > #bot-spam
    "1033680203433660458", // Rivercord > #v
];

const TrustedRolesIds = [
    "1026534353167208489", // contributor
    "1026504932959977532", // regular
    "1042507929485586532", // donor
];

const AsyncFunction = async function () { }.constructor;

const ShowCurrentGame = getUserSettingLazy<boolean>("status", "showCurrentGame")!;

async function forceUpdate() {
    const outdated = await checkForUpdates();
    if (outdated) {
        await update();
        relaunch();
    }

    return outdated;
}

async function generateDebugInfoMessage() {
    const { RELEASE_CHANNEL } = window.GLOBAL_ENV;

    const client = (() => {
        if (IS_DISCORD_DESKTOP) return `Discord Desktop v${DiscordNative.app.getVersion()}`;
        if (IS_VESKTOP) return `Resktop v${ResktopNative.app.getVersion()}`;
        if ("armcord" in window) return `ArmCord v${window.armcord.version}`;

        // @ts-expect-error
        const name = typeof unsafeWindow !== "undefined" ? "UserScript" : "Web";
        return `${name} (${navigator.userAgent})`;
    })();

    const info = {
        Rivercord:
            `v${VERSION} • [${gitHash}](<https://github.com/Rivercord/Rivercord/commit/${gitHash}>)` +
            `${settings.additionalInfo} - ${Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(BUILD_TIMESTAMP)}`,
        Client: `${RELEASE_CHANNEL} ~ ${client}`,
        Platform: window.navigator.platform
    };

    if (IS_DISCORD_DESKTOP) {
        info["Last Crash Reason"] = (await tryOrElse(() => DiscordNative.processUtils.getLastCrash(), undefined))?.rendererCrashReason ?? "N/A";
    }

    const commonIssues = {
        "NoRPC enabled": Rivercord.Plugins.isPluginEnabled("NoRPC"),
        "Activity Sharing disabled": tryOrElse(() => !ShowCurrentGame.getSetting(), false),
        "Rivercord DevBuild": !IS_STANDALONE,
        "Has UserPlugins": Object.values(PluginMeta).some(m => m.userPlugin),
        "More than two weeks out of date": BUILD_TIMESTAMP < Date.now() - 12096e5,
    };

    let content = `>>> ${Object.entries(info).map(([k, v]) => `**${k}**: ${v}`).join("\n")}`;
    content += "\n" + Object.entries(commonIssues)
        .filter(([, v]) => v).map(([k]) => `⚠️ ${k}`)
        .join("\n");

    return content.trim();
}

function generatePluginList() {
    const isApiPlugin = (plugin: string) => plugin.endsWith("API") || plugins[plugin].required;

    const enabledPlugins = Object.keys(plugins)
        .filter(p => Rivercord.Plugins.isPluginEnabled(p) && !isApiPlugin(p));

    const enabledStockPlugins = enabledPlugins.filter(p => !PluginMeta[p].userPlugin);
    const enabledUserPlugins = enabledPlugins.filter(p => PluginMeta[p].userPlugin);


    let content = `**Enabled Plugins (${enabledStockPlugins.length}):**\n${makeCodeblock(enabledStockPlugins.join(", "))}`;

    if (enabledUserPlugins.length) {
        content += `**Enabled UserPlugins (${enabledUserPlugins.length}):**\n${makeCodeblock(enabledUserPlugins.join(", "))}`;
    }

    return content;
}

const checkForUpdatesOnce = onlyOnce(checkForUpdates);

export default definePlugin({
    name: "SupportHelper",
    required: true,
    description: "Helps us provide support to you",
    authors: [Devs.Ven],
    dependencies: ["CommandsAPI", "UserSettingsAPI", "MessageAccessoriesAPI"],

    patches: [{
        find: ".BEGINNING_DM.format",
        replacement: {
            match: /BEGINNING_DM\.format\(\{.+?\}\),(?=.{0,100}userId:(\i\.getRecipientId\(\)))/,
            replace: "$& $self.ContributorDmWarningCard({ userId: $1 }),"
        }
    }],

    commands: [
        {
            name: "rivercord-debug",
            description: "Send Rivercord debug info",
            predicate: ctx => isPluginDev(UserStore.getCurrentUser()?.id) || AllowedChannelIds.includes(ctx.channel.id),
            execute: async () => ({ content: await generateDebugInfoMessage() })
        },
        {
            name: "rivercord-plugins",
            description: "Send Rivercord plugin list",
            predicate: ctx => isPluginDev(UserStore.getCurrentUser()?.id) || AllowedChannelIds.includes(ctx.channel.id),
            execute: () => ({ content: generatePluginList() })
        }
    ],

    flux: {
        async CHANNEL_SELECT({ channelId }) {
            if (channelId !== SUPPORT_CHANNEL_ID) return;

            const selfId = UserStore.getCurrentUser()?.id;
            if (!selfId || isPluginDev(selfId)) return;

            if (!IS_UPDATER_DISABLED) {
                await checkForUpdatesOnce().catch(() => { });

                if (isOutdated) {
                    return Alerts.show({
                        title: "Hold on!",
                        body: <div>
                            <Forms.FormText>You are using an outdated version of Rivercord! Chances are, your issue is already fixed.</Forms.FormText>
                            <Forms.FormText className={Margins.top8}>
                                Please first update before asking for support!
                            </Forms.FormText>
                        </div>,
                        onCancel: () => openUpdaterModal!(),
                        cancelText: "View Updates",
                        confirmText: "Update & Restart Now",
                        onConfirm: forceUpdate,
                        secondaryConfirmText: "I know what I'm doing or I can't update"
                    });
                }
            }

            // @ts-ignore outdated type
            const roles = GuildMemberStore.getSelfMember(RIVERCORD_GUILD_ID)?.roles;
            if (!roles || TrustedRolesIds.some(id => roles.includes(id))) return;

            if (!IS_WEB && IS_UPDATER_DISABLED) {
                return Alerts.show({
                    title: "Hold on!",
                    body: <div>
                        <Forms.FormText>You are using an externally updated Rivercord version, which we do not provide support for!</Forms.FormText>
                        <Forms.FormText className={Margins.top8}>
                            Please either switch to an <Link href="https://vencord.dev/download">officially supported version of Rivercord</Link>, or
                            contact your package maintainer for support instead.
                        </Forms.FormText>
                    </div>
                });
            }

            const repo = await RivercordNative.updater.getRepo();
            if (repo.ok && !repo.value.includes("Vendicated/Rivercord")) {
                return Alerts.show({
                    title: "Hold on!",
                    body: <div>
                        <Forms.FormText>You are using a fork of Rivercord, which we do not provide support for!</Forms.FormText>
                        <Forms.FormText className={Margins.top8}>
                            Please either switch to an <Link href="https://vencord.dev/download">officially supported version of Rivercord</Link>, or
                            contact your package maintainer for support instead.
                        </Forms.FormText>
                    </div>
                });
            }
        }
    },

    ContributorDmWarningCard: ErrorBoundary.wrap(({ userId }) => {
        if (!isPluginDev(userId)) return null;
        if (RelationshipStore.isFriend(userId) || isPluginDev(UserStore.getCurrentUser()?.id)) return null;

        return (
            <Card className={`rc-plugins-restart-card ${Margins.top8}`}>
                Please do not private message Rivercord plugin developers for support!
                <br />
                Instead, use the Rivercord support channel: {Parser.parse("https://discord.com/channels/1015060230222131221/1026515880080842772")}
                {!ChannelStore.getChannel(SUPPORT_CHANNEL_ID) && " (Click the link to join)"}
            </Card>
        );
    }, { noop: true }),

    start() {
        addAccessory("rivercord-debug", props => {
            const buttons = [] as JSX.Element[];

            const shouldAddUpdateButton =
                !IS_UPDATER_DISABLED
                && (
                    (props.channel.id === KNOWN_ISSUES_CHANNEL_ID) ||
                    (props.channel.id === SUPPORT_CHANNEL_ID && props.message.author.id === VENBOT_USER_ID)
                )
                && props.message.content?.includes("update");

            if (shouldAddUpdateButton) {
                buttons.push(
                    <Button
                        key="rc-update"
                        color={Button.Colors.GREEN}
                        onClick={async () => {
                            try {
                                if (await forceUpdate())
                                    showToast("Success! Restarting...", Toasts.Type.SUCCESS);
                                else
                                    showToast("Already up to date!", Toasts.Type.MESSAGE);
                            } catch (e) {
                                new Logger(this.name).error("Error while updating:", e);
                                showToast("Failed to update :(", Toasts.Type.FAILURE);
                            }
                        }}
                    >
                        Update Now
                    </Button>
                );
            }

            if (props.channel.id === SUPPORT_CHANNEL_ID) {
                if (props.message.content.includes("/rivercord-debug") || props.message.content.includes("/rivercord-plugins")) {
                    buttons.push(
                        <Button
                            key="rc-dbg"
                            onClick={async () => sendMessage(props.channel.id, { content: await generateDebugInfoMessage() })}
                        >
                            Run /rivercord-debug
                        </Button>,
                        <Button
                            key="rc-plg-list"
                            onClick={async () => sendMessage(props.channel.id, { content: generatePluginList() })}
                        >
                            Run /rivercord-plugins
                        </Button>
                    );
                }

                if (props.message.author.id === VENBOT_USER_ID) {
                    const match = CodeBlockRe.exec(props.message.content || props.message.embeds[0]?.rawDescription || "");
                    if (match) {
                        buttons.push(
                            <Button
                                key="rc-run-snippet"
                                onClick={async () => {
                                    try {
                                        await AsyncFunction(match[1])();
                                        showToast("Success!", Toasts.Type.SUCCESS);
                                    } catch (e) {
                                        new Logger(this.name).error("Error while running snippet:", e);
                                        showToast("Failed to run snippet :(", Toasts.Type.FAILURE);
                                    }
                                }}
                            >
                                Run Snippet
                            </Button>
                        );
                    }
                }
            }

            return buttons.length
                ? <Flex>{buttons}</Flex>
                : null;
        });
    },
});

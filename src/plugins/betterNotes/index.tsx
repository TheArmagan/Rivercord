/*
 * Rivercord, a modification for Discord's desktop app
 * Copyright (c) 2022 Vendicated and contributors
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

import { definePluginSettings, Settings } from "@api/Settings";
import ErrorBoundary from "@components/ErrorBoundary";
import { Devs } from "@utils/constants";
import { canonicalizeMatch } from "@utils/patches";
import definePlugin, { OptionType } from "@utils/types";
import { findByPropsLazy } from "@webpack";

const UserPopoutSectionCssClasses = findByPropsLazy("section", "lastSection");

const settings = definePluginSettings({
    hide: {
        type: OptionType.BOOLEAN,
        description: "Notları gizle.",
        default: false,
        restartNeeded: true
    },
    noSpellCheck: {
        type: OptionType.BOOLEAN,
        description: "Notları otomatik düzeltmeyi kapat.",
        disabled: () => Settings.plugins.BetterNotesBox.hide,
        default: false
    }
});

export default definePlugin({
    name: "BetterNotesBox",
    description: "Notları gizle veya otomatik düzenlemeyi devre dışı bırak. ",
    authors: [Devs.Ven],

    patches: [
        {
            find: "hideNote:",
            all: true,
            // Some modules match the find but the replacement is returned untouched
            noWarn: true,
            predicate: () => Rivercord.Settings.plugins.BetterNotesBox.hide,
            replacement: {
                match: /hideNote:.+?(?=([,}].*?\)))/g,
                replace: (m, rest) => {
                    const destructuringMatch = rest.match(/}=.+/);
                    if (destructuringMatch) {
                        const defaultValueMatch = m.match(canonicalizeMatch(/hideNote:(\i)=!?\d/));
                        return defaultValueMatch ? `hideNote:${defaultValueMatch[1]}=!0` : m;
                    }

                    return "hideNote:!0";
                }
            }
        },
        {
            find: "Messages.NOTE_PLACEHOLDER",
            replacement: {
                match: /\.NOTE_PLACEHOLDER,/,
                replace: "$&spellCheck:!$self.noSpellCheck,"
            }
        },
        {
            find: ".popularApplicationCommandIds,",
            replacement: {
                match: /lastSection:(!?\i)}\),/,
                replace: "$&$self.patchPadding({lastSection:$1}),"
            }
        }
    ],

    get noSpellCheck() {
        return settings.store.noSpellCheck;
    },

    settings,

    patchPadding: ErrorBoundary.wrap(({ lastSection }) => {
        if (!lastSection) return null;
        return (
            <div className={UserPopoutSectionCssClasses.lastSection} ></div>
        );
    })
});

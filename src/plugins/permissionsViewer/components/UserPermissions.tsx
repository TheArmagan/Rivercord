import ErrorBoundary from "@components/ErrorBoundary";
import { ExpandableHeader } from "@components/ExpandableHeader";
import { classes } from "@utils/misc";
import { filters, findBulk, proxyLazyWebpack } from "@webpack";
import { i18n, PermissionsBits, Text, Tooltip, useMemo, UserStore } from "@webpack/common";
import type { Guild, GuildMember } from "discord-types/general";

import { PermissionsSortOrder, settings } from "..";
import { cl, getPermissionString, getSortedRoles, sortUserRoles } from "../utils";
import openRolesAndUsersPermissionsModal, { PermissionType, type RoleOrUserPermission } from "./RolesAndUsersPermissions";

interface UserPermission {
    permission: string;
    roleColor: string;
    rolePosition: number;
}

type UserPermissions = Array<UserPermission>;

const Classes = proxyLazyWebpack(() =>
    Object.assign({}, ...findBulk(
        filters.byProps("roles", "rolePill", "rolePillBorder"),
        filters.byProps("roleCircle", "dotBorderBase", "dotBorderColor"),
        filters.byProps("roleNameOverflow", "root", "roleName", "roleRemoveButton")
    ))
) as Record<"roles" | "rolePill" | "rolePillBorder" | "desaturateUserColors" | "flex" | "alignCenter" | "justifyCenter" | "svg" | "background" | "dot" | "dotBorderColor" | "roleCircle" | "dotBorderBase" | "flex" | "alignCenter" | "justifyCenter" | "wrap" | "root" | "role" | "roleRemoveButton" | "roleDot" | "roleFlowerStar" | "roleRemoveIcon" | "roleRemoveIconFocused" | "roleVerifiedIcon" | "roleName" | "roleNameOverflow" | "actionButton" | "overflowButton" | "addButton" | "addButtonIcon" | "overflowRolesPopout" | "overflowRolesPopoutArrowWrapper" | "overflowRolesPopoutArrow" | "popoutBottom" | "popoutTop" | "overflowRolesPopoutHeader" | "overflowRolesPopoutHeaderIcon" | "overflowRolesPopoutHeaderText" | "roleIcon", string>;

function UserPermissionsComponent({ guild, guildMember, showBorder, forceOpen = false }: { guild: Guild; guildMember: GuildMember; showBorder: boolean; forceOpen?: boolean; }) {
    const stns = settings.use(["permissionsSortOrder"]);

    const [rolePermissions, userPermissions] = useMemo(() => {
        const userPermissions: UserPermissions = [];

        const userRoles = getSortedRoles(guild, guildMember);

        const rolePermissions: Array<RoleOrUserPermission> = userRoles.map(role => ({
            type: PermissionType.Role,
            ...role
        }));

        if (guild.ownerId === guildMember.userId) {
            rolePermissions.push({
                type: PermissionType.Owner,
                permissions: Object.values(PermissionsBits).reduce((prev, curr) => prev | curr, 0n)
            });

            const OWNER = i18n.Messages.GUILD_OWNER || "Server Owner";
            userPermissions.push({
                permission: OWNER,
                roleColor: "var(--primary-300)",
                rolePosition: Infinity
            });
        }

        sortUserRoles(userRoles);

        for (const [permission, bit] of Object.entries(PermissionsBits)) {
            for (const { permissions, colorString, position } of userRoles) {
                if ((permissions & bit) === bit) {
                    userPermissions.push({
                        permission: getPermissionString(permission),
                        roleColor: colorString || "var(--primary-300)",
                        rolePosition: position
                    });

                    break;
                }
            }
        }

        userPermissions.sort((a, b) => b.rolePosition - a.rolePosition);

        return [rolePermissions, userPermissions];
    }, [stns.permissionsSortOrder]);

    const { root, role, roleRemoveButton, roleNameOverflow, roles, rolePill, rolePillBorder, roleCircle, roleName } = Classes;

    return (
        <ExpandableHeader
            forceOpen={forceOpen}
            headerText="Permissions"
            moreTooltipText="Role Details"
            onMoreClick={() =>
                openRolesAndUsersPermissionsModal(
                    rolePermissions,
                    guild,
                    guildMember.nick || UserStore.getUser(guildMember.userId).username
                )
            }
            onDropDownClick={state => settings.store.defaultPermissionsDropdownState = !state}
            defaultState={settings.store.defaultPermissionsDropdownState}
            buttons={[
                (<Tooltip text={`Sorting by ${stns.permissionsSortOrder === PermissionsSortOrder.HighestRole ? "Highest Role" : "Lowest Role"}`}>
                    {tooltipProps => (
                        <button
                            {...tooltipProps}
                            className={cl("userperms-sortorder-btn")}
                            onClick={() => {
                                stns.permissionsSortOrder = stns.permissionsSortOrder === PermissionsSortOrder.HighestRole ? PermissionsSortOrder.LowestRole : PermissionsSortOrder.HighestRole;
                            }}
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 96 960 960"
                                transform={stns.permissionsSortOrder === PermissionsSortOrder.HighestRole ? "scale(1 1)" : "scale(1 -1)"}
                            >
                                <path fill="var(--text-normal)" d="M440 896V409L216 633l-56-57 320-320 320 320-56 57-224-224v487h-80Z" />
                            </svg>
                        </button>
                    )}
                </Tooltip>)
            ]}>
            {userPermissions.length > 0 && (
                <div className={classes(root, roles)}>
                    {userPermissions.map(({ permission, roleColor }) => (
                        <div className={classes(role, rolePill, showBorder ? rolePillBorder : null)}>
                            <div className={roleRemoveButton}>
                                <span
                                    className={roleCircle}
                                    style={{ backgroundColor: roleColor }}
                                />
                            </div>
                            <div className={roleName}>
                                <Text
                                    className={roleNameOverflow}
                                    variant="text-xs/medium"
                                >
                                    {permission}
                                </Text>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </ExpandableHeader>
    );
}

export default ErrorBoundary.wrap(UserPermissionsComponent, { noop: true });

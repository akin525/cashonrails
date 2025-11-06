// utils/permissions.ts
export const hasRole = (userRoles: string[], requiredRoles?: string[]): boolean => {
    if (!requiredRoles || requiredRoles.length === 0) return true;
    return requiredRoles.some(role => userRoles.includes(role));
};

export const hasPermission = (
    userPermissions: string[],
    requiredPermissions?: string[],
    requireAll: boolean = false
): boolean => {
    if (!requiredPermissions || requiredPermissions.length === 0) return true;

    if (requireAll) {
        return requiredPermissions.every(permission => userPermissions.includes(permission));
    }

    return requiredPermissions.some(permission => userPermissions.includes(permission));
};

export const canAccessNavItem = (
    item: any, // Using any to be flexible with your existing structure
    userRoles: string[],
    userPermissions: string[]
): boolean => {
    // Check roles
    if (!hasRole(userRoles, item.roles)) {
        return false;
    }

    // Check permissions (if they exist)
    if (item.permissions && !hasPermission(userPermissions, item.permissions, item.requireAll)) {
        return false;
    }

    return true;
};

export const canAccessNavGroup = (
    group: any,
    userRoles: string[],
    userPermissions: string[]
): boolean => {
    // Check group-level access
    if (group.roles && !hasRole(userRoles, group.roles)) {
        return false;
    }

    if (group.permissions && !hasPermission(userPermissions, group.permissions)) {
        return false;
    }

    // Check if user has access to at least one item in the group
    return group.items.some((item: any) => canAccessNavItem(item, userRoles, userPermissions));
};

export const filterNavItems = (
    items: any[],
    userRoles: string[],
    userPermissions: string[]
): any[] => {
    return items
        .filter(item => canAccessNavItem(item, userRoles, userPermissions))
        .map(item => ({
            ...item,
            subItems: item.subItems?.filter((subItem: any) =>
                canAccessNavItem(subItem, userRoles, userPermissions)
            )
        }))
        .filter(item => !item.expandable || !item.subItems || item.subItems.length > 0);
};

export const filterNavGroups = (
    groups: any[],
    userRoles: string[],
    userPermissions: string[]
): any[] => {
    return groups
        .filter(group => canAccessNavGroup(group, userRoles, userPermissions))
        .map(group => ({
            ...group,
            items: filterNavItems(group.items, userRoles, userPermissions)
        }))
        .filter(group => group.items.length > 0)
        .sort((a, b) => a.order - b.order);
};

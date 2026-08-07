/**
 * Curated permission catalog for the roles matrix. Tokens mirror the examples in
 * the Asset Flex Swagger (e.g. `vendors.approve`, `settlements.trigger`). The API
 * accepts free-form tokens, so editing preserves any permission not listed here.
 */
export interface PermissionItem {
  token: string;
  label: string;
}

export interface PermissionGroup {
  resource: string;
  items: PermissionItem[];
}

export const PERMISSION_CATALOG: PermissionGroup[] = [
  {
    resource: 'Vendors',
    items: [
      { token: 'vendors.view', label: 'View vendors' },
      { token: 'vendors.approve', label: 'Approve / reject KYB' },
      { token: 'vendors.manage', label: 'Manage vendors (blacklist, status)' },
    ],
  },
  {
    resource: 'Products',
    items: [
      { token: 'products.view', label: 'View products' },
      { token: 'products.manage', label: 'Manage products' },
    ],
  },
  {
    resource: 'Settlements',
    items: [
      { token: 'settlements.view', label: 'View settlements' },
      { token: 'settlements.trigger', label: 'Trigger settlements' },
      { token: 'settlements.manage', label: 'Manage settlements' },
    ],
  },
  {
    resource: 'Admin users',
    items: [
      { token: 'users.view', label: 'View admin users' },
      { token: 'users.manage', label: 'Create / edit admin users & roles' },
    ],
  },
];

/** Flat set of every catalog token, for detecting non-catalog ("custom") tokens. */
export const KNOWN_PERMISSIONS = new Set(
  PERMISSION_CATALOG.flatMap((g) => g.items.map((i) => i.token)),
);

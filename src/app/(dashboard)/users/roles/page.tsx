"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkSquare01Icon,
  SquareIcon,
} from "@hugeicons-pro/core-stroke-rounded";
import PageShell from "@/components/layout/PageShell";
import { CoreButton } from "@/components/ui/CoreButton";
import CoreBadge from "@/components/ui/CoreBadge";

const roles = [
  {
    name: "Super Admin",
    users: 2,
    description: "Full system access. Can manage all resources and settings.",
  },
  {
    name: "Admin",
    users: 8,
    description: "Manage users, customers, and most operations.",
  },
  {
    name: "Finance",
    users: 5,
    description: "Access to loans, wallet, and financial reports.",
  },
  {
    name: "Compliance",
    users: 3,
    description: "KYC/AML review, audit logs, and compliance reports.",
  },
  {
    name: "Support",
    users: 12,
    description: "Customer support, view-only access to customer records.",
  },
  {
    name: "Viewer",
    users: 4,
    description: "Read-only access to dashboards and reports.",
  },
];

const permissionGroups: { group: string; permissions: { name: string; enabled: boolean }[] }[] = [
  {
    group: "User Management",
    permissions: [
      { name: "View admin users", enabled: true },
      { name: "Invite users", enabled: true },
      { name: "Edit roles", enabled: true },
      { name: "Suspend users", enabled: true },
    ],
  },
  {
    group: "Loan Management",
    permissions: [
      { name: "View loans", enabled: true },
      { name: "Approve / reject loans", enabled: true },
      { name: "Disburse funds", enabled: true },
      { name: "Write off loans", enabled: true },
    ],
  },
  {
    group: "Wallet",
    permissions: [
      { name: "View wallets", enabled: true },
      { name: "Freeze / unfreeze wallet", enabled: true },
      { name: "Manual adjustments", enabled: false },
      { name: "Export transactions", enabled: true },
    ],
  },
  {
    group: "VAS / Bill Payments",
    permissions: [
      { name: "View transactions", enabled: true },
      { name: "Initiate refunds", enabled: true },
      { name: "Manage providers", enabled: false },
      { name: "Export data", enabled: true },
    ],
  },
  {
    group: "Notifications",
    permissions: [
      { name: "View notifications", enabled: true },
      { name: "Send bulk notifications", enabled: true },
      { name: "Manage templates", enabled: false },
      { name: "Schedule campaigns", enabled: false },
    ],
  },
  {
    group: "Reports",
    permissions: [
      { name: "View reports", enabled: true },
      { name: "Export reports", enabled: true },
      { name: "Schedule reports", enabled: false },
      { name: "Custom reports", enabled: false },
    ],
  },
  {
    group: "Settings",
    permissions: [
      { name: "View settings", enabled: true },
      { name: "Edit system settings", enabled: true },
      { name: "Manage integrations", enabled: false },
      { name: "API keys", enabled: false },
    ],
  },
  {
    group: "Audit Logs",
    permissions: [
      { name: "View audit logs", enabled: true },
      { name: "Export audit logs", enabled: true },
      { name: "Delete logs", enabled: false },
      { name: "Configure retention", enabled: false },
    ],
  },
];

export default function RolesPage() {
  const [selectedRole, setSelectedRole] = useState(roles[0].name);

  return (
    <PageShell title="Roles & Permissions">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div />
        <CoreButton variant="filled" size="sm">Create role</CoreButton>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Roles list */}
        <div className="col-span-1">
          {roles.map((role) => (
            <div
              key={role.name}
              onClick={() => setSelectedRole(role.name)}
              className={[
                "bg-white rounded-2xl border overflow-hidden mb-3 cursor-pointer transition-all duration-150",
                selectedRole === role.name ? "border-[#00B3FF]" : "border-[#E2E8F0] hover:border-[#CBD5E1]",
              ].join(" ")}
            >
              <div className="px-4 py-3 flex justify-between items-center border-b border-[#E2E8F0]">
                <span className="text-[14px] font-semibold text-[#0F172A]">{role.name}</span>
                <div className="flex items-center gap-2">
                  {role.name === "Super Admin" && (
                    <CoreBadge variant="info">Full access</CoreBadge>
                  )}
                  <span className="text-[12px] text-[#94A3B8]">{role.users} users</span>
                </div>
              </div>
              <div className="px-4 py-3">
                <p className="text-[13px] text-[#475569]">{role.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Permissions matrix */}
        <div className="col-span-2 bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden self-start">
          <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <h2 className="font-[SN_Pro] text-[15px] font-semibold text-[#0F172A]">
              {selectedRole} permissions
            </h2>
            <CoreButton variant="outline" size="sm">Edit role</CoreButton>
          </div>

          {permissionGroups.map((group, gi) => (
            <div key={gi} className="px-5 py-4 border-b border-[#E2E8F0] last:border-b-0">
              <p className="text-[13px] font-semibold text-[#0F172A] mb-3">{group.group}</p>
              <div className="grid grid-cols-2 gap-2">
                {group.permissions.map((perm, pi) => (
                  <div key={pi} className="flex items-center gap-2">
                    <HugeiconsIcon
                      icon={perm.enabled ? CheckmarkSquare01Icon : SquareIcon}
                      size={16}
                      color={perm.enabled ? "#22C55E" : "#E2E8F0"}
                      strokeWidth={1.5}
                    />
                    <span className="text-[13px] text-[#475569]">{perm.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

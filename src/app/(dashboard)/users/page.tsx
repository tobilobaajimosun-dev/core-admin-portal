"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserAdd01Icon,
  Search01Icon,
  FilterIcon,
  ArrowDown01Icon,
  Download01Icon,
  MoreVerticalIcon,
} from "@hugeicons-pro/core-stroke-rounded";
import PageShell from "@/components/layout/PageShell";
import { CoreButton } from "@/components/ui/CoreButton";
import CoreBadge from "@/components/ui/CoreBadge";

const adminUsers = [
  { name: "Adebayo Okafor", email: "adebayo@princepsfinance.com", role: "Super Admin", status: "active", lastActive: "Just now" },
  { name: "Chisom Nweke", email: "chisom@princepsfinance.com", role: "Admin", status: "active", lastActive: "2 hrs ago" },
  { name: "Funke Adeyemi", email: "funke@princepsfinance.com", role: "Finance", status: "active", lastActive: "Today, 9:41 AM" },
  { name: "Ibrahim Musa", email: "ibrahim@princepsfinance.com", role: "Compliance", status: "inactive", lastActive: "3 days ago" },
  { name: "Kemi Okonkwo", email: "kemi@princepsfinance.com", role: "Support", status: "active", lastActive: "1 hr ago" },
  { name: "Lanre Balogun", email: "lanre@princepsfinance.com", role: "Viewer", status: "active", lastActive: "Today, 8:15 AM" },
  { name: "Ngozi Eze", email: "ngozi@princepsfinance.com", role: "Finance", status: "suspended", lastActive: "12 days ago" },
  { name: "Rotimi Adeleke", email: "rotimi@princepsfinance.com", role: "Support", status: "active", lastActive: "5 min ago" },
  { name: "Sola Fashola", email: "sola@princepsfinance.com", role: "Compliance", status: "inactive", lastActive: "1 week ago" },
  { name: "Tunde Bakare", email: "tunde@princepsfinance.com", role: "Admin", status: "active", lastActive: "Yesterday" },
];

const roleVariant: Record<string, "info" | "neutral"> = {
  "Super Admin": "info",
  Admin: "info",
  Finance: "neutral",
  Compliance: "neutral",
  Support: "neutral",
  Viewer: "neutral",
};

const statusVariant: Record<string, "success" | "neutral" | "error"> = {
  active: "success",
  inactive: "neutral",
  suspended: "error",
};

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export default function UsersPage() {
  const [search, setSearch] = useState("");

  const filtered = adminUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageShell title="User Management">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div />
        <CoreButton variant="filled" size="sm" iconLeft={UserAdd01Icon}>
          Invite user
        </CoreButton>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
        {/* Toolbar */}
        <div className="px-4 py-3 border-b border-[#E2E8F0] flex items-center gap-3">
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <HugeiconsIcon icon={Search01Icon} size={15} color="#94A3B8" strokeWidth={1.5} />
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="h-9 w-[220px] bg-[#F2F7F9] rounded-lg border-0 outline-none pl-8 pr-3 text-[13px] text-[#0F172A] placeholder:text-[#94A3B8]"
            />
          </div>
          <CoreButton variant="outline" size="sm" iconLeft={FilterIcon}>Filter</CoreButton>
          <CoreButton variant="outline" size="sm" iconRight={ArrowDown01Icon}>All roles</CoreButton>
          <div className="ml-auto">
            <CoreButton variant="ghost" size="sm" iconLeft={Download01Icon} disabled={filtered.length === 0}>
              Export
            </CoreButton>
          </div>
        </div>

        {/* Table */}
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E2E8F0]">
              {["Name", "Email", "Role", "Status", "Last active", "Actions"].map((col) => (
                <th
                  key={col}
                  className="px-5 py-3 text-left text-[11px] font-semibold text-[#94A3B8] uppercase tracking-[0.06em]"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((user, i) => (
              <tr
                key={i}
                className="border-b border-[#E2E8F0] last:border-b-0 hover:bg-[#F8FAFC] cursor-pointer transition-colors"
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#00B3FF] text-white text-[11px] font-semibold flex items-center justify-center flex-shrink-0">
                      {getInitials(user.name)}
                    </div>
                    <span className="text-[13px] font-medium text-[#0F172A]">{user.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-[13px] text-[#475569]">{user.email}</td>
                <td className="px-5 py-3.5">
                  <CoreBadge variant={roleVariant[user.role] ?? "neutral"}>{user.role}</CoreBadge>
                </td>
                <td className="px-5 py-3.5">
                  <CoreBadge variant={statusVariant[user.status]}>
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </CoreBadge>
                </td>
                <td className="px-5 py-3.5 text-[13px] text-[#475569]">{user.lastActive}</td>
                <td className="px-5 py-3.5">
                  <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F2F7F9] transition-colors">
                    <HugeiconsIcon icon={MoreVerticalIcon} size={16} color="#94A3B8" strokeWidth={1.5} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-5 py-3.5 border-t border-[#E2E8F0] flex items-center justify-between">
          <p className="text-[13px] text-[#475569]">Showing 1–10 of 47 results</p>
          <div className="flex items-center gap-2">
            <CoreButton variant="outline" size="sm" disabled>Previous</CoreButton>
            <CoreButton variant="outline" size="sm">Next</CoreButton>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

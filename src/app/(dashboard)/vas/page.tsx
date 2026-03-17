"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ReceiptTextIcon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  BankIcon,
  Search01Icon,
  FilterIcon,
  ArrowDown01Icon,
  Download01Icon,
  MoreVerticalIcon,
  Copy01Icon,
} from "@hugeicons-pro/core-stroke-rounded";
import PageShell from "@/components/layout/PageShell";
import MetricCard from "@/components/ui/MetricCard";
import CoreBadge from "@/components/ui/CoreBadge";
import { CoreButton } from "@/components/ui/CoreButton";

const tabs = ["All", "Airtime", "Data", "Electricity", "Cable TV"] as const;
type Tab = (typeof tabs)[number];

const transactions = [
  { id: "VAS-8821", customer: "Amaka Obi", type: "Airtime", provider: "MTN", amount: "₦2,000.00", token: "N/A", date: "May 8, 2024", status: "success" },
  { id: "VAS-8820", customer: "Biodun Adeyemi", type: "Data", provider: "Airtel", amount: "₦3,500.00", token: "N/A", date: "May 8, 2024", status: "failed" },
  { id: "VAS-8819", customer: "Chidi Nwosu", type: "Electricity", provider: "EKEDC", amount: "₦10,000.00", token: "4821-9034-2817-5623", date: "May 7, 2024", status: "success" },
  { id: "VAS-8818", customer: "Dupe Afolabi", type: "Cable TV", provider: "DSTV", amount: "₦8,000.00", token: "IUC:4092831749", date: "May 7, 2024", status: "success" },
  { id: "VAS-8817", customer: "Emmanuel Okafor", type: "Airtime", provider: "Glo", amount: "₦1,000.00", token: "N/A", date: "May 7, 2024", status: "success" },
  { id: "VAS-8816", customer: "Fatima Aliyu", type: "Electricity", provider: "PHED", amount: "₦15,000.00", token: "7291-4830-1928-4711", date: "May 6, 2024", status: "success" },
  { id: "VAS-8815", customer: "Grace Eze", type: "Data", provider: "MTN", amount: "₦5,000.00", token: "N/A", date: "May 6, 2024", status: "pending" },
  { id: "VAS-8814", customer: "Henry Babatunde", type: "Cable TV", provider: "GoTV", amount: "₦4,850.00", token: "IUC:7381920485", date: "May 5, 2024", status: "success" },
  { id: "VAS-8813", customer: "Ifunanya Okonkwo", type: "Airtime", provider: "9mobile", amount: "₦500.00", token: "N/A", date: "May 5, 2024", status: "failed" },
  { id: "VAS-8812", customer: "James Lawal", type: "Electricity", provider: "EKEDC", amount: "₦20,000.00", token: "2938-4710-8834-0192", date: "May 5, 2024", status: "success" },
  { id: "VAS-8811", customer: "Kemi Okonkwo", type: "Data", provider: "Airtel", amount: "₦2,500.00", token: "N/A", date: "May 4, 2024", status: "success" },
  { id: "VAS-8810", customer: "Lanre Balogun", type: "Airtime", provider: "MTN", amount: "₦3,000.00", token: "N/A", date: "May 4, 2024", status: "success" },
  { id: "VAS-8809", customer: "Ngozi Eze", type: "Cable TV", provider: "DSTV", amount: "₦21,000.00", token: "IUC:9182034758", date: "May 3, 2024", status: "pending" },
  { id: "VAS-8808", customer: "Rotimi Adeleke", type: "Electricity", provider: "IBEDC", amount: "₦8,000.00", token: "5920-3847-1029-8374", date: "May 3, 2024", status: "success" },
  { id: "VAS-8807", customer: "Sola Fashola", type: "Data", provider: "Glo", amount: "₦1,500.00", token: "N/A", date: "May 2, 2024", status: "failed" },
];

const statusVariant: Record<string, "success" | "error" | "warning"> = {
  success: "success", failed: "error", pending: "warning",
};

export default function VASPage() {
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [search, setSearch] = useState("");

  const filtered = transactions.filter((t) => {
    const matchTab = activeTab === "All" || t.type === activeTab;
    const matchSearch = t.customer.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <PageShell title="VAS / Bill Payments">
      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard label="Total Transactions" value="45,231" icon={ReceiptTextIcon} delta="+22%" deltaLabel="vs last month" deltaType="up" />
        <MetricCard label="Success Rate" value="96.4%" icon={CheckmarkCircle02Icon} delta="+1.2%" deltaLabel="vs last month" deltaType="up" />
        <MetricCard label="Failed Today" value="12" icon={AlertCircleIcon} tag="Needs action" deltaType="down" />
        <MetricCard label="Total Volume" value="₦4.3B" icon={BankIcon} delta="+18%" deltaLabel="vs last month" deltaType="up" />
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#E2E8F0] flex items-center gap-3 flex-wrap">
          <div className="inline-flex bg-[#F8FAFC] rounded-full p-1 gap-1 border border-[#E2E8F0]">
            {tabs.map((t) => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={["px-3 py-1.5 rounded-full text-[12px] font-medium transition-all duration-150",
                  activeTab === t ? "bg-white text-[#0F172A] shadow-sm" : "text-[#475569] hover:text-[#0F172A]"].join(" ")}>
                {t}
              </button>
            ))}
          </div>
          <div className="relative ml-2">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <HugeiconsIcon icon={Search01Icon} size={15} color="#94A3B8" strokeWidth={1.5} />
            </span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search transactions..."
              className="h-9 w-[200px] bg-[#F2F7F9] rounded-lg border-0 outline-none pl-8 pr-3 text-[13px] placeholder:text-[#94A3B8]" />
          </div>
          <CoreButton variant="outline" size="sm" iconLeft={FilterIcon}>Filter</CoreButton>
          <CoreButton variant="outline" size="sm" iconRight={ArrowDown01Icon}>Sort</CoreButton>
          <div className="ml-auto">
            <CoreButton variant="ghost" size="sm" iconLeft={Download01Icon} disabled={filtered.length === 0}>Export</CoreButton>
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E2E8F0]">
              {["Tx ID", "Customer", "Type", "Provider", "Amount", "Token/Ref", "Date", "Status", "Actions"].map((col) => (
                <th key={col} className="px-4 py-3 text-left text-[11px] font-semibold text-[#94A3B8] uppercase tracking-[0.06em]">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((tx) => (
              <tr key={tx.id} className="border-b border-[#E2E8F0] last:border-b-0 hover:bg-[#F8FAFC] cursor-pointer transition-colors">
                <td className="px-4 py-3.5 text-[13px] font-medium text-[#00B3FF]">{tx.id}</td>
                <td className="px-4 py-3.5 text-[13px] text-[#0F172A] font-medium">{tx.customer}</td>
                <td className="px-4 py-3.5 text-[13px] text-[#475569]">{tx.type}</td>
                <td className="px-4 py-3.5 text-[13px] text-[#475569]">{tx.provider}</td>
                <td className="px-4 py-3.5 text-[13px] font-semibold text-[#0F172A]">{tx.amount}</td>
                <td className="px-4 py-3.5">
                  {tx.token !== "N/A" ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[12px] text-[#475569] font-mono truncate max-w-[120px]">{tx.token}</span>
                      <button className="hover:opacity-70 transition-opacity">
                        <HugeiconsIcon icon={Copy01Icon} size={13} color="#94A3B8" strokeWidth={1.5} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-[12px] text-[#94A3B8]">—</span>
                  )}
                </td>
                <td className="px-4 py-3.5 text-[13px] text-[#475569]">{tx.date}</td>
                <td className="px-4 py-3.5"><CoreBadge variant={statusVariant[tx.status]}>{tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}</CoreBadge></td>
                <td className="px-4 py-3.5">
                  <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F2F7F9] transition-colors">
                    <HugeiconsIcon icon={MoreVerticalIcon} size={16} color="#94A3B8" strokeWidth={1.5} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="px-5 py-3.5 border-t border-[#E2E8F0] flex items-center justify-between">
          <p className="text-[13px] text-[#475569]">Showing 1–{filtered.length} of 45,231 results</p>
          <div className="flex items-center gap-2">
            <CoreButton variant="outline" size="sm" disabled>Previous</CoreButton>
            <CoreButton variant="outline" size="sm">Next</CoreButton>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

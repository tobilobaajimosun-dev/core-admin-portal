"use client";

import { useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DocumentValidationIcon,
  Money02Icon,
  AlertCircleIcon,
  Clock01Icon,
  Search01Icon,
  FilterIcon,
  ArrowDown01Icon,
  Download01Icon,
  MoreVerticalIcon,
} from "@hugeicons-pro/core-stroke-rounded";
import PageShell from "@/components/layout/PageShell";
import MetricCard from "@/components/ui/MetricCard";
import CoreBadge from "@/components/ui/CoreBadge";
import { CoreButton } from "@/components/ui/CoreButton";

const tabs = ["All", "Pending", "Active", "Completed", "Defaulted"] as const;
type Tab = (typeof tabs)[number];

const loans = [
  { id: "LN-2024-0042", customer: "Amaka Obi", amount: "₦150,000.00", duration: "6 months", disbursed: "Mar 1, 2024", status: "active", repayment: "₦42,500.00" },
  { id: "LN-2024-0091", customer: "Biodun Adeyemi", amount: "₦80,000.00", duration: "3 months", disbursed: "Apr 5, 2024", status: "active", repayment: "₦16,000.00" },
  { id: "LN-2024-0115", customer: "Chidi Nwosu", amount: "₦250,000.00", duration: "12 months", disbursed: "Jan 10, 2024", status: "active", repayment: "₦87,500.00" },
  { id: "LN-2024-0023", customer: "Dupe Afolabi", amount: "₦50,000.00", duration: "3 months", disbursed: "Feb 14, 2024", status: "completed", repayment: "₦50,000.00" },
  { id: "LN-2024-0058", customer: "Emmanuel Okafor", amount: "₦100,000.00", duration: "6 months", disbursed: "Mar 20, 2024", status: "pending", repayment: "₦0.00" },
  { id: "LN-2024-0067", customer: "Fatima Aliyu", amount: "₦200,000.00", duration: "9 months", disbursed: "Mar 28, 2024", status: "active", repayment: "₦44,444.00" },
  { id: "LN-2024-0012", customer: "Grace Eze", amount: "₦75,000.00", duration: "6 months", disbursed: "Jan 5, 2024", status: "defaulted", repayment: "₦12,500.00" },
  { id: "LN-2024-0088", customer: "Henry Babatunde", amount: "₦500,000.00", duration: "12 months", disbursed: "Apr 12, 2024", status: "pending", repayment: "₦0.00" },
  { id: "LN-2024-0034", customer: "Ifunanya Okonkwo", amount: "₦60,000.00", duration: "3 months", disbursed: "Feb 28, 2024", status: "completed", repayment: "₦60,000.00" },
  { id: "LN-2024-0099", customer: "James Lawal", amount: "₦120,000.00", duration: "6 months", disbursed: "Apr 18, 2024", status: "active", repayment: "₦20,000.00" },
  { id: "LN-2024-0045", customer: "Kemi Okonkwo", amount: "₦90,000.00", duration: "6 months", disbursed: "Mar 8, 2024", status: "active", repayment: "₦30,000.00" },
  { id: "LN-2024-0071", customer: "Lanre Balogun", amount: "₦180,000.00", duration: "9 months", disbursed: "Apr 2, 2024", status: "pending", repayment: "₦0.00" },
  { id: "LN-2024-0016", customer: "Ngozi Eze", amount: "₦45,000.00", duration: "3 months", disbursed: "Jan 20, 2024", status: "defaulted", repayment: "₦15,000.00" },
  { id: "LN-2024-0052", customer: "Rotimi Adeleke", amount: "₦300,000.00", duration: "12 months", disbursed: "Mar 15, 2024", status: "active", repayment: "₦75,000.00" },
  { id: "LN-2024-0029", customer: "Sola Fashola", amount: "₦65,000.00", duration: "3 months", disbursed: "Feb 20, 2024", status: "completed", repayment: "₦65,000.00" },
];

const statusVariant: Record<string, "warning" | "info" | "success" | "error"> = {
  pending: "warning", active: "info", completed: "success", defaulted: "error",
};

export default function LoansPage() {
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [search, setSearch] = useState("");

  const filtered = loans.filter((l) => {
    const matchTab = activeTab === "All" || l.status === activeTab.toLowerCase();
    const matchSearch = l.customer.toLowerCase().includes(search.toLowerCase()) || l.id.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <PageShell>
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-[#0F172A] font-[SN_Pro] tracking-[-0.3px]">
          Loans
        </h1>
      </div>
      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard label="Total Applications" value="8,921" icon={DocumentValidationIcon} delta="+18%" deltaLabel="vs last month" deltaType="up" />
        <MetricCard label="Amount Disbursed" value="₦7.3B" icon={Money02Icon} delta="+31%" deltaLabel="vs last month" deltaType="up" />
        <MetricCard label="Default Rate" value="4.2%" icon={AlertCircleIcon} delta="-0.8%" deltaLabel="improving" deltaType="up" />
        <MetricCard label="Pending Review" value="47" icon={Clock01Icon} tag="Action required" />
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
        {/* Tabs + toolbar */}
        <div className="px-4 py-3 border-b border-[#E2E8F0] flex items-center gap-3 flex-wrap">
          <div className="inline-flex bg-[#F8FAFC] rounded-full p-1 gap-1 border border-[#E2E8F0]">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={["px-3 py-1.5 rounded-full text-[12px] font-medium transition-all duration-150",
                  activeTab === t ? "bg-white text-[#0F172A] shadow-sm" : "text-[#475569] hover:text-[#0F172A]"].join(" ")}
              >{t}</button>
            ))}
          </div>
          <div className="relative ml-2">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <HugeiconsIcon icon={Search01Icon} size={15} color="#94A3B8" strokeWidth={1.5} />
            </span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search loans..."
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
              {["Loan ID", "Customer", "Amount", "Duration", "Disbursed", "Status", "Repaid", "Actions"].map((col) => (
                <th key={col} className="px-5 py-3 text-left text-[11px] font-semibold text-[#94A3B8] uppercase tracking-[0.06em]">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((loan) => (
              <tr key={loan.id} className="border-b border-[#E2E8F0] last:border-b-0 hover:bg-[#F8FAFC] cursor-pointer transition-colors">
                <td className="px-5 py-3.5">
                  <Link href={`/loans/${loan.id}`} className="text-[13px] font-medium text-[#00B3FF] hover:underline">{loan.id}</Link>
                </td>
                <td className="px-5 py-3.5 text-[13px] text-[#0F172A] font-medium">{loan.customer}</td>
                <td className="px-5 py-3.5 text-[13px] font-semibold text-[#0F172A]">{loan.amount}</td>
                <td className="px-5 py-3.5 text-[13px] text-[#475569]">{loan.duration}</td>
                <td className="px-5 py-3.5 text-[13px] text-[#475569]">{loan.disbursed}</td>
                <td className="px-5 py-3.5"><CoreBadge variant={statusVariant[loan.status]}>{loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}</CoreBadge></td>
                <td className="px-5 py-3.5 text-[13px] text-[#475569]">{loan.repayment}</td>
                <td className="px-5 py-3.5">
                  <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F2F7F9] transition-colors">
                    <HugeiconsIcon icon={MoreVerticalIcon} size={16} color="#94A3B8" strokeWidth={1.5} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="px-5 py-3.5 border-t border-[#E2E8F0] flex items-center justify-between">
          <p className="text-[13px] text-[#475569]">Showing 1–{filtered.length} of 8,921 results</p>
          <div className="flex items-center gap-2">
            <CoreButton variant="outline" size="sm" disabled>Previous</CoreButton>
            <CoreButton variant="outline" size="sm">Next</CoreButton>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

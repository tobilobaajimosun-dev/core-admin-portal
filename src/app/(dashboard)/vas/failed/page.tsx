"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { AlertCircleIcon, MoreVerticalIcon, ReloadIcon } from "@hugeicons-pro/core-stroke-rounded";
import PageShell from "@/components/layout/PageShell";
import CoreBadge from "@/components/ui/CoreBadge";
import { CoreButton } from "@/components/ui/CoreButton";

const failed = [
  { id: "VAS-8820", customer: "Biodun Adeyemi", type: "Data", provider: "Airtel", amount: "₦3,500.00", date: "May 8, 2024", reason: "Provider timeout" },
  { id: "VAS-8813", customer: "Ifunanya Okonkwo", type: "Airtime", provider: "9mobile", amount: "₦500.00", date: "May 5, 2024", reason: "Insufficient balance" },
  { id: "VAS-8807", customer: "Sola Fashola", type: "Data", provider: "Glo", amount: "₦1,500.00", date: "May 2, 2024", reason: "Network error" },
  { id: "VAS-8801", customer: "Tunde Bakare", type: "Electricity", provider: "EKEDC", amount: "₦7,000.00", date: "May 1, 2024", reason: "Invalid meter number" },
  { id: "VAS-8799", customer: "Amaka Obi", type: "Cable TV", provider: "DSTV", amount: "₦21,000.00", date: "Apr 30, 2024", reason: "Provider timeout" },
  { id: "VAS-8791", customer: "Emmanuel Okafor", type: "Airtime", provider: "MTN", amount: "₦2,000.00", date: "Apr 29, 2024", reason: "System error" },
  { id: "VAS-8785", customer: "Grace Eze", type: "Data", provider: "MTN", amount: "₦5,000.00", date: "Apr 28, 2024", reason: "Provider timeout" },
  { id: "VAS-8780", customer: "Henry Babatunde", type: "Electricity", provider: "PHED", amount: "₦12,000.00", date: "Apr 28, 2024", reason: "Invalid token" },
  { id: "VAS-8774", customer: "Kemi Okonkwo", type: "Airtime", provider: "Airtel", amount: "₦1,000.00", date: "Apr 27, 2024", reason: "Network error" },
  { id: "VAS-8768", customer: "Lanre Balogun", type: "Cable TV", provider: "GoTV", amount: "₦4,850.00", date: "Apr 26, 2024", reason: "Provider timeout" },
  { id: "VAS-8761", customer: "Ngozi Eze", type: "Data", provider: "Glo", amount: "₦2,500.00", date: "Apr 26, 2024", reason: "Insufficient balance" },
  { id: "VAS-8755", customer: "Rotimi Adeleke", type: "Electricity", provider: "IBEDC", amount: "₦9,000.00", date: "Apr 25, 2024", reason: "System error" },
];

export default function FailedTransactionsPage() {
  return (
    <PageShell>
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-[#0F172A] font-[SN_Pro] tracking-[-0.3px]">
          Failed Transactions
        </h1>
      </div>
      {/* Banner */}
      <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-2xl px-5 py-4 flex items-center gap-3 mb-6">
        <HugeiconsIcon icon={AlertCircleIcon} size={20} color="#EF4444" strokeWidth={1.5} className="flex-shrink-0" />
        <p className="text-[13px] text-[#475569] flex-1">
          <span className="font-semibold text-[#DC2626]">12 transactions failed</span> in the last 24 hours.
          Review and retry or refund affected customers.
        </p>
        <button className="px-4 py-2 bg-[#EF4444] hover:bg-[#DC2626] text-white text-[13px] font-semibold rounded-full transition-colors flex items-center gap-2">
          <HugeiconsIcon icon={ReloadIcon} size={14} color="white" strokeWidth={1.5} />
          Retry all
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <h3 className="font-[SN_Pro] text-[15px] font-semibold text-[#0F172A]">Failed Transactions</h3>
          <CoreBadge variant="error">{failed.length} failed</CoreBadge>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E2E8F0]">
              {["Tx ID", "Customer", "Type", "Provider", "Amount", "Reason", "Date", "Actions"].map((col) => (
                <th key={col} className="px-5 py-3 text-left text-[11px] font-semibold text-[#94A3B8] uppercase tracking-[0.06em]">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {failed.map((tx) => (
              <tr key={tx.id} className="border-b border-[#E2E8F0] last:border-b-0 hover:bg-[#F8FAFC]">
                <td className="px-5 py-3.5 text-[13px] font-medium text-[#00B3FF]">{tx.id}</td>
                <td className="px-5 py-3.5 text-[13px] text-[#0F172A] font-medium">{tx.customer}</td>
                <td className="px-5 py-3.5 text-[13px] text-[#475569]">{tx.type}</td>
                <td className="px-5 py-3.5 text-[13px] text-[#475569]">{tx.provider}</td>
                <td className="px-5 py-3.5 text-[13px] font-semibold text-[#0F172A]">{tx.amount}</td>
                <td className="px-5 py-3.5 text-[12px] text-[#EF4444]">{tx.reason}</td>
                <td className="px-5 py-3.5 text-[13px] text-[#475569]">{tx.date}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <CoreButton variant="outline" size="sm">Retry</CoreButton>
                    <CoreButton variant="ghost" size="sm">Refund</CoreButton>
                    <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F2F7F9]">
                      <HugeiconsIcon icon={MoreVerticalIcon} size={16} color="#94A3B8" strokeWidth={1.5} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="px-5 py-3.5 border-t border-[#E2E8F0] flex items-center justify-between">
          <p className="text-[13px] text-[#475569]">Showing 1–{failed.length} of {failed.length} results</p>
          <div className="flex items-center gap-2">
            <CoreButton variant="outline" size="sm" disabled>Previous</CoreButton>
            <CoreButton variant="outline" size="sm" disabled>Next</CoreButton>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

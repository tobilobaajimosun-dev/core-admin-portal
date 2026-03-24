import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  Money02Icon,
  Wallet02Icon,
  ReceiptTextIcon,
  UserCheck01Icon,
  Call02Icon,
  Mail01Icon,
  Location01Icon,
  Calendar01Icon,
} from "@hugeicons-pro/core-stroke-rounded";
import PageShell from "@/components/layout/PageShell";
import { CoreButton } from "@/components/ui/CoreButton";
import CoreBadge from "@/components/ui/CoreBadge";

const loanHistory = [
  { id: "LN-2024-001", amount: "₦150,000.00", status: "active", disbursed: "Mar 1, 2024", due: "Sep 1, 2024", repaid: "₦45,000.00" },
  { id: "LN-2023-089", amount: "₦80,000.00", status: "completed", disbursed: "Aug 10, 2023", due: "Feb 10, 2024", repaid: "₦80,000.00" },
  { id: "LN-2023-034", amount: "₦50,000.00", status: "completed", disbursed: "Mar 5, 2023", due: "Sep 5, 2023", repaid: "₦50,000.00" },
];

const transactions = [
  { id: "TXN-9821", type: "Loan Disbursement", amount: "+₦150,000.00", date: "Mar 1, 2024", status: "success" },
  { id: "TXN-9755", type: "Loan Repayment", amount: "-₦15,000.00", date: "Apr 1, 2024", status: "success" },
  { id: "TXN-9701", type: "Airtime Purchase", amount: "-₦2,000.00", date: "Apr 3, 2024", status: "success" },
  { id: "TXN-9688", type: "Loan Repayment", amount: "-₦15,000.00", date: "May 1, 2024", status: "success" },
  { id: "TXN-9612", type: "Data Purchase", amount: "-₦3,500.00", date: "May 8, 2024", status: "failed" },
];

const loanVariant: Record<string, "info" | "success" | "neutral" | "error"> = {
  active: "info", completed: "success", none: "neutral", defaulted: "error",
};
const txVariant: Record<string, "success" | "error"> = { success: "success", failed: "error" };

export default function CustomerProfilePage() {
  return (
    <PageShell>
      <div className="mb-4">
        <h1 className="text-[22px] font-semibold text-[#0F172A] font-[SN_Pro] tracking-[-0.3px]">
          Customer Profile
        </h1>
      </div>
      {/* Back link */}
      <Link
        href="/customers"
        className="inline-flex items-center gap-1.5 text-[13px] text-[#475569] hover:text-[#0F172A] mb-6 transition-colors"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={15} color="currentColor" strokeWidth={1.5} />
        All customers
      </Link>

      <div className="grid grid-cols-3 gap-6">
        {/* LEFT — profile card */}
        <div className="col-span-1 space-y-4">
          {/* Profile */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="px-5 py-5 flex flex-col items-center text-center border-b border-[#E2E8F0]">
              <div className="w-16 h-16 rounded-full bg-[#00B3FF] text-white text-[20px] font-semibold flex items-center justify-center">
                AO
              </div>
              <h2 className="font-[SN_Pro] text-[16px] font-semibold text-[#0F172A] mt-3">
                Amaka Obi
              </h2>
              <p className="text-[13px] text-[#475569] mt-1">+234 801 234 5678</p>
              <div className="mt-2">
                <CoreBadge variant="success">KYC Verified</CoreBadge>
              </div>
              <div className="flex gap-2 mt-4">
                <CoreButton variant="outline" size="sm">Suspend</CoreButton>
                <CoreButton variant="filled" size="sm">View loans</CoreButton>
              </div>
            </div>

            {/* Contact details */}
            <div className="px-5 py-4 space-y-3">
              {[
                { icon: Mail01Icon, label: "amaka.obi@gmail.com" },
                { icon: Call02Icon, label: "+234 801 234 5678" },
                { icon: Location01Icon, label: "Lagos, Nigeria" },
                { icon: Calendar01Icon, label: "Joined Jan 12, 2024" },
              ].map(({ icon, label }, i) => (
                <div key={i} className="flex items-center gap-3">
                  <HugeiconsIcon icon={icon} size={15} color="#94A3B8" strokeWidth={1.5} />
                  <span className="text-[13px] text-[#475569]">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick stats */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2E8F0]">
              <p className="font-[SN_Pro] text-[14px] font-semibold text-[#0F172A]">Financial Summary</p>
            </div>
            {[
              { icon: Wallet02Icon, label: "Wallet Balance", value: "₦124,500.00", color: "#00B3FF" },
              { icon: Money02Icon, label: "Total Borrowed", value: "₦280,000.00", color: "#00B3FF" },
              { icon: Money02Icon, label: "Total Repaid", value: "₦175,000.00", color: "#22C55E" },
              { icon: ReceiptTextIcon, label: "VAS Spend", value: "₦28,400.00", color: "#F59E0B" },
            ].map((item, i) => (
              <div key={i} className="px-5 py-3.5 flex items-center justify-between border-b border-[#E2E8F0] last:border-b-0">
                <div className="flex items-center gap-2.5">
                  <HugeiconsIcon icon={item.icon} size={15} color={item.color} strokeWidth={1.5} />
                  <span className="text-[13px] text-[#475569]">{item.label}</span>
                </div>
                <span className="text-[13px] font-semibold text-[#0F172A]">{item.value}</span>
              </div>
            ))}
          </div>

          {/* KYC card */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
              <p className="font-[SN_Pro] text-[14px] font-semibold text-[#0F172A]">KYC Details</p>
              <CoreBadge variant="success">Verified</CoreBadge>
            </div>
            {[
              { label: "BVN", value: "••••••••123" },
              { label: "NIN", value: "••••••••456" },
              { label: "ID Type", value: "National ID" },
              { label: "Verified on", value: "Jan 15, 2024" },
            ].map((item, i) => (
              <div key={i} className="px-5 py-3.5 flex items-center justify-between border-b border-[#E2E8F0] last:border-b-0">
                <span className="text-[13px] text-[#475569]">{item.label}</span>
                <span className="text-[13px] font-medium text-[#0F172A]">{item.value}</span>
              </div>
            ))}
            <div className="px-5 py-3.5">
              <CoreButton variant="ghost" size="sm" iconLeft={UserCheck01Icon}>
                Reveal masked data
              </CoreButton>
            </div>
          </div>
        </div>

        {/* RIGHT — loans + transactions */}
        <div className="col-span-2 space-y-4">
          {/* Loan history */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
              <h3 className="font-[SN_Pro] text-[15px] font-semibold text-[#0F172A]">Loan History</h3>
              <CoreButton variant="outline" size="sm">View all loans</CoreButton>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E2E8F0]">
                  {["Loan ID", "Amount", "Status", "Disbursed", "Due Date", "Repaid"].map((col) => (
                    <th key={col} className="px-5 py-3 text-left text-[11px] font-semibold text-[#94A3B8] uppercase tracking-[0.06em]">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loanHistory.map((loan, i) => (
                  <tr key={i} className="border-b border-[#E2E8F0] last:border-b-0 hover:bg-[#F8FAFC] cursor-pointer">
                    <td className="px-5 py-3.5 text-[13px] font-medium text-[#00B3FF]">{loan.id}</td>
                    <td className="px-5 py-3.5 text-[13px] font-medium text-[#0F172A]">{loan.amount}</td>
                    <td className="px-5 py-3.5">
                      <CoreBadge variant={loanVariant[loan.status]}>
                        {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                      </CoreBadge>
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-[#475569]">{loan.disbursed}</td>
                    <td className="px-5 py-3.5 text-[13px] text-[#475569]">{loan.due}</td>
                    <td className="px-5 py-3.5 text-[13px] font-medium text-[#0F172A]">{loan.repaid}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recent transactions */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
              <h3 className="font-[SN_Pro] text-[15px] font-semibold text-[#0F172A]">Recent Transactions</h3>
              <CoreButton variant="outline" size="sm">View all</CoreButton>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E2E8F0]">
                  {["Transaction ID", "Type", "Amount", "Date", "Status"].map((col) => (
                    <th key={col} className="px-5 py-3 text-left text-[11px] font-semibold text-[#94A3B8] uppercase tracking-[0.06em]">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, i) => (
                  <tr key={i} className="border-b border-[#E2E8F0] last:border-b-0 hover:bg-[#F8FAFC]">
                    <td className="px-5 py-3.5 text-[13px] font-medium text-[#00B3FF]">{tx.id}</td>
                    <td className="px-5 py-3.5 text-[13px] text-[#475569]">{tx.type}</td>
                    <td className={["px-5 py-3.5 text-[13px] font-semibold", tx.amount.startsWith("+") ? "text-[#22C55E]" : "text-[#0F172A]"].join(" ")}>
                      {tx.amount}
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-[#475569]">{tx.date}</td>
                    <td className="px-5 py-3.5">
                      <CoreBadge variant={txVariant[tx.status]}>
                        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                      </CoreBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-5 py-3.5 border-t border-[#E2E8F0] flex items-center justify-between">
              <p className="text-[13px] text-[#475569]">Showing 1–5 of 143 results</p>
              <div className="flex items-center gap-2">
                <CoreButton variant="outline" size="sm" disabled>Previous</CoreButton>
                <CoreButton variant="outline" size="sm">Next</CoreButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

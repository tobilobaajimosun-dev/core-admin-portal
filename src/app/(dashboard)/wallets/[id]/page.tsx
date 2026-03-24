import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, Wallet02Icon, ArrowUpRight01Icon, ArrowDownLeft01Icon } from "@hugeicons-pro/core-stroke-rounded";
import PageShell from "@/components/layout/PageShell";
import MetricCard from "@/components/ui/MetricCard";
import CoreBadge from "@/components/ui/CoreBadge";
import { CoreButton } from "@/components/ui/CoreButton";

const transactions = [
  { id: "TXN-9821", type: "credit", amount: "+₦150,000.00", description: "Loan disbursement", date: "Mar 1, 2024", status: "success" },
  { id: "TXN-9755", type: "debit", amount: "-₦15,000.00", description: "Loan repayment", date: "Apr 1, 2024", status: "success" },
  { id: "TXN-9701", type: "debit", amount: "-₦2,000.00", description: "Airtime — MTN", date: "Apr 3, 2024", status: "success" },
  { id: "TXN-9688", type: "debit", amount: "-₦15,000.00", description: "Loan repayment", date: "May 1, 2024", status: "success" },
  { id: "TXN-9612", type: "bill_payment", amount: "-₦3,500.00", description: "Data — Airtel 5GB", date: "May 8, 2024", status: "failed" },
  { id: "TXN-9580", type: "credit", amount: "+₦50,000.00", description: "Wallet top-up", date: "Feb 20, 2024", status: "success" },
  { id: "TXN-9540", type: "debit", amount: "-₦8,000.00", description: "DSTV subscription", date: "Feb 25, 2024", status: "success" },
  { id: "TXN-9501", type: "debit", amount: "-₦5,000.00", description: "Electricity — EKEDC", date: "Mar 15, 2024", status: "success" },
  { id: "TXN-9455", type: "bill_payment", amount: "-₦1,500.00", description: "Airtime — Glo", date: "Mar 20, 2024", status: "success" },
  { id: "TXN-9420", type: "credit", amount: "+₦75,000.00", description: "Transfer received", date: "Jan 30, 2024", status: "success" },
  { id: "TXN-9380", type: "debit", amount: "-₦25,000.00", description: "Transfer out", date: "Feb 5, 2024", status: "success" },
  { id: "TXN-9340", type: "bill_payment", amount: "-₦6,000.00", description: "PHCN — Ikeja Electric", date: "Feb 10, 2024", status: "success" },
  { id: "TXN-9300", type: "credit", amount: "+₦20,000.00", description: "Wallet top-up", date: "Jan 20, 2024", status: "success" },
  { id: "TXN-9260", type: "debit", amount: "-₦2,500.00", description: "Airtime — 9mobile", date: "Jan 22, 2024", status: "success" },
  { id: "TXN-9220", type: "bill_payment", amount: "-₦4,200.00", description: "GOtv Jolli", date: "Jan 25, 2024", status: "failed" },
];

const typeVariant: Record<string, "success" | "neutral" | "warning"> = {
  credit: "success", debit: "neutral", bill_payment: "warning",
};
const statusVariant: Record<string, "success" | "error"> = { success: "success", failed: "error" };

export default function WalletDetailPage() {
  return (
    <PageShell>
      <div className="mb-4">
        <h1 className="text-[22px] font-semibold text-[#0F172A] font-[SN_Pro] tracking-[-0.3px]">
          Wallet Detail
        </h1>
      </div>
      <Link href="/wallets" className="inline-flex items-center gap-1.5 text-[13px] text-[#475569] hover:text-[#0F172A] mb-6 transition-colors">
        <HugeiconsIcon icon={ArrowLeft01Icon} size={15} color="currentColor" strokeWidth={1.5} />
        All wallets
      </Link>

      <div className="grid grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="col-span-1">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="px-5 py-5 border-b border-[#E2E8F0]">
              <p className="text-[13px] text-[#94A3B8]">Account No.</p>
              <p className="font-[SN_Pro] text-[20px] font-semibold text-[#0F172A] mt-0.5">2041234567</p>
              <p className="font-[SN_Pro] text-[28px] font-semibold text-[#0F172A] mt-2">₦124,500.00</p>
              <div className="mt-2"><CoreBadge variant="success">Active</CoreBadge></div>
            </div>
            {[
              { label: "Customer", value: "Amaka Obi" },
              { label: "Phone", value: "+234 801 234 5678" },
              { label: "Created", value: "Jan 12, 2024" },
              { label: "Last Transaction", value: "May 8, 2024" },
              { label: "Total In", value: "₦295,000.00" },
              { label: "Total Out", value: "₦170,500.00" },
            ].map((row, i) => (
              <div key={i} className="px-5 py-3 flex justify-between items-center border-b border-[#E2E8F0] last:border-b-0">
                <span className="text-[12px] text-[#94A3B8] uppercase tracking-wide">{row.label}</span>
                <span className="text-[13px] font-medium text-[#0F172A]">{row.value}</span>
              </div>
            ))}
            <div className="px-5 py-4 flex flex-col gap-2 border-t border-[#E2E8F0]">
              <CoreButton variant="outline" size="sm" className="w-full">Freeze wallet</CoreButton>
              <CoreButton variant="filled" size="sm" className="w-full">View customer</CoreButton>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="col-span-2 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <MetricCard label="Balance" value="₦124,500.00" icon={Wallet02Icon} />
            <MetricCard label="Total In" value="₦295,000.00" icon={ArrowUpRight01Icon} delta="+₦75k" deltaLabel="this month" deltaType="up" />
            <MetricCard label="Total Out" value="₦170,500.00" icon={ArrowDownLeft01Icon} />
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
              <h3 className="font-[SN_Pro] text-[15px] font-semibold text-[#0F172A]">Transaction History</h3>
              <CoreButton variant="ghost" size="sm">Export</CoreButton>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E2E8F0]">
                  {["Tx ID", "Type", "Amount", "Description", "Date", "Status"].map((col) => (
                    <th key={col} className="px-5 py-3 text-left text-[11px] font-semibold text-[#94A3B8] uppercase tracking-[0.06em]">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, i) => (
                  <tr key={i} className="border-b border-[#E2E8F0] last:border-b-0 hover:bg-[#F8FAFC]">
                    <td className="px-5 py-3.5 text-[13px] font-medium text-[#00B3FF]">{tx.id}</td>
                    <td className="px-5 py-3.5"><CoreBadge variant={typeVariant[tx.type]}>{tx.type.replace("_", " ")}</CoreBadge></td>
                    <td className={["px-5 py-3.5 text-[13px] font-semibold", tx.amount.startsWith("+") ? "text-[#22C55E]" : "text-[#0F172A]"].join(" ")}>{tx.amount}</td>
                    <td className="px-5 py-3.5 text-[13px] text-[#475569]">{tx.description}</td>
                    <td className="px-5 py-3.5 text-[13px] text-[#475569]">{tx.date}</td>
                    <td className="px-5 py-3.5"><CoreBadge variant={statusVariant[tx.status]}>{tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}</CoreBadge></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-5 py-3.5 border-t border-[#E2E8F0] flex items-center justify-between">
              <p className="text-[13px] text-[#475569]">Showing 1–15 of 143 results</p>
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

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  Money02Icon,
  ArrowTurnBackwardIcon,
  AlertCircleIcon,
  Download01Icon,
  CheckmarkCircle01Icon,
  Login01Icon,
  Notification02Icon,
} from "@hugeicons-pro/core-stroke-rounded";
import PageShell from "@/components/layout/PageShell";
import MetricCard from "@/components/ui/MetricCard";
import CoreBadge from "@/components/ui/CoreBadge";
import { CoreButton } from "@/components/ui/CoreButton";

const schedule = [
  { no: 1, due: "Apr 1, 2024", amount: "₦25,000.00", status: "paid", paidDate: "Apr 1, 2024" },
  { no: 2, due: "May 1, 2024", amount: "₦25,000.00", status: "paid", paidDate: "May 2, 2024" },
  { no: 3, due: "Jun 1, 2024", amount: "₦25,000.00", status: "upcoming", paidDate: "—" },
  { no: 4, due: "Jul 1, 2024", amount: "₦25,000.00", status: "upcoming", paidDate: "—" },
  { no: 5, due: "Aug 1, 2024", amount: "₦25,000.00", status: "upcoming", paidDate: "—" },
  { no: 6, due: "Sep 1, 2024", amount: "₦25,000.00", status: "upcoming", paidDate: "—" },
];

const scheduleVariant: Record<string, "success" | "info" | "error"> = {
  paid: "success", upcoming: "info", overdue: "error",
};

const log = [
  { icon: Money02Icon, iconBg: "rgba(0,179,255,0.08)", iconColor: "#00B3FF", action: "Loan Disbursed", detail: "₦150,000.00 sent to Amaka Obi — GTB ****5678", time: "Mar 1, 2024, 9:04 AM" },
  { icon: Notification02Icon, iconBg: "#F2F7F9", iconColor: "#94A3B8", action: "Notification Sent", detail: "SMS & in-app: disbursement confirmation", time: "Mar 1, 2024, 9:05 AM" },
  { icon: ArrowTurnBackwardIcon, iconBg: "rgba(34,197,94,0.08)", iconColor: "#22C55E", action: "Repayment Received", detail: "₦25,000.00 — instalment 1 of 6", time: "Apr 1, 2024, 2:15 PM" },
  { icon: ArrowTurnBackwardIcon, iconBg: "rgba(34,197,94,0.08)", iconColor: "#22C55E", action: "Repayment Received", detail: "₦25,000.00 — instalment 2 of 6", time: "May 2, 2024, 10:31 AM" },
  { icon: Login01Icon, iconBg: "#F2F7F9", iconColor: "#94A3B8", action: "Status Updated", detail: "Loan status changed: Active", time: "Mar 1, 2024, 9:04 AM" },
];

export default function LoanDetailPage() {
  return (
    <PageShell title="Loan Details">
      <Link href="/loans" className="inline-flex items-center gap-1.5 text-[13px] text-[#475569] hover:text-[#0F172A] mb-6 transition-colors">
        <HugeiconsIcon icon={ArrowLeft01Icon} size={15} color="currentColor" strokeWidth={1.5} />
        All loans
      </Link>

      <div className="grid grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="col-span-1">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="px-5 py-5 border-b border-[#E2E8F0]">
              <p className="text-[13px] text-[#94A3B8] font-medium">LN-2024-0042</p>
              <p className="font-[SN_Pro] text-[28px] font-semibold text-[#0F172A] mt-1 leading-none">₦150,000.00</p>
              <div className="mt-2"><CoreBadge variant="info">Active</CoreBadge></div>
            </div>

            {[
              { label: "Customer", value: "Amaka Obi" },
              { label: "Duration", value: "6 months" },
              { label: "Interest Rate", value: "5% / month" },
              { label: "Start Date", value: "Mar 1, 2024" },
              { label: "Due Date", value: "Sep 1, 2024" },
              { label: "Disbursement Acct", value: "GTB ****5678" },
              { label: "Loan Officer", value: "Funke Adeyemi" },
            ].map((row, i) => (
              <div key={i} className="px-5 py-3 flex justify-between items-center border-b border-[#E2E8F0] last:border-b-0">
                <span className="text-[12px] text-[#94A3B8] uppercase tracking-wide">{row.label}</span>
                <span className="text-[13px] font-medium text-[#0F172A]">{row.value}</span>
              </div>
            ))}

            <div className="px-5 py-4 flex flex-col gap-2 border-t border-[#E2E8F0]">
              <CoreButton variant="filled" size="sm" className="w-full">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={15} color="currentColor" strokeWidth={1.5} />
                Mark as repaid
              </CoreButton>
              <CoreButton variant="outline" size="sm" className="w-full">Flag for review</CoreButton>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="col-span-2 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <MetricCard label="Amount Disbursed" value="₦150,000.00" icon={Money02Icon} />
            <MetricCard label="Total Repaid" value="₦50,000.00" icon={ArrowTurnBackwardIcon} delta="+₦25k" deltaLabel="last month" deltaType="up" />
            <MetricCard label="Outstanding" value="₦100,000.00" icon={AlertCircleIcon} delta="-₦25k" deltaLabel="since start" deltaType="down" />
          </div>

          {/* Repayment schedule */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
              <h3 className="font-[SN_Pro] text-[15px] font-semibold text-[#0F172A]">Repayment Schedule</h3>
              <CoreButton variant="ghost" size="sm" iconLeft={Download01Icon}>Export</CoreButton>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E2E8F0]">
                  {["#", "Due Date", "Amount", "Status", "Paid Date"].map((col) => (
                    <th key={col} className="px-5 py-3 text-left text-[11px] font-semibold text-[#94A3B8] uppercase tracking-[0.06em]">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {schedule.map((row) => (
                  <tr key={row.no} className="border-b border-[#E2E8F0] last:border-b-0">
                    <td className="px-5 py-3.5 text-[13px] text-[#94A3B8]">{row.no}</td>
                    <td className="px-5 py-3.5 text-[13px] text-[#475569]">{row.due}</td>
                    <td className="px-5 py-3.5 text-[13px] font-semibold text-[#0F172A]">{row.amount}</td>
                    <td className="px-5 py-3.5"><CoreBadge variant={scheduleVariant[row.status]}>{row.status.charAt(0).toUpperCase() + row.status.slice(1)}</CoreBadge></td>
                    <td className="px-5 py-3.5 text-[13px] text-[#475569]">{row.paidDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Disbursement log */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2E8F0]">
              <h3 className="font-[SN_Pro] text-[15px] font-semibold text-[#0F172A]">Disbursement Log</h3>
            </div>
            <div className="px-5 py-2">
              {log.map((item, i) => (
                <div key={i} className="flex gap-3 py-3 border-b border-[#E2E8F0] last:border-b-0">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: item.iconBg }}>
                    <HugeiconsIcon icon={item.icon} size={15} color={item.iconColor} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-[#0F172A]">{item.action}</p>
                    <p className="text-[12px] text-[#475569] mt-0.5">{item.detail}</p>
                    <p className="text-[11px] text-[#94A3B8] mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons-pro/core-stroke-rounded";
import PageShell from "@/components/layout/PageShell";
import CoreBadge from "@/components/ui/CoreBadge";

const log = {
  id: "ACT-1041",
  admin: "Lademi Aliu",
  role: "Super Admin",
  email: "lademi@princeps.ng",
  action: "Updated loan status",
  module: "Loans",
  details: "Loan #LN-8821 marked as Defaulted",
  ip: "102.89.12.45",
  userAgent: "Chrome 124 / macOS 14.4",
  datetime: "May 8, 2024 · 11:42 AM",
  before: {
    loanId: "LN-8821",
    status: "Active",
    nextDueDate: "May 15, 2024",
    outstandingBalance: "₦45,000.00",
  },
  after: {
    loanId: "LN-8821",
    status: "Defaulted",
    nextDueDate: "—",
    outstandingBalance: "₦45,000.00",
  },
  timeline: [
    { time: "11:42:03 AM", event: "Action committed", note: "Status updated to Defaulted" },
    { time: "11:42:01 AM", event: "Validation passed", note: "All required fields verified" },
    { time: "11:41:58 AM", event: "Permission check", note: "Super Admin — write access confirmed" },
    { time: "11:41:55 AM", event: "Action initiated", note: "Admin navigated to loan #LN-8821" },
    { time: "11:41:50 AM", event: "Session authenticated", note: "Active session from 102.89.12.45" },
  ],
};

const fieldDiff = (before: string, after: string) => {
  const changed = before !== after;
  return { before, after, changed };
};

const diffRows = [
  { field: "Loan ID", ...fieldDiff(log.before.loanId, log.after.loanId) },
  { field: "Status", ...fieldDiff(log.before.status, log.after.status) },
  { field: "Next Due Date", ...fieldDiff(log.before.nextDueDate, log.after.nextDueDate) },
  { field: "Outstanding Balance", ...fieldDiff(log.before.outstandingBalance, log.after.outstandingBalance) },
];

export default function ActivityDetailPage() {
  return (
    <PageShell>
      <div className="mb-4">
        <h1 className="text-[22px] font-semibold text-[#0F172A] font-[SN_Pro] tracking-[-0.3px]">
          Audit Log Detail
        </h1>
      </div>
      <Link href="/activity" className="inline-flex items-center gap-1.5 text-[13px] text-[#475569] hover:text-[#0F172A] mb-6 transition-colors">
        <HugeiconsIcon icon={ArrowLeft01Icon} size={15} color="currentColor" strokeWidth={1.5} />
        Activity Logs
      </Link>

      <div className="grid grid-cols-3 gap-6">
        {/* LEFT — summary */}
        <div className="col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="px-5 py-5 border-b border-[#E2E8F0]">
              <p className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-[0.06em] mb-1">Event ID</p>
              <p className="font-[SN_Pro] text-[18px] font-semibold text-[#0F172A]">{log.id}</p>
              <div className="mt-2">
                <CoreBadge variant="info">{log.module}</CoreBadge>
              </div>
            </div>
            {[
              { label: "Admin", value: log.admin },
              { label: "Role", value: log.role },
              { label: "Email", value: log.email },
              { label: "Action", value: log.action },
              { label: "IP Address", value: log.ip },
              { label: "Browser / OS", value: log.userAgent },
              { label: "Date & Time", value: log.datetime },
            ].map((row) => (
              <div key={row.label} className="px-5 py-3 flex justify-between items-start border-b border-[#E2E8F0] last:border-b-0 gap-4">
                <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wide whitespace-nowrap">{row.label}</span>
                <span className="text-[13px] font-medium text-[#0F172A] text-right">{row.value}</span>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2E8F0]">
              <h3 className="font-[SN_Pro] text-[14px] font-semibold text-[#0F172A]">Event Timeline</h3>
            </div>
            <div className="px-5 py-4">
              <div className="relative">
                <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[#E2E8F0]" />
                <div className="space-y-5">
                  {log.timeline.map((step, i) => (
                    <div key={i} className="flex gap-3 relative">
                      <div className={["w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 mt-0.5 z-10",
                        i === 0 ? "bg-[#00B3FF] border-[#00B3FF]" : "bg-white border-[#E2E8F0]"].join(" ")} />
                      <div>
                        <p className="text-[12px] font-semibold text-[#0F172A]">{step.event}</p>
                        <p className="text-[11px] text-[#94A3B8] mt-0.5">{step.note}</p>
                        <p className="text-[11px] text-[#CBD5E1] mt-0.5">{step.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — diff */}
        <div className="col-span-2">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2E8F0]">
              <h3 className="font-[SN_Pro] text-[15px] font-semibold text-[#0F172A]">Before / After Changes</h3>
              <p className="text-[12px] text-[#94A3B8] mt-0.5">Fields that changed are highlighted</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E2E8F0]">
                    <th className="px-5 py-3 text-left text-[11px] font-semibold text-[#94A3B8] uppercase tracking-[0.06em] w-[160px]">Field</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold text-[#94A3B8] uppercase tracking-[0.06em]">Before</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold text-[#94A3B8] uppercase tracking-[0.06em]">After</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold text-[#94A3B8] uppercase tracking-[0.06em]">Changed</th>
                  </tr>
                </thead>
                <tbody>
                  {diffRows.map((row) => (
                    <tr key={row.field} className={["border-b border-[#E2E8F0] last:border-b-0", row.changed ? "bg-[#FFFBEB]" : ""].join(" ")}>
                      <td className="px-5 py-4 text-[13px] font-semibold text-[#0F172A]">{row.field}</td>
                      <td className="px-5 py-4">
                        <span className={["text-[13px] px-2.5 py-1 rounded-lg font-mono",
                          row.changed ? "bg-[#FEE2E2] text-[#DC2626]" : "text-[#475569]"].join(" ")}>
                          {row.before}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={["text-[13px] px-2.5 py-1 rounded-lg font-mono",
                          row.changed ? "bg-[#DCFCE7] text-[#16A34A]" : "text-[#475569]"].join(" ")}>
                          {row.after}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {row.changed
                          ? <CoreBadge variant="warning">Modified</CoreBadge>
                          : <CoreBadge variant="neutral">Unchanged</CoreBadge>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Raw payload */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden mt-4">
            <div className="px-5 py-4 border-b border-[#E2E8F0]">
              <h3 className="font-[SN_Pro] text-[14px] font-semibold text-[#0F172A]">Raw Payload</h3>
            </div>
            <div className="px-5 py-4">
              <pre className="text-[12px] font-mono text-[#475569] bg-[#F8FAFC] rounded-xl p-4 overflow-x-auto leading-relaxed whitespace-pre-wrap">{JSON.stringify({
                eventId: log.id,
                adminId: "USR-001",
                adminEmail: log.email,
                action: "UPDATE_LOAN_STATUS",
                resource: { type: "loan", id: "LN-8821" },
                before: log.before,
                after: log.after,
                metadata: { ip: log.ip, userAgent: log.userAgent, timestamp: "2024-05-08T11:42:03.000Z" },
              }, null, 2)}</pre>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

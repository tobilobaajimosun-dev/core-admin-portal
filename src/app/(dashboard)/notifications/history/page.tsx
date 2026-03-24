import PageShell from "@/components/layout/PageShell";
import CoreBadge from "@/components/ui/CoreBadge";
import { CoreButton } from "@/components/ui/CoreButton";

const history = [
  { title: "Loan Repayment Reminder", channel: "In-App", recipients: "2,341", sent: "2,109", delivered: "2,089", status: "sent", date: "May 7, 2024" },
  { title: "KYC Verification Prompt", channel: "In-App", recipients: "6,129", sent: "6,129", delivered: "5,998", status: "sent", date: "May 5, 2024" },
  { title: "Scheduled Maintenance Notice", channel: "Email", recipients: "18,204", sent: "18,204", delivered: "17,841", status: "sent", date: "May 1, 2024" },
  { title: "New Feature: Bill Payments", channel: "In-App", recipients: "18,204", sent: "—", delivered: "—", status: "scheduled", date: "May 15, 2024" },
  { title: "Welcome to Core", channel: "Email", recipients: "632", sent: "632", delivered: "629", status: "sent", date: "Apr 30, 2024" },
  { title: "Loan Approved", channel: "In-App", recipients: "47", sent: "47", delivered: "47", status: "sent", date: "Apr 28, 2024" },
  { title: "Account Suspended Notice", channel: "Email", recipients: "12", sent: "11", delivered: "9", status: "sent", date: "Apr 25, 2024" },
  { title: "April Statement Ready", channel: "Email", recipients: "18,204", sent: "18,204", delivered: "17,902", status: "sent", date: "Apr 20, 2024" },
  { title: "VAS Launch Announcement", channel: "In-App", recipients: "18,204", sent: "—", delivered: "—", status: "draft", date: "—" },
  { title: "System Error Notification", channel: "In-App", recipients: "312", sent: "312", delivered: "0", status: "failed", date: "Apr 15, 2024" },
  { title: "Loan Due Tomorrow", channel: "In-App", recipients: "891", sent: "891", delivered: "887", status: "sent", date: "Apr 14, 2024" },
  { title: "Profile Update Prompt", channel: "Email", recipients: "4,201", sent: "4,201", delivered: "4,189", status: "sent", date: "Apr 10, 2024" },
  { title: "Q1 Activity Summary", channel: "Email", recipients: "18,204", sent: "18,204", delivered: "17,788", status: "sent", date: "Apr 5, 2024" },
  { title: "Rate Change Notice", channel: "In-App", recipients: "18,204", sent: "—", delivered: "—", status: "scheduled", date: "May 20, 2024" },
  { title: "Transaction Alert", channel: "In-App", recipients: "3,241", sent: "3,241", delivered: "3,201", status: "sent", date: "Apr 1, 2024" },
];

const statusVariant: Record<string, "success" | "info" | "error" | "neutral"> = {
  sent: "success", scheduled: "info", failed: "error", draft: "neutral",
};

export default function NotificationHistoryPage() {
  return (
    <PageShell>
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-[#0F172A] font-[SN_Pro] tracking-[-0.3px]">
          Notification History
        </h1>
      </div>
      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <h2 className="font-[SN_Pro] text-[15px] font-semibold text-[#0F172A]">All Notifications</h2>
          <CoreButton variant="filled" size="sm">+ New notification</CoreButton>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E2E8F0]">
              {["Title", "Channel", "Recipients", "Sent", "Delivered", "Status", "Date", "Actions"].map((col) => (
                <th key={col} className="px-5 py-3 text-left text-[11px] font-semibold text-[#94A3B8] uppercase tracking-[0.06em]">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.map((n, i) => (
              <tr key={i} className="border-b border-[#E2E8F0] last:border-b-0 hover:bg-[#F8FAFC] cursor-pointer">
                <td className="px-5 py-3.5 text-[13px] font-medium text-[#0F172A] max-w-[200px] truncate">{n.title}</td>
                <td className="px-5 py-3.5 text-[13px] text-[#475569]">{n.channel}</td>
                <td className="px-5 py-3.5 text-[13px] text-[#475569]">{n.recipients}</td>
                <td className="px-5 py-3.5 text-[13px] text-[#475569]">{n.sent}</td>
                <td className="px-5 py-3.5 text-[13px] text-[#475569]">{n.delivered}</td>
                <td className="px-5 py-3.5"><CoreBadge variant={statusVariant[n.status]}>{n.status.charAt(0).toUpperCase() + n.status.slice(1)}</CoreBadge></td>
                <td className="px-5 py-3.5 text-[13px] text-[#475569]">{n.date}</td>
                <td className="px-5 py-3.5">
                  <CoreButton variant="ghost" size="sm">View</CoreButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="px-5 py-3.5 border-t border-[#E2E8F0] flex items-center justify-between">
          <p className="text-[13px] text-[#475569]">Showing 1–15 of 142 results</p>
          <div className="flex items-center gap-2">
            <CoreButton variant="outline" size="sm" disabled>Previous</CoreButton>
            <CoreButton variant="outline" size="sm">Next</CoreButton>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

"use client";

import { useState } from "react";
import PageShell from "@/components/layout/PageShell";
import { CoreButton } from "@/components/ui/CoreButton";
import { CoreInput } from "@/components/ui/CoreInput";

export default function NotificationsPage() {
  const [channel, setChannel] = useState<"In-App" | "Email">("In-App");
  const [scheduled, setScheduled] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <PageShell title="Notifications">
      <div className="grid grid-cols-3 gap-6">
        {/* LEFT — compose */}
        <div className="col-span-2">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2E8F0]">
              <h2 className="font-[SN_Pro] text-[15px] font-semibold text-[#0F172A]">Send Notification</h2>
            </div>

            <div className="px-5 py-6 flex flex-col gap-5">
              {/* Channel */}
              <div>
                <label className="text-[13px] font-medium text-[#0F172A] mb-2 block">Channel</label>
                <div className="inline-flex gap-1">
                  {(["In-App", "Email"] as const).map((c) => (
                    <button key={c} onClick={() => setChannel(c)}
                      className={["px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-150",
                        channel === c ? "bg-[#00B3FF] text-white" : "bg-[#F2F7F9] text-[#475569] hover:bg-[#E8EEF2]"].join(" ")}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <CoreInput
                label="Subject / Title"
                placeholder="e.g. Your loan is due in 3 days"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              {/* Recipients */}
              <div>
                <label className="text-[13px] font-medium text-[#0F172A] mb-1.5 block">Send to</label>
                <select className="h-12 w-full bg-[#F2F7F9] rounded-xl px-4 border-2 border-transparent outline-none text-[14px] text-[#0F172A] appearance-none focus:border-[#00B3FF] focus:shadow-[0_0_0_3px_rgba(0,179,255,0.10)] transition-all duration-150">
                  <option>All Users</option>
                  <option>Verified Users</option>
                  <option>Active Borrowers</option>
                  <option>Custom Segment</option>
                  <option>Specific User</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="text-[13px] font-medium text-[#0F172A] mb-1.5 block">Message</label>
                <div className="relative">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value.slice(0, 500))}
                    placeholder="Write your message here..."
                    rows={4}
                    className="w-full bg-[#F2F7F9] rounded-xl px-4 py-3 border-2 border-transparent outline-none text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] resize-none focus:border-[#00B3FF] focus:shadow-[0_0_0_3px_rgba(0,179,255,0.10)] transition-all duration-150"
                  />
                  <span className="absolute bottom-2.5 right-3 text-[11px] text-[#94A3B8]">{message.length}/500</span>
                </div>
              </div>

              {/* Schedule toggle */}
              <div className="flex justify-between items-center">
                <span className="text-[13px] font-medium text-[#0F172A]">Schedule for later</span>
                <button
                  onClick={() => setScheduled(!scheduled)}
                  className={["relative w-10 h-6 rounded-full transition-colors duration-150",
                    scheduled ? "bg-[#00B3FF]" : "bg-[#E2E8F0]"].join(" ")}
                >
                  <span className={["absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-150",
                    scheduled ? "left-5" : "left-1"].join(" ")} />
                </button>
              </div>

              {scheduled && (
                <CoreInput label="Send at" type="datetime-local" />
              )}

              {/* Preview */}
              {(title || message) && (
                <div className="bg-[#F2F7F9] rounded-xl px-4 py-3 border border-[#E2E8F0]">
                  <p className="text-[12px] text-[#94A3B8] mb-2">📱 Preview</p>
                  {title && <p className="text-[13px] font-semibold text-[#0F172A]">{title}</p>}
                  {message && <p className="text-[12px] text-[#475569] mt-1 leading-relaxed">{message}</p>}
                </div>
              )}
            </div>

            <div className="px-5 py-4 border-t border-[#E2E8F0] flex items-center justify-between">
              <p className="text-[13px] text-[#475569]">Recipients: ~18,204 users</p>
              <div className="flex items-center gap-3">
                <CoreButton variant="secondary">Save draft</CoreButton>
                <CoreButton variant="filled" onClick={() => setShowConfirm(true)}>Send notification</CoreButton>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — tips */}
        <div className="col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2E8F0]">
              <h3 className="font-[SN_Pro] text-[14px] font-semibold text-[#0F172A]">Quick Actions</h3>
            </div>
            <div className="px-5 py-4 space-y-3">
              {[
                { label: "Loan reminder", desc: "Notify users with upcoming due dates" },
                { label: "KYC prompt", desc: "Push to unverified users" },
                { label: "New feature", desc: "Announce product updates" },
                { label: "Maintenance notice", desc: "Scheduled downtime alert" },
              ].map((t, i) => (
                <button key={i} className="w-full text-left px-4 py-3 bg-[#F8FAFC] hover:bg-[#F2F7F9] rounded-xl transition-colors">
                  <p className="text-[13px] font-medium text-[#0F172A]">{t.label}</p>
                  <p className="text-[12px] text-[#94A3B8] mt-0.5">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2E8F0]">
              <h3 className="font-[SN_Pro] text-[14px] font-semibold text-[#0F172A]">Recent Sends</h3>
            </div>
            {[
              { title: "Loan Reminder", date: "May 7", recipients: "2,341" },
              { title: "KYC Prompt", date: "May 5", recipients: "6,129" },
              { title: "Maintenance Notice", date: "May 1", recipients: "18,204" },
            ].map((n, i) => (
              <div key={i} className="px-5 py-3 flex justify-between items-center border-b border-[#E2E8F0] last:border-b-0">
                <div>
                  <p className="text-[13px] font-medium text-[#0F172A]">{n.title}</p>
                  <p className="text-[12px] text-[#94A3B8]">{n.recipients} recipients</p>
                </div>
                <span className="text-[12px] text-[#94A3B8]">{n.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confirm modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" onClick={() => setShowConfirm(false)}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-[400px] shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-[SN_Pro] text-[20px] font-semibold text-[#0F172A] mb-2">Confirm send</h2>
            <p className="text-[14px] text-[#475569] mb-6">
              You are about to send a notification to <strong>~18,204 users</strong>. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <CoreButton variant="secondary" className="flex-1" onClick={() => setShowConfirm(false)}>Cancel</CoreButton>
              <CoreButton variant="filled" className="flex-1" onClick={() => setShowConfirm(false)}>Confirm &amp; send</CoreButton>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  FilterIcon,
  ArrowUpRight01Icon,
  ArrowDownLeft01Icon,
} from "@hugeicons-pro/core-stroke-rounded";
import PageShell from "@/components/layout/PageShell";
import CoreBadge from "@/components/ui/CoreBadge";

// ─── Data ────────────────────────────────────────────────────────────────────

const tabs = ["Overview", "Loans", "Customers", "Activity"] as const;
type Tab = (typeof tabs)[number];

const stats = [
  { label: "Total Users",    value: "24,531", delta: "+12%",  up: true  },
  { label: "Active Loans",   value: "8,921",  delta: "+18%",  up: true  },
  { label: "Disbursed MTD",  value: "₦7.3B",  delta: "+31%",  up: true  },
  { label: "Default Rate",   value: "4.2%",   delta: "-0.8%", up: true  },
  { label: "VAS Success",    value: "96.4%",  delta: "+1.2%", up: true  },
  { label: "New Users MTD",  value: "632",    delta: "+24%",  up: true  },
];

const attention = [
  { id: "LN-8820",   color: "#EF4444", title: "Loan overdue",            detail: "Biodun Adeyemi · ₦3,500 · 3 days overdue",       date: "May 8" },
  { id: "USR-3041",  color: "#F59E0B", title: "KYC pending review",       detail: "Grace Eze · Submitted 2 days ago",               date: "May 6" },
  { id: "VAS-8813",  color: "#EF4444", title: "Failed VAS transaction",   detail: "Ifunanya Okonkwo · ₦500 · 9mobile Airtime",      date: "May 5" },
];

const loans = [
  { id: "LN-8821", customer: "Amaka Obi",        amount: "₦150,000", status: "pending",  date: "May 8" },
  { id: "LN-8819", customer: "Chidi Nwosu",       amount: "₦200,000", status: "approved", date: "May 7" },
  { id: "LN-8818", customer: "Dupe Afolabi",      amount: "₦80,000",  status: "approved", date: "May 7" },
  { id: "LN-8817", customer: "Emmanuel Okafor",   amount: "₦50,000",  status: "pending",  date: "May 7" },
  { id: "LN-8816", customer: "Fatima Aliyu",      amount: "₦120,000", status: "review",   date: "May 6" },
  { id: "LN-8815", customer: "Grace Eze",         amount: "₦300,000", status: "approved", date: "May 5" },
  { id: "LN-8814", customer: "Henry Babatunde",   amount: "₦75,000",  status: "rejected", date: "May 5" },
  { id: "LN-8813", customer: "Ifunanya Okonkwo",  amount: "₦250,000", status: "pending",  date: "May 4" },
];

const customers = [
  { id: "USR-3041", name: "Amaka Obi",        email: "amaka.obi@gmail.com",     kyc: "verified",   date: "May 8" },
  { id: "USR-3040", name: "Biodun Adeyemi",   email: "biodun@gmail.com",         kyc: "pending",    date: "May 7" },
  { id: "USR-3039", name: "Chidi Nwosu",      email: "chidi.nwosu@gmail.com",    kyc: "verified",   date: "May 7" },
  { id: "USR-3038", name: "Dupe Afolabi",     email: "dupe.afolabi@gmail.com",   kyc: "unverified", date: "May 6" },
  { id: "USR-3037", name: "Emmanuel Okafor",  email: "emma.okafor@gmail.com",    kyc: "verified",   date: "May 6" },
];

const loanDot: Record<string, string> = {
  pending: "#F59E0B", approved: "#22C55E", rejected: "#EF4444", review: "#00B3FF",
};
const loanBadge: Record<string, "warning" | "success" | "error" | "info"> = {
  pending: "warning", approved: "success", rejected: "error", review: "info",
};
const kycDot: Record<string, string> = {
  verified: "#22C55E", pending: "#F59E0B", unverified: "#94A3B8",
};
const kycBadge: Record<string, "success" | "warning" | "neutral"> = {
  verified: "success", pending: "warning", unverified: "neutral",
};

// ─── Group header ─────────────────────────────────────────────────────────────

function GroupHeader({
  label, count, open, onToggle, href,
}: {
  label: string; count: number; open: boolean; onToggle: () => void; href?: string;
}) {
  return (
    <div
      className="flex items-center justify-between px-6 h-9 hover:bg-[#F8FAFC] cursor-pointer select-none"
      onClick={onToggle}
    >
      <div className="flex items-center gap-2">
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          size={12}
          color="#94A3B8"
          strokeWidth={2}
          className={["transition-transform duration-150", open ? "" : "-rotate-90"].join(" ")}
        />
        <span className="text-[13px] font-medium text-[#0F172A]">{label}</span>
        <span className="text-[12px] text-[#94A3B8]">{count}</span>
      </div>
      {href && (
        <Link
          href={href}
          onClick={(e) => e.stopPropagation()}
          className="text-[12px] text-[#94A3B8] hover:text-[#00B3FF] transition-colors"
        >
          View all
        </Link>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [open, setOpen] = useState({ attention: true, loans: true, customers: true });
  const toggle = (k: keyof typeof open) => setOpen((s) => ({ ...s, [k]: !s[k] }));

  return (
    <PageShell title="Dashboard">
      {/* Bleed to fill PageShell's px-6 py-6 padding */}
      <div className="bg-white -mx-6 -my-6 min-h-full flex flex-col">

        {/* ── Tab bar ── */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 flex-shrink-0">
          <div className="flex items-center">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={[
                  "mr-5 py-3 text-[13px] border-b-2 transition-colors duration-150",
                  activeTab === t
                    ? "border-[#0F172A] text-[#0F172A] font-medium"
                    : "border-transparent text-[#64748B] hover:text-[#0F172A]",
                ].join(" ")}
              >
                {t}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 text-[12px] text-[#64748B] hover:text-[#0F172A] px-2 py-1.5 rounded-md hover:bg-[#F8FAFC] transition-colors">
            <HugeiconsIcon icon={FilterIcon} size={13} color="currentColor" strokeWidth={1.5} />
            Filter
          </button>
        </div>

        {/* ── Stats strip ── */}
        <div className="flex items-stretch border-b border-[#E2E8F0] flex-shrink-0">
          {stats.map((s, i) => (
            <div key={i} className="flex-1 px-5 py-4 border-r border-[#E2E8F0] last:border-r-0">
              <p className="text-[11px] font-medium text-[#94A3B8] uppercase tracking-[0.06em] mb-1.5">{s.label}</p>
              <p className="font-[SN_Pro] text-[20px] font-semibold text-[#0F172A] leading-none">{s.value}</p>
              <div className="flex items-center gap-1 mt-1.5">
                <HugeiconsIcon
                  icon={s.up ? ArrowUpRight01Icon : ArrowDownLeft01Icon}
                  size={11}
                  color={s.up ? "#22C55E" : "#EF4444"}
                  strokeWidth={1.5}
                />
                <span className={["text-[11px] font-medium", s.up ? "text-[#22C55E]" : "text-[#EF4444]"].join(" ")}>
                  {s.delta}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Groups ── */}
        <div className="flex-1 py-2">

          {/* Requires Attention */}
          <GroupHeader
            label="Requires Attention"
            count={attention.length}
            open={open.attention}
            onToggle={() => toggle("attention")}
          />
          {open.attention && attention.map((item) => (
            <div
              key={item.id}
              className="flex items-center px-6 h-10 hover:bg-[#F8FAFC] cursor-pointer border-b border-[#F1F5F9] last:border-b-0 transition-colors"
            >
              <span className="text-[#CBD5E1] text-[11px] tracking-widest w-10 flex-shrink-0">···</span>
              <div className="w-2 h-2 rounded-full flex-shrink-0 mr-3" style={{ background: item.color }} />
              <span className="text-[13px] font-medium text-[#0F172A] w-[200px] flex-shrink-0">{item.title}</span>
              <span className="text-[12px] text-[#94A3B8] flex-1 truncate">{item.detail}</span>
              <span className="text-[12px] text-[#94A3B8] ml-6 flex-shrink-0 w-[52px] text-right">{item.date}</span>
              <span className="text-[11px] font-mono text-[#CBD5E1] ml-4 flex-shrink-0 w-[68px] text-right">{item.id}</span>
            </div>
          ))}

          <div className="h-3" />

          {/* Recent Loans */}
          <GroupHeader
            label="Recent Loan Applications"
            count={loans.length}
            open={open.loans}
            onToggle={() => toggle("loans")}
            href="/loans"
          />
          {open.loans && loans.map((loan) => (
            <div
              key={loan.id}
              className="flex items-center px-6 h-10 hover:bg-[#F8FAFC] cursor-pointer border-b border-[#F1F5F9] last:border-b-0 transition-colors"
            >
              <span className="text-[#CBD5E1] text-[11px] tracking-widest w-10 flex-shrink-0">···</span>
              <div
                className="w-2 h-2 rounded-full border-[1.5px] flex-shrink-0 mr-3"
                style={{
                  borderColor: loanDot[loan.status],
                  backgroundColor: loan.status === "approved" ? loanDot[loan.status] : "transparent",
                }}
              />
              <span className="text-[11px] font-mono text-[#94A3B8] w-[68px] flex-shrink-0">{loan.id}</span>
              <span className="text-[13px] text-[#0F172A] flex-1">{loan.customer}</span>
              <span className="text-[13px] font-medium text-[#0F172A] mr-5">{loan.amount}</span>
              <div className="mr-4 flex-shrink-0">
                <CoreBadge variant={loanBadge[loan.status]}>
                  {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                </CoreBadge>
              </div>
              <span className="text-[12px] text-[#94A3B8] w-[52px] text-right flex-shrink-0">{loan.date}</span>
            </div>
          ))}

          <div className="h-3" />

          {/* New Customers */}
          <GroupHeader
            label="New Customers"
            count={customers.length}
            open={open.customers}
            onToggle={() => toggle("customers")}
            href="/customers"
          />
          {open.customers && customers.map((c) => (
            <div
              key={c.id}
              className="flex items-center px-6 h-10 hover:bg-[#F8FAFC] cursor-pointer border-b border-[#F1F5F9] last:border-b-0 transition-colors"
            >
              <span className="text-[#CBD5E1] text-[11px] tracking-widest w-10 flex-shrink-0">···</span>
              <div className="w-2 h-2 rounded-full flex-shrink-0 mr-3" style={{ background: kycDot[c.kyc] }} />
              <span className="text-[11px] font-mono text-[#94A3B8] w-[80px] flex-shrink-0">{c.id}</span>
              <span className="text-[13px] text-[#0F172A] w-[180px] flex-shrink-0">{c.name}</span>
              <span className="text-[12px] text-[#94A3B8] flex-1">{c.email}</span>
              <div className="mr-4 flex-shrink-0">
                <CoreBadge variant={kycBadge[c.kyc]}>
                  {c.kyc.charAt(0).toUpperCase() + c.kyc.slice(1)}
                </CoreBadge>
              </div>
              <span className="text-[12px] text-[#94A3B8] w-[52px] text-right flex-shrink-0">{c.date}</span>
            </div>
          ))}

        </div>
      </div>
    </PageShell>
  );
}

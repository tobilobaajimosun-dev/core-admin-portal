"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons-pro/core-stroke-rounded";
import PageShell from "@/components/layout/PageShell";

// ─── Data ─────────────────────────────────────────────────────────────────────

const stats = [
  { label: "Total Users",   value: "24,531", delta: "+12%",  up: true  },
  { label: "Active Loans",  value: "8,921",  delta: "+18%",  up: true  },
  { label: "Disbursed MTD", value: "₦7.3B",  delta: "+31%",  up: true  },
  { label: "Default Rate",  value: "4.2%",   delta: "−0.8%", up: true  },
  { label: "VAS Success",   value: "96.4%",  delta: "+1.2%", up: true  },
  { label: "New Users MTD", value: "632",    delta: "+24%",  up: true  },
];

const attention = [
  {
    id: "LN-8820",
    color: "#EF4444",
    dotBg: "bg-[#FEF2F2]",
    title: "Loan overdue",
    detail: "Biodun Adeyemi · ₦3,500 · 3 days overdue",
    date: "May 8",
  },
  {
    id: "USR-3041",
    color: "#F59E0B",
    dotBg: "bg-[#FFFBEB]",
    title: "KYC pending review",
    detail: "Grace Eze · Submitted 2 days ago",
    date: "May 6",
  },
  {
    id: "VAS-8813",
    color: "#EF4444",
    dotBg: "bg-[#FEF2F2]",
    title: "Failed VAS transaction",
    detail: "Ifunanya Okonkwo · ₦500 · 9mobile Airtime",
    date: "May 5",
  },
];

const loans = [
  { id: "LN-8821", customer: "Amaka Obi",       amount: "₦150,000", status: "pending",  date: "May 8" },
  { id: "LN-8819", customer: "Chidi Nwosu",      amount: "₦200,000", status: "approved", date: "May 7" },
  { id: "LN-8818", customer: "Dupe Afolabi",     amount: "₦80,000",  status: "approved", date: "May 7" },
  { id: "LN-8817", customer: "Emmanuel Okafor",  amount: "₦50,000",  status: "pending",  date: "May 7" },
  { id: "LN-8816", customer: "Fatima Aliyu",     amount: "₦120,000", status: "review",   date: "May 6" },
  { id: "LN-8815", customer: "Grace Eze",        amount: "₦300,000", status: "approved", date: "May 5" },
  { id: "LN-8814", customer: "Henry Babatunde",  amount: "₦75,000",  status: "rejected", date: "May 5" },
  { id: "LN-8813", customer: "Ifunanya Okonkwo", amount: "₦250,000", status: "pending",  date: "May 4" },
];

const customers = [
  { id: "USR-3041", name: "Amaka Obi",       email: "amaka.obi@gmail.com",    kyc: "verified",   date: "May 8" },
  { id: "USR-3040", name: "Biodun Adeyemi",  email: "biodun@gmail.com",        kyc: "pending",    date: "May 7" },
  { id: "USR-3039", name: "Chidi Nwosu",     email: "chidi.nwosu@gmail.com",   kyc: "verified",   date: "May 7" },
  { id: "USR-3038", name: "Dupe Afolabi",    email: "dupe.afolabi@gmail.com",  kyc: "unverified", date: "May 6" },
  { id: "USR-3037", name: "Emmanuel Okafor", email: "emma.okafor@gmail.com",   kyc: "verified",   date: "May 6" },
];

// ─── Status pills ─────────────────────────────────────────────────────────────

const loanPill: Record<string, string> = {
  pending:  "bg-[#FFF3C4] text-[#92400E]",
  approved: "bg-[#D1FAE5] text-[#065F46]",
  rejected: "bg-[#FEE2E2] text-[#991B1B]",
  review:   "bg-[#DBEAFE] text-[#1E40AF]",
};
const kycPill: Record<string, string> = {
  verified:   "bg-[#D1FAE5] text-[#065F46]",
  pending:    "bg-[#FFF3C4] text-[#92400E]",
  unverified: "bg-[#F1F5F9] text-[#64748B]",
};

function Pill({ label, cls }: { label: string; cls: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${cls}`}>
      {label}
    </span>
  );
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <PageShell>
      <div className="-mx-8 -my-7 min-h-full flex flex-col bg-[#F6F9FC]">

        {/* ── Header ── */}
        <div className="bg-white border-b border-[#E2E8F0] px-8 py-5 flex-shrink-0">
          <h1 className="font-[SN_Pro] text-[20px] font-semibold text-[#0F172A] tracking-[-0.3px]">
            Overview
          </h1>
          <p className="text-[13px] text-[#94A3B8] mt-0.5">{dateStr}</p>
        </div>

        {/* ── Stats ── */}
        <div className="px-8 py-6 flex-shrink-0">
          <div className="grid grid-cols-6 gap-4">
            {stats.map((s, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-[#E2E8F0] px-4 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
              >
                <p className="text-[11px] font-medium text-[#94A3B8] uppercase tracking-[0.08em] mb-3">
                  {s.label}
                </p>
                <p className="font-[SN_Pro] text-[22px] font-semibold text-[#0F172A] leading-none mb-1.5">
                  {s.value}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[12px] font-semibold ${s.up ? "text-[#16A34A]" : "text-[#DC2626]"}`}>
                    {s.delta}
                  </span>
                  <span className="text-[11px] text-[#94A3B8]">vs last mo</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Two-column ── */}
        <div className="px-8 pb-5 grid grid-cols-[1fr_320px] gap-5 flex-shrink-0">

          {/* Recent Loans */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#E2E8F0] flex items-center justify-between">
              <div>
                <h2 className="text-[14px] font-semibold text-[#0F172A]">
                  Recent Loan Applications
                </h2>
                <p className="text-[12px] text-[#94A3B8] mt-0.5">
                  {loans.length} applications this week
                </p>
              </div>
              <Link
                href="/loans"
                className="flex items-center gap-1 text-[12px] font-medium text-[#00B3FF] hover:text-[#009FE6] transition-colors"
              >
                View all
                <HugeiconsIcon icon={ArrowRight01Icon} size={12} color="currentColor" strokeWidth={2} />
              </Link>
            </div>

            {/* Table head */}
            <div className="grid grid-cols-[1fr_110px_92px_56px] px-5 py-2 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              {["Customer", "Amount", "Status", "Date"].map((col) => (
                <span
                  key={col}
                  className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-[0.06em]"
                >
                  {col}
                </span>
              ))}
            </div>

            {/* Rows */}
            {loans.map((loan) => (
              <div
                key={loan.id}
                className="grid grid-cols-[1fr_110px_92px_56px] px-5 items-center h-11 border-b border-[#F1F5F9] last:border-b-0 hover:bg-[#F8FAFC] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-[#E8EEF2] flex items-center justify-center text-[10px] font-bold text-[#475569] flex-shrink-0">
                    {initials(loan.customer)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-[#0F172A] truncate leading-none">
                      {loan.customer}
                    </p>
                    <p className="text-[10px] font-mono text-[#C1C9D2] mt-0.5">{loan.id}</p>
                  </div>
                </div>
                <span className="text-[13px] font-semibold text-[#0F172A] tabular-nums">
                  {loan.amount}
                </span>
                <Pill
                  label={loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                  cls={loanPill[loan.status]}
                />
                <span className="text-[12px] text-[#94A3B8]">{loan.date}</span>
              </div>
            ))}
          </div>

          {/* Needs Attention */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#E2E8F0] flex items-center justify-between">
              <h2 className="text-[14px] font-semibold text-[#0F172A]">Needs Attention</h2>
              <span className="w-5 h-5 rounded-full bg-[#EF4444] text-white text-[10px] font-bold flex items-center justify-center">
                {attention.length}
              </span>
            </div>
            {attention.map((item) => (
              <div
                key={item.id}
                className="px-5 py-4 border-b border-[#F1F5F9] last:border-b-0 hover:bg-[#F8FAFC] cursor-pointer transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0 mt-[5px]"
                    style={{ background: item.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#0F172A] leading-none mb-1">
                      {item.title}
                    </p>
                    <p className="text-[12px] text-[#64748B] leading-relaxed">
                      {item.detail}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2.5 pl-5">
                  <span className="text-[10px] font-mono text-[#CBD5E1]">{item.id}</span>
                  <span className="text-[11px] text-[#94A3B8]">{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── New Customers ── */}
        <div className="px-8 pb-8 flex-shrink-0">
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#E2E8F0] flex items-center justify-between">
              <div>
                <h2 className="text-[14px] font-semibold text-[#0F172A]">New Customers</h2>
                <p className="text-[12px] text-[#94A3B8] mt-0.5">
                  {customers.length} registered recently
                </p>
              </div>
              <Link
                href="/customers"
                className="flex items-center gap-1 text-[12px] font-medium text-[#00B3FF] hover:text-[#009FE6] transition-colors"
              >
                View all
                <HugeiconsIcon icon={ArrowRight01Icon} size={12} color="currentColor" strokeWidth={2} />
              </Link>
            </div>

            {/* Table head */}
            <div className="grid grid-cols-[1fr_220px_92px_60px] px-5 py-2 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              {["Customer", "Email", "KYC", "Joined"].map((col) => (
                <span
                  key={col}
                  className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-[0.06em]"
                >
                  {col}
                </span>
              ))}
            </div>

            {/* Rows */}
            {customers.map((c) => (
              <div
                key={c.id}
                className="grid grid-cols-[1fr_220px_92px_60px] px-5 items-center h-11 border-b border-[#F1F5F9] last:border-b-0 hover:bg-[#F8FAFC] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-[#E8EEF2] flex items-center justify-center text-[10px] font-bold text-[#475569] flex-shrink-0">
                    {initials(c.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-[#0F172A] truncate leading-none">
                      {c.name}
                    </p>
                    <p className="text-[10px] font-mono text-[#C1C9D2] mt-0.5">{c.id}</p>
                  </div>
                </div>
                <span className="text-[13px] text-[#64748B] truncate pr-6">{c.email}</span>
                <Pill
                  label={c.kyc.charAt(0).toUpperCase() + c.kyc.slice(1)}
                  cls={kycPill[c.kyc]}
                />
                <span className="text-[12px] text-[#94A3B8]">{c.date}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </PageShell>
  );
}

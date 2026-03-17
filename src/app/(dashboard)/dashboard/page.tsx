"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserMultiple02Icon,
  UserCheck01Icon,
  Activity01Icon,
  UserAdd01Icon,
  Money02Icon,
  Wallet02Icon,
  BankIcon,
  ReceiptTextIcon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  ArrowTurnBackwardIcon,
  DocumentValidationIcon,
  HourglassIcon,
  UserIcon,
} from "@hugeicons-pro/core-stroke-rounded";
import PageShell from "@/components/layout/PageShell";
import MetricCard from "@/components/ui/MetricCard";
import FinanceSummaryCard from "@/components/ui/FinanceSummaryCard";
import { CoreButton } from "@/components/ui/CoreButton";

const periods = [
  { id: "today", label: "Today" },
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
] as const;

type Period = (typeof periods)[number]["id"];

const chartData = [
  { month: "Oct", disbursed: 820, repaid: 650 },
  { month: "Nov", disbursed: 950, repaid: 720 },
  { month: "Dec", disbursed: 880, repaid: 800 },
  { month: "Jan", disbursed: 1100, repaid: 900 },
  { month: "Feb", disbursed: 1250, repaid: 980 },
  { month: "Mar", disbursed: 1400, repaid: 1100 },
];

const SectionLabel = ({ children }: { children: string }) => (
  <p className="text-[11px] font-medium text-[#94A3B8] uppercase tracking-[0.08em] mb-3">
    {children}
  </p>
);

export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>("today");

  return (
    <PageShell title="Dashboard">
      {/* Period tabs */}
      <div className="flex items-center justify-between mb-6">
        <div className="inline-flex bg-white border border-[#E2E8F0] rounded-full p-1 gap-1">
          {periods.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={[
                "px-4 py-1.5 rounded-full text-[13px] font-medium transition-all duration-150",
                period === p.id
                  ? "bg-[#00B3FF] text-white"
                  : "text-[#475569] hover:text-[#0F172A]",
              ].join(" ")}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── USERS ── */}
      <SectionLabel>Users</SectionLabel>
      <div className="grid grid-cols-4 gap-4 mb-3">
        <MetricCard
          label="Total Users"
          value="24,531"
          icon={UserMultiple02Icon}
          tag="All time"
          delta="+12%"
          deltaLabel="vs last month"
          deltaType="up"
        />
        <MetricCard
          label="Verified Users"
          value="18,204"
          icon={UserCheck01Icon}
          delta="+8%"
          deltaLabel="vs last month"
          deltaType="up"
        />
        <MetricCard
          label="Active Today"
          value="1,847"
          icon={Activity01Icon}
          delta="-3%"
          deltaLabel="vs yesterday"
          deltaType="down"
        />
        <MetricCard
          label="New This Month"
          value="632"
          icon={UserAdd01Icon}
          delta="+24%"
          deltaLabel="vs last month"
          deltaType="up"
        />
      </div>

      {/* ── LOANS ── */}
      <div className="mt-6">
        <SectionLabel>Loans</SectionLabel>
        <div className="grid grid-cols-4 gap-4 mb-3">
          <MetricCard
            label="Total Applications"
            value="8,921"
            icon={DocumentValidationIcon}
            delta="+18%"
            deltaLabel="vs last month"
            deltaType="up"
          />
          <MetricCard
            label="Amount Disbursed"
            value="₦7.3B"
            icon={Money02Icon}
            delta="+31%"
            deltaLabel="vs last month"
            deltaType="up"
          />
          <MetricCard
            label="Default Rate"
            value="4.2%"
            icon={AlertCircleIcon}
            delta="-0.8%"
            deltaLabel="improving"
            deltaType="up"
          />
          <MetricCard
            label="Recovery Rate"
            value="78%"
            icon={ArrowTurnBackwardIcon}
            delta="+5%"
            deltaLabel="vs last month"
            deltaType="up"
          />
        </div>
      </div>

      {/* ── WALLET & VAS ── */}
      <div className="mt-6">
        <SectionLabel>Wallet &amp; VAS</SectionLabel>
        <div className="grid grid-cols-4 gap-4 mb-8">
          <MetricCard
            label="Total Wallets"
            value="21,403"
            icon={Wallet02Icon}
            delta="+9%"
            deltaLabel="vs last month"
            deltaType="up"
          />
          <MetricCard
            label="Total Balance"
            value="₦2.1B"
            icon={BankIcon}
            delta="+14%"
            deltaLabel="vs last month"
            deltaType="up"
          />
          <MetricCard
            label="VAS Transactions"
            value="45,231"
            icon={ReceiptTextIcon}
            delta="+22%"
            deltaLabel="vs last month"
            deltaType="up"
          />
          <MetricCard
            label="Success Rate"
            value="96.4%"
            icon={CheckmarkCircle02Icon}
            delta="+1.2%"
            deltaLabel="vs last month"
            deltaType="up"
          />
        </div>
      </div>

      {/* ── TRENDS ── */}
      <SectionLabel>Trends</SectionLabel>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {/* Area chart */}
        <div className="col-span-2 bg-white rounded-2xl border border-[#E2E8F0] p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-[SN_Pro] text-[15px] font-semibold text-[#0F172A]">
              Loan Disbursement vs Repayment
            </h3>
            <span className="text-[11px] font-medium text-[#94A3B8] bg-[#F2F7F9] px-2 py-0.5 rounded-full">
              Last 6 months
            </span>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={chartData}
              margin={{ top: 4, right: 4, left: -32, bottom: 0 }}
            >
              <defs>
                <linearGradient id="disbGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00B3FF" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#00B3FF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="repayGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#F2F7F9"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#94A3B8" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #E2E8F0",
                  borderRadius: 12,
                  fontSize: 13,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                }}
                formatter={(value) => [`₦${value}M`]}
              />
              <Area
                type="monotone"
                dataKey="disbursed"
                name="Disbursed"
                stroke="#00B3FF"
                strokeWidth={2}
                fill="url(#disbGrad)"
                dot={false}
                activeDot={{ r: 4, fill: "#00B3FF" }}
              />
              <Area
                type="monotone"
                dataKey="repaid"
                name="Repaid"
                stroke="#22C55E"
                strokeWidth={2}
                fill="url(#repayGrad)"
                dot={false}
                activeDot={{ r: 4, fill: "#22C55E" }}
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="flex items-center gap-5 mt-3 justify-center">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#00B3FF]" />
              <span className="text-[12px] text-[#475569]">Disbursed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#22C55E]" />
              <span className="text-[12px] text-[#475569]">Repaid</span>
            </div>
          </div>
        </div>

        {/* Finance Summary */}
        <div className="col-span-1">
          <FinanceSummaryCard
            title="Today's Activity"
            subtitle="Live snapshot"
            items={[
              {
                label: "Amount Disbursed",
                value: "₦24,500,000.00",
                delta: "+₦3.2M vs yesterday",
                deltaType: "up",
                icon: Money02Icon,
                iconBg: "rgba(0,179,255,0.08)",
                iconColor: "#00B3FF",
              },
              {
                label: "Repayments Received",
                value: "₦18,750,000.00",
                delta: "+₦1.8M vs yesterday",
                deltaType: "up",
                icon: ArrowTurnBackwardIcon,
                iconBg: "rgba(34,197,94,0.08)",
                iconColor: "#22C55E",
              },
              {
                label: "Bills Paid (VAS)",
                value: "₦4,320,000.00",
                delta: "+234 transactions",
                deltaType: "up",
                icon: ReceiptTextIcon,
                iconBg: "rgba(245,158,11,0.08)",
                iconColor: "#F59E0B",
              },
            ]}
          />
        </div>
      </div>

      {/* ── REQUIRES ATTENTION ── */}
      <SectionLabel>Requires Attention</SectionLabel>
      <div className="grid grid-cols-3 gap-4">
        {/* Pending Approvals */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(245,158,11,0.08)" }}
              >
                <HugeiconsIcon
                  icon={HourglassIcon}
                  size={16}
                  color="#F59E0B"
                  strokeWidth={1.5}
                />
              </div>
              <span className="text-[13px] font-medium text-[#475569]">
                Pending Approvals
              </span>
            </div>
            <span className="text-[11px] font-semibold text-[#B45309] bg-[#FFFBEB] px-2 py-0.5 rounded-full">
              47
            </span>
          </div>
          <div className="h-px bg-[#E2E8F0]" />
          <div className="px-5 py-4">
            <p className="text-[13px] text-[#475569]">
              Loan applications awaiting review
            </p>
            <CoreButton variant="outline" size="sm" className="mt-3 w-full">
              Review applications
            </CoreButton>
          </div>
        </div>

        {/* Failed Transactions */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(239,68,68,0.08)" }}
              >
                <HugeiconsIcon
                  icon={AlertCircleIcon}
                  size={16}
                  color="#EF4444"
                  strokeWidth={1.5}
                />
              </div>
              <span className="text-[13px] font-medium text-[#475569]">
                Failed Today
              </span>
            </div>
            <span className="text-[11px] font-semibold text-[#DC2626] bg-[#FEF2F2] px-2 py-0.5 rounded-full">
              12
            </span>
          </div>
          <div className="h-px bg-[#E2E8F0]" />
          <div className="px-5 py-4">
            <p className="text-[13px] text-[#475569]">
              VAS transactions failed in the last 24 hours
            </p>
            <CoreButton variant="outline" size="sm" className="mt-3 w-full">
              Investigate
            </CoreButton>
          </div>
        </div>

        {/* Dormant Users */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "#F1F5F9" }}
              >
                <HugeiconsIcon
                  icon={UserIcon}
                  size={16}
                  color="#475569"
                  strokeWidth={1.5}
                />
              </div>
              <span className="text-[13px] font-medium text-[#475569]">
                Dormant Users
              </span>
            </div>
            <span className="text-[11px] font-semibold text-[#475569] bg-[#F1F5F9] px-2 py-0.5 rounded-full">
              3,241
            </span>
          </div>
          <div className="h-px bg-[#E2E8F0]" />
          <div className="px-5 py-4">
            <p className="text-[13px] text-[#475569]">
              Users inactive for 30+ days
            </p>
            <CoreButton variant="outline" size="sm" className="mt-3 w-full">
              View list
            </CoreButton>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

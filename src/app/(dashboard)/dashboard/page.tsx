"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserMultiple02Icon,
  UserCheck01Icon,
  Activity01Icon,
  UserAdd01Icon,
  Money02Icon,
  Wallet02Icon,
  ReceiptTextIcon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  ArrowTurnBackwardIcon,
  DocumentValidationIcon,
  BankIcon,
} from "@hugeicons-pro/core-stroke-rounded";
import PageShell from "@/components/layout/PageShell";
import MetricCard from "@/components/ui/MetricCard";
import { CoreButton } from "@/components/ui/CoreButton";

const timeframes = ["Today", "This Week", "This Month"] as const;

const loanChartData = [
  { month: "Oct", Disbursement: 820, Repayment: 650 },
  { month: "Nov", Disbursement: 950, Repayment: 720 },
  { month: "Dec", Disbursement: 880, Repayment: 800 },
  { month: "Jan", Disbursement: 1100, Repayment: 900 },
  { month: "Feb", Disbursement: 1250, Repayment: 980 },
  { month: "Mar", Disbursement: 1400, Repayment: 1100 },
];

const growthChartData = [
  { month: "Oct", Users: 3200 },
  { month: "Nov", Users: 3800 },
  { month: "Dec", Users: 4100 },
  { month: "Jan", Users: 4800 },
  { month: "Feb", Users: 5200 },
  { month: "Mar", Users: 6100 },
];

const sectionLabel = "text-[11px] font-medium text-[#94A3B8] uppercase tracking-[0.08em] mb-3";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<(typeof timeframes)[number]>("This Month");

  return (
    <PageShell title="Dashboard">
      {/* Overview header + timeframe tabs */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-[SN_Pro] text-[16px] font-semibold text-[#0F172A]">
          Overview
        </h2>
        <div className="inline-flex bg-white rounded-full p-1 border border-[#E2E8F0] gap-1">
          {timeframes.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={[
                "px-4 py-1.5 rounded-full text-[13px] font-medium transition-all duration-150",
                activeTab === tab
                  ? "bg-[#00B3FF] text-white"
                  : "text-[#475569] hover:text-[#0F172A]",
              ].join(" ")}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* USER METRICS */}
      <p className={sectionLabel}>Users</p>
      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Total Users"
          value="24,531"
          icon={UserMultiple02Icon}
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

      {/* LOAN METRICS */}
      <p className={sectionLabel}>Loans</p>
      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Total Applications"
          value="8,921"
          icon={DocumentValidationIcon}
          delta="+18%"
          deltaLabel="vs last month"
          deltaType="up"
        />
        <MetricCard
          label="Disbursed Amount"
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
          deltaLabel="vs last month"
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

      {/* WALLET + VAS METRICS */}
      <p className={sectionLabel}>Wallet & VAS</p>
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
          label="Wallet Balance"
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

      {/* CHARTS ROW */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {/* Loan Disbursement vs Repayment */}
        <div className="col-span-2 bg-white rounded-2xl p-5 border border-[#E2E8F0]">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-[SN_Pro] text-[15px] font-semibold text-[#0F172A]">
              Loan Disbursement vs Repayment
            </h3>
            <span className="bg-[#F2F7F9] text-[12px] text-[#475569] px-3 py-1 rounded-full">
              Last 6 months
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={loanChartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="disbGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00B3FF" stopOpacity={0.08} />
                  <stop offset="95%" stopColor="#00B3FF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="repayGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.08} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#94A3B8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#94A3B8" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}M`}
              />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #E2E8F0",
                  borderRadius: 12,
                  fontSize: 13,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                }}
                formatter={(value) => [`₦${value}M`, undefined]}
              />
              <Area
                type="monotone"
                dataKey="Disbursement"
                stroke="#00B3FF"
                strokeWidth={2}
                fill="url(#disbGrad)"
                dot={false}
                activeDot={{ r: 4, fill: "#00B3FF" }}
              />
              <Area
                type="monotone"
                dataKey="Repayment"
                stroke="#22C55E"
                strokeWidth={2}
                fill="url(#repayGrad)"
                dot={false}
                activeDot={{ r: 4, fill: "#22C55E" }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, color: "#475569", paddingTop: 16 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Customer Growth */}
        <div className="col-span-1 bg-white rounded-2xl p-5 border border-[#E2E8F0]">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-[SN_Pro] text-[15px] font-semibold text-[#0F172A]">
              Customer Growth
            </h3>
            <span className="bg-[#F2F7F9] text-[12px] text-[#475569] px-3 py-1 rounded-full">
              Last 6 months
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={growthChartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#94A3B8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#94A3B8" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #E2E8F0",
                  borderRadius: 12,
                  fontSize: 13,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                }}
                formatter={(value) => [Number(value).toLocaleString(), "Users"]}
              />
              <Bar
                dataKey="Users"
                fill="rgba(0,179,255,0.5)"
                radius={[6, 6, 0, 0]}
                activeBar={{ fill: "#00B3FF" }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* QUICK STATS ROW */}
      <div className="grid grid-cols-3 gap-4">
        {/* Pending Approvals */}
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0]">
          <p className="text-[11px] font-medium text-[#94A3B8] uppercase tracking-[0.08em] mb-3">
            Pending Approvals
          </p>
          <p className="font-[SN_Pro] text-[32px] font-semibold text-[#0F172A] leading-none">
            47
          </p>
          <p className="text-[13px] text-[#475569] mt-2">
            Loan applications awaiting review
          </p>
          <div className="mt-4">
            <CoreButton variant="outline" size="sm">
              Review now
            </CoreButton>
          </div>
        </div>

        {/* Failed Transactions */}
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0]">
          <p className="text-[11px] font-medium text-[#94A3B8] uppercase tracking-[0.08em] mb-3">
            Failed Transactions (Today)
          </p>
          <p className="font-[SN_Pro] text-[32px] font-semibold text-[#EF4444] leading-none">
            12
          </p>
          <p className="text-[13px] text-[#475569] mt-2">
            VAS transactions failed today
          </p>
          <div className="mt-4">
            <CoreButton variant="outline" size="sm">
              Investigate
            </CoreButton>
          </div>
        </div>

        {/* Dormant Users */}
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0]">
          <p className="text-[11px] font-medium text-[#94A3B8] uppercase tracking-[0.08em] mb-3">
            Dormant Users
          </p>
          <p className="font-[SN_Pro] text-[32px] font-semibold text-[#0F172A] leading-none">
            3,241
          </p>
          <p className="text-[13px] text-[#475569] mt-2">
            Users inactive for 30+ days
          </p>
          <div className="mt-4">
            <CoreButton variant="outline" size="sm">
              View list
            </CoreButton>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

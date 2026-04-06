// ...existing code...
// Map statsData to statMeta for rendering stats grid
// (MUST be after all imports and inside the Dashboard component)
import { useNavigate } from "react-router-dom";
import {
  Users,
  TrendingUp,
  GraduationCap,
  FileText,
  Award,
  DollarSign,
  Clock,
  ArrowRight,
  AlertCircle,
  Plus,
  Calendar,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useState, useEffect } from "react";
import {
  getDashboardStats,
  getFunnelData,
  getMonthlyTrend,
  checkBackendHealth,
} from "../services/dashboardService";
import UpcomingFollowups from "../components/UpcomingFollowups";
import "../style.css";

const statMeta = [
  {
    label: "Total Inquiries",
    key: "totalInquiries",
    icon: Users,
    color: "var(--blue-bg)",
    ic: "var(--blue)",
  },
  {
    label: "Conversion Rate",
    key: "conversionRate",
    icon: TrendingUp,
    color: "var(--green-bg)",
    ic: "var(--green)",
    format: (v) => `${v}%`,
  },
  {
    label: "Active Leads",
    key: "activeLeads",
    icon: Users,
    color: "var(--purple-bg)",
    ic: "var(--purple)",
  },
  {
    label: "Enrolled Students",
    key: "enrolledStudents",
    icon: GraduationCap,
    color: "var(--green-bg)",
    ic: "var(--green)",
  },
  {
    label: "Pending Applications",
    key: "pendingApplications",
    icon: FileText,
    color: "var(--red-bg)",
    ic: "var(--red)",
  },
  {
    label: "Offers Sent",
    key: "offersSent",
    icon: Award,
    color: "var(--yellow-bg)",
    ic: "var(--yellow)",
  },
  {
    label: "Fees Collected",
    key: "feesCollected",
    icon: DollarSign,
    color: "var(--green-bg)",
    ic: "var(--green)",
    format: (v) => `₹${Number(v).toLocaleString()}`,
  },
];

const gradeData = [
  { label: "Grade 1", value: 45, color: "#22c55e" },
  { label: "Grade 2", value: 38, color: "#3b82f6" },
  { label: "Grade 3", value: 42, color: "#8b5cf6" },
  { label: "Grade 4", value: 35, color: "#ec4899" },
  { label: "Grade 5", value: 40, color: "#f59e0b" },
  { label: "Grade 6", value: 34, color: "#14b8a6" },
];

const Tip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="card"
        style={{
          padding: "8px 12px",
          border: "1px solid var(--gray-200)",
          boxShadow: "var(--sh)",
        }}
      >
        <p style={{ margin: 0, fontWeight: 700, fontSize: 13 }}>
          {label || payload[0].name}
        </p>
        {payload.map((entry, index) => (
          <p
            key={index}
            style={{ margin: 0, fontSize: 12, color: entry.color }}
          >
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};
export function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [statsData, setStatsData] = useState(null);
  const [statsError, setStatsError] = useState(null);
  const [funnelData, setFunnelData] = useState([]);
  const [funnelError, setFunnelError] = useState(null);
  const [monthlyTrendData, setMonthlyTrendData] = useState([]);
  const [trendError, setTrendError] = useState(null);

  const stats = statMeta.map((m) => ({
    ...m,
    value: statsData
      ? m.format
        ? m.format(statsData[m.key] || 0)
        : (statsData[m.key] || 0).toLocaleString()
      : m.format
        ? m.format(0)
        : "0",
    change: statsData ? statsData[`${m.key}Change`] || "+0%" : "+0%",
    pos: statsData
      ? (statsData[`${m.key}Change`]?.startsWith("+") ?? true)
      : true,
  }));

  // Fetch funnel data from backend (must be inside component)
  // Fetch funnel data from backend
  const fetchFunnelData = async (signal) => {
    try {
      const data = await getFunnelData(signal);
      if (signal?.aborted) return;
      console.log("📥 [Dashboard Frontend] Received funnel data:", data);
      const total = data.inquiry || 1;
      const funnelArr = [
        { stage: "Inquiry", count: data.inquiry, pct: "100%" },
        {
          stage: "Contacted",
          count: data.contacted,
          pct: Math.round((data.contacted / total) * 100) + "%",
        },
        {
          stage: "Interested",
          count: data.interested,
          pct: Math.round((data.interested / total) * 100) + "%",
        },
        {
          stage: "Visit",
          count: data.visit,
          pct: Math.round((data.visit / total) * 100) + "%",
        },
        {
          stage: "Applied",
          count: data.applied,
          pct: Math.round((data.applied / total) * 100) + "%",
        },
        {
          stage: "Enrolled",
          count: data.enrolled,
          pct: Math.round((data.enrolled / total) * 100) + "%",
        },
      ];
      console.log("📊 [Dashboard Frontend] Processed funnel array:", funnelArr);
      setFunnelData(funnelArr);
    } catch (err) {
      if (signal?.aborted) return;
      console.error("❌ [Dashboard Frontend] Funnel error:", err);
      setFunnelError(err.message || "Failed to load funnel data");
      setFunnelData([
        { stage: "Inquiry", count: 0, pct: "0%" },
        { stage: "Contacted", count: 0, pct: "0%" },
        { stage: "Interested", count: 0, pct: "0%" },
        { stage: "Visit", count: 0, pct: "0%" },
        { stage: "Applied", count: 0, pct: "0%" },
        { stage: "Enrolled", count: 0, pct: "0%" },
      ]);
    }
  };

  // Optionally, get schoolId from context/auth if needed
  // Fetch dashboard stats from backend
  const fetchDashboardStats = async (signal) => {
    setLoading(true);
    setStatsError(null);
    try {
      const data = await getDashboardStats(signal);
      if (signal?.aborted) return;
      console.log("📥 [Dashboard Frontend] Received stats data:", data);
      setStatsData(data);
    } catch (err) {
      if (signal?.aborted) return;
      console.error("❌ [Dashboard Frontend] Stats error:", err);
      setStatsError(err.message || "Failed to load stats");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  const fetchMonthlyTrend = async (signal) => {
    try {
      const resp = await getMonthlyTrend(signal);
      if (signal?.aborted) return;
      if (resp?.success && Array.isArray(resp.data)) {
        setMonthlyTrendData(resp.data);
      }
    } catch (err) {
      if (signal?.aborted) return;
      console.error("❌ [Dashboard Frontend] Trend error:", err);
      setTrendError(err.message || "Failed to load monthly trend");
      setMonthlyTrendData([]);
    }
  };

  const [backendStatus, setBackendStatus] = useState("unknown");
  const [backendError, setBackendError] = useState(null);

  // Wrapper to call backend health check from service
  const handleCheckBackendHealth = async (signal) => {
    try {
      setBackendStatus("checking");
      await checkBackendHealth(signal);
      if (signal?.aborted) return;
      setBackendStatus("connected");
      setBackendError(null);
    } catch (err) {
      if (signal?.aborted) return;
      setBackendStatus("error");
      setBackendError(err.message);
    }
  };

  // Initial data load on mount
  useEffect(() => {
    const controller = new AbortController();
    setStatsError(null);
    setFunnelError(null);
    setTrendError(null);
    fetchDashboardStats(controller.signal);
    fetchFunnelData(controller.signal);
    fetchMonthlyTrend(controller.signal);
    handleCheckBackendHealth(controller.signal);
    return () => {
      controller.abort();
    };
  }, []);

  const followUps = [
    {
      name: "Rahul Sharma",
      sub: "Class 1 Inquiry",
      time: "10:30 AM",
      av: "RS",
      avBg: "#e0f2fe",
      avC: "#0284c7",
      action: "Call",
      actionCls: "action-call",
    },
    {
      name: "Sanya Malhotra",
      sub: "Document Pending",
      time: "11:45 AM",
      av: "SM",
      avBg: "#fef2f2",
      avC: "#dc2626",
      action: "Email",
      actionCls: "action-email",
    },
    {
      name: "Kevin Peter",
      sub: "Campus Visit",
      time: "02:15 PM",
      av: "KP",
      avBg: "#f3e8ff",
      avC: "#7e22ce",
      action: "Visit",
      actionCls: "action-visit",
    },
    {
      name: "Arya Singh",
      sub: "Interview",
      time: "04:30 PM",
      av: "AS",
      avBg: "#fef9c3",
      avC: "#a16207",
      action: "Inquiry",
      actionCls: "action-interview",
    },
  ];

  const alerts = [
    {
      name: "John Doe",
      grade: "Grade 5",
      reason: "Waitlisted - No update since 5 days",
      days: "5d",
    },
    {
      name: "Sara Khan",
      grade: "Grade 2",
      reason: "Payment pending - admission stage",
      days: "3d",
    },
  ];

  const counselors = [
    { name: "Nisha Gupta", pct: 68, leads: 120, conv: 82, clr: "#14b8a6" },
    { name: "Arjun Rao", pct: 54, leads: 95, conv: 51, clr: "#3b82f6" },
    { name: "Priya Singh", pct: 42, leads: 88, conv: 37, clr: "#f59e0b" },
  ];

  return (
    <div className="page">
      {/* Loading/Error State */}
      {loading && (
        <div
          style={{
            marginBottom: 16,
            padding: 12,
            background: "#fef3c7",
            border: "1px solid #fde68a",
            borderRadius: 6,
            color: "#92400e",
          }}
        >
          Loading dashboard stats...
        </div>
      )}
      {(statsError || funnelError) && (
        <div
          style={{
            marginBottom: 16,
            padding: 12,
            background: "#fee2e2",
            border: "1px solid #fecaca",
            borderRadius: 6,
            color: "#991b1b",
          }}
        >
          {statsError && (
            <div>
              ⚠️ {statsError}
              <button
                onClick={() => fetchDashboardStats()}
                style={{
                  marginLeft: 12,
                  padding: "2px 8px",
                  fontSize: 12,
                  border: "1px solid #991b1b",
                  borderRadius: 4,
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                Retry
              </button>
            </div>
          )}
          {funnelError && (
            <div>
              ⚠️ {funnelError}
              <button
                onClick={() => fetchFunnelData()}
                style={{
                  marginLeft: 12,
                  padding: "2px 8px",
                  fontSize: 12,
                  border: "1px solid #991b1b",
                  borderRadius: 4,
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                Retry
              </button>
            </div>
          )}
          {trendError && (
            <div>
              ⚠️ {trendError}
              <button
                onClick={() => fetchMonthlyTrend()}
                style={{
                  marginLeft: 12,
                  padding: "2px 8px",
                  fontSize: 12,
                  border: "1px solid #991b1b",
                  borderRadius: 4,
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                Retry
              </button>
            </div>
          )}
        </div>
      )}
      {/* Backend Health Status Section */}
      <div style={{ marginBottom: 16 }}>
        {backendStatus === "checking" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              backgroundColor: "#fef3c7",
              border: "1px solid #fcd34d",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 500,
              color: "#92400e",
            }}
          >
            <span>⏳</span>
            <span>Checking connection...</span>
          </div>
        )}
        {backendStatus === "connected" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "4px 10px",
              fontSize: 12,
              color: "#16a34a",
              fontWeight: 500,
            }}
          >
            <span>Backend Connected</span>
            <button
              onClick={() =>
                handleCheckBackendHealth(new AbortController().signal)
              }
              style={{
                marginLeft: 8,
                padding: "2px 6px",
                fontSize: 11,
                backgroundColor: "transparent",
                border: "1px solid #16a34a",
                color: "#16a34a",
                borderRadius: 4,
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Refresh
            </button>
          </div>
        )}
        {backendStatus === "error" && backendError && (
          <div
            style={{
              marginBottom: 16,
              padding: 12,
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 6,
              fontSize: 12,
              color: "#7f1d1d",
            }}
          >
            ⚠️ {backendError}
            <button
              onClick={() =>
                handleCheckBackendHealth(new AbortController().signal)
              }
              style={{
                marginLeft: 12,
                padding: "2px 8px",
                fontSize: 11,
                border: "1px solid #991b1b",
                borderRadius: 4,
                background: "#fff",
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        )}
      </div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 className="page-title" style={{ textAlign: "left" }}>
            Admissions Dashboard
          </h1>
          <p className="page-sub" style={{ textAlign: "left" }}>
            Welcome back! Here's your admission overview
          </p>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <button
            className="btn btn-primary"
            onClick={() => navigate("/leads/add")}
          >
            <Plus size={15} /> Add Lead
          </button>
          <button
            className="btn btn-outline"
            onClick={() => navigate("/applications/create")}
          >
            <FileText size={15} /> Create Application
          </button>
          <button
            className="btn btn-outline"
            onClick={() => navigate("/counseling/schedule-visit")}
          >
            <Calendar size={15} /> Schedule Visit
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div
        className="dashboard-stats-7"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7,1fr)",
          gap: 12,
          marginBottom: 24,
        }}
      >
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div className="stat-card" key={i} style={{ padding: "14px 14px" }}>
              <div className="stat-row">
                <span className="stat-label" style={{ fontSize: 11 }}>
                  {s.label}
                </span>
                <span
                  className={`stat-badge ${s.pos ? "positive" : "negative"}`}
                >
                  {s.change}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: 6,
                }}
              >
                <span className="stat-value" style={{ fontSize: 22 }}>
                  {s.value}
                </span>
                <div
                  className="stat-icon"
                  style={{ background: s.color, width: 34, height: 34 }}
                >
                  <Icon size={16} style={{ color: s.ic }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Funnel + Follow-ups */}
      <div className="grid-2 mb-5">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Admission Funnel</div>
              <div className="card-sub">Lead conversion through each stage</div>
            </div>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={funnelData} layout="vertical" barSize={18}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f3f4f6"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="stage"
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={70}
                />
                <Tooltip content={<Tip />} />
                <Bar
                  dataKey="count"
                  name="count"
                  fill="#14b8a6"
                  radius={[0, 6, 6, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 10,
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              {funnelData.map((s, i) => (
                <div key={i} style={{ textAlign: "center", fontSize: 11 }}>
                  <div style={{ color: "var(--gray-500)" }}>{s.stage}</div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 13,
                      color: "var(--gray-800)",
                    }}
                  >
                    {s.pct}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <UpcomingFollowups
          interval={2}
          limit={10}
          onViewAll={() => navigate("/communication")}
        />
      </div>

      {/* Monthly Trend + Grade Distribution */}
      <div className="grid-2 mb-5">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Monthly Trend</div>
              <div className="card-sub">Inquiries vs enrollments over time</div>
            </div>
          </div>
          <div className="card-body">
            {monthlyTrendData.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "var(--gray-500)", fontSize: 13 }}>
                No trend data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={210}>
                <LineChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#9ca3af", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#9ca3af", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<Tip />} />
                  <Line
                    type="monotone"
                    dataKey="inquiries"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#3b82f6" }}
                    name="inquiries"
                  />
                  <Line
                    type="monotone"
                    dataKey="enrollments"
                    stroke="#14b8a6"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#14b8a6" }}
                    name="enrollments"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Grade Distribution</div>
              <div className="card-sub">Current applications by grade</div>
            </div>
          </div>
          <div
            className="card-body"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie
                  data={gradeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {gradeData.map((e, i) => (
                    <Cell key={i} fill={e.color} />
                  ))}
                </Pie>
                <Tooltip content={<Tip />} />
              </PieChart>
            </ResponsiveContainer>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 8,
                marginTop: 12,
                width: "100%",
              }}
            >
              {gradeData.map((g, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 13,
                  }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: g.color,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ color: "var(--gray-600)" }}>{g.label}</span>
                  <span style={{ fontWeight: 700, marginLeft: "auto" }}>
                    {g.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Inactivity + Counselor */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Inactivity Alerts</div>
              <div className="card-sub">
                Leads requiring immediate attention
              </div>
            </div>
          </div>
          <div className="card-body">
            {alerts.map((a, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: 14,
                  background: "#fff5f5",
                  border: "1px solid #fecaca",
                  borderRadius: "var(--r)",
                  marginBottom: i < alerts.length - 1 ? 10 : 0,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    background: "#fee2e2",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    color: "#dc2626",
                  }}
                >
                  <AlertCircle size={15} />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "var(--gray-900)",
                    }}
                  >
                    {a.name}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--gray-500)" }}>
                    {a.grade}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--gray-400)" }}>
                    {a.reason}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: "var(--r-full)",
                    background: "#fee2e2",
                    color: "#dc2626",
                    whiteSpace: "nowrap",
                  }}
                >
                  {a.days}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Counselor Performance</div>
              <div className="card-sub">Team conversion summary</div>
            </div>
          </div>
          <div className="card-body">
            {counselors.map((c, i) => (
              <div
                key={i}
                style={{ marginBottom: i < counselors.length - 1 ? 16 : 0 }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "var(--gray-900)",
                    }}
                  >
                    {c.name}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--gray-700)",
                    }}
                  >
                    {c.pct}%
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--gray-400)",
                    marginBottom: 6,
                  }}
                >
                  {c.leads} leads &nbsp;•&nbsp; {c.conv} conversions
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${c.pct}%`, background: c.clr }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Inline styles needed for follow-up action tags ───────────
const styleEl = document.createElement("style");
styleEl.textContent = `
  .stat-badge{display:inline-flex;align-items:center;padding:2px 7px;border-radius:9999px;font-size:11px;font-weight:600;}
  .stat-badge.positive{background:#dcfce7;color:#16a34a;}
  .stat-badge.negative{background:#fee2e2;color:#dc2626;}
  .action-tag{font-size:11px;font-weight:600;padding:2px 8px;border-radius:9999px;margin-left:6px;}
  .action-call{background:#dcfce7;color:#15803d;}
  .action-email{background:#dbeafe;color:#1d4ed8;}
  .action-visit{background:#f3e8ff;color:#7e22ce;}
  .action-interview{background:#fef9c3;color:#a16207;}
`;
if (!document.head.querySelector("[data-dashboard-styles]")) {
  styleEl.setAttribute("data-dashboard-styles", "");
  document.head.appendChild(styleEl);
}

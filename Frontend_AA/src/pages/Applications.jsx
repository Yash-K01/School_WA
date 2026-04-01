// ── Applications.jsx ────────────────────────────────────────
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Eye, Download } from "lucide-react";
import {
  getAdmissionStats,
  getAdmissions,
  searchAdmissions,
} from "../services/admissionService";
import "../style.css";

const statusMap = {
  submitted: { label: "Submitted", cls: "badge-blue" },
  under_review: { label: "Under Review", cls: "badge-yellow" },
  approved: { label: "Approved", cls: "badge-green" },
  rejected: { label: "Rejected", cls: "badge-red" },
  waitlisted: { label: "Waitlisted", cls: "badge-purple" },
};

export function Applications() {
  const navigate = useNavigate();

  // State management
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    under_review: 0,
    approved: 0,
    rejected: 0,
    waitlisted: 0,
  });
  const [applications, setApplications] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showDrop, setShowDrop] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchError, setSearchError] = useState(null);

  // Fetch stats and admissions on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch stats
        const statsData = await getAdmissionStats();
        setStats(statsData);

        // Fetch admissions
        const admissionsData = await getAdmissions({ limit: 100, offset: 0 });

        // Handle both array and object responses
        const appsList = Array.isArray(admissionsData)
          ? admissionsData
          : admissionsData?.applications || admissionsData?.data || [];

        setApplications(appsList);
        setFilteredApps(appsList);
      } catch (err) {
        setError(err.message || "Failed to load data");
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle search
  const handleSearch = async (value) => {
    setSearch(value);
    setSearchError(null);

    if (!value.trim()) {
      // Reset to unfiltered list
      applyFilter(applications, filter);
      return;
    }

    try {
      const results = await searchAdmissions(value);
      const searchResults = Array.isArray(results)
        ? results
        : results?.applications || [];
      applyFilter(searchResults, filter);
    } catch (err) {
      setSearchError(err.message);
      console.error("Search error:", err);
    }
  };

  // Apply status filter
  const handleStatusFilter = (status) => {
    setFilter(status);
    applyFilter(applications, status);
    setShowDrop(false);
  };

  // Helper to apply both search and status filter
  const applyFilter = (appList, statusFilter) => {
    let filtered = appList;

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((a) => a.status === statusFilter);
    }

    setFilteredApps(filtered);
  };

  // Handle view application
  const handleViewApplication = (appId) => {
    navigate(`/applications/${appId}`);
  };

  // Format submitted date
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Applications</h1>
          <p className="page-sub">Track and manage admission applications</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/applications/create")}
        >
          <Plus size={15} /> New Application
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid-5 mb-5">
        {[
          ["Total", stats.total, "var(--gray-900)"],
          ["Submitted", stats.submitted, "var(--blue)"],
          ["Under Review", stats.under_review, "var(--yellow)"],
          ["Approved", stats.approved, "var(--green)"],
          ["Waitlisted", stats.waitlisted, "var(--purple)"],
        ].map(([l, v, c], i) => (
          <div className="stat-card" key={i}>
            <div className="stat-label">{l}</div>
            <div className="stat-value" style={{ color: c }}>
              {v}
            </div>
          </div>
        ))}
      </div>

      {/* Error Messages */}
      {error && (
        <div
          style={{
            marginBottom: 16,
            padding: 12,
            backgroundColor: "#fee2e2",
            border: "1px solid #fca5a5",
            borderRadius: "var(--r)",
            color: "#dc2626",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Filters */}
      <div className="card mb-5">
        <div className="card-body" style={{ paddingTop: 14 }}>
          <div
            style={{
              fontWeight: 600,
              fontSize: 15,
              color: "var(--gray-800)",
              marginBottom: 12,
            }}
          >
            Filters
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="input-wrap flex-1" style={{ minWidth: 200 }}>
              <Search className="input-icon" size={15} />
              <input
                className="form-input"
                placeholder="Search by student name or ID..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            {/* Status Filter Dropdown */}
            <div style={{ position: "relative" }}>
              <button
                className="btn btn-outline"
                onClick={() => setShowDrop(!showDrop)}
              >
                ▽ &nbsp;
                {filter === "all" ? "All Statuses" : statusMap[filter]?.label}{" "}
                &nbsp;✓
              </button>
              {showDrop && (
                <div
                  style={{
                    position: "absolute",
                    top: "110%",
                    left: 0,
                    background: "#fff",
                    border: "1px solid var(--gray-200)",
                    borderRadius: "var(--r)",
                    boxShadow: "var(--shadow-lg)",
                    zIndex: 50,
                    minWidth: 180,
                  }}
                >
                  {[
                    ["all", "All Statuses"],
                    ["submitted", "Submitted"],
                    ["under_review", "Under Review"],
                    ["approved", "Approved"],
                    ["rejected", "Rejected"],
                    ["waitlisted", "Waitlisted"],
                  ].map(([v, l]) => (
                    <div
                      key={v}
                      style={{
                        padding: "10px 16px",
                        cursor: "pointer",
                        background: filter === v ? "var(--gray-50)" : "",
                        fontWeight: filter === v ? 600 : 400,
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                      onClick={() => handleStatusFilter(v)}
                    >
                      {l}
                      {filter === v && (
                        <span style={{ color: "var(--purple)" }}>✓</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button className="btn btn-outline">
              <Download size={14} /> Export
            </button>
          </div>

          {searchError && (
            <div style={{ marginTop: 12, fontSize: 13, color: "var(--red)" }}>
              Search error: {searchError}
            </div>
          )}
        </div>
      </div>

      {/* Applications Table */}
      <div className="card">
        {loading ? (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              color: "var(--gray-500)",
            }}
          >
            <p>Loading applications...</p>
          </div>
        ) : filteredApps.length === 0 ? (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              color: "var(--gray-500)",
            }}
          >
            <p>No applications found</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Application ID</th>
                  <th>Student Name</th>
                  <th>Grade</th>
                  <th>Parent Contact</th>
                  <th>Submitted Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.map((app) => (
                  <tr key={app.id || app.application_id}>
                    <td className="td-bold">{app.id || app.application_id}</td>
                    <td>{app.student_name || app.name || "—"}</td>
                    <td>{app.grade || "—"}</td>
                    <td>{app.parent_contact || app.contact || "—"}</td>
                    <td style={{ fontSize: 13 }}>
                      {formatDate(app.submitted_date || app.submitted)}
                    </td>
                    <td>
                      <span
                        className={`badge ${statusMap[app.status]?.cls || "badge-gray"}`}
                      >
                        {statusMap[app.status]?.label || app.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-ghost btn-icon"
                        onClick={() =>
                          handleViewApplication(app.id || app.application_id)
                        }
                        title="View application"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

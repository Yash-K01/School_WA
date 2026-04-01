/**
 * ApplicationsTable Component
 * Displays list of applications in a table format
 * Props: applications, loading, onView, statusMap
 */
import { Eye } from "lucide-react";

export function ApplicationsTable({
  applications = [],
  loading = false,
  onView,
  statusMap = {},
}) {
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

  if (loading) {
    return (
      <div className="card">
        <div
          style={{ padding: 40, textAlign: "center", color: "var(--gray-500)" }}
        >
          <p>Loading applications...</p>
        </div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="card">
        <div
          style={{ padding: 40, textAlign: "center", color: "var(--gray-500)" }}
        >
          <p>No applications found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
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
            {applications.map((app) => {
              const appId = app.id || app.application_id;
              const studentName = app.student_name || app.name || "—";
              const status = app.status || "unknown";
              const statusInfo = statusMap[status] || {
                label: status,
                cls: "badge-gray",
              };

              return (
                <tr key={appId}>
                  <td className="td-bold">{appId}</td>
                  <td>{studentName}</td>
                  <td>{app.grade || "—"}</td>
                  <td>{app.parent_contact || app.contact || "—"}</td>
                  <td style={{ fontSize: 13 }}>
                    {formatDate(app.submitted_date || app.submitted)}
                  </td>
                  <td>
                    <span className={`badge ${statusInfo.cls}`}>
                      {statusInfo.label}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-ghost btn-icon"
                      onClick={() => onView && onView(appId)}
                      title="View application"
                    >
                      <Eye size={15} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

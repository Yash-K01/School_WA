import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Plus, Mail, MessageSquare, Eye, BarChart2, X } from "lucide-react";
import {
  fetchEmailLogs,
  fetchEmailRecipients,
  fetchEmailStats,
  sendEmailMessage,
} from "../services/emailService.js";
import {
  fetchCampaigns,
  fetchSmsLogs,
  fetchWhatsappLogs,
} from "../services/communicationService.js";
import { getToken } from "../utils/authToken.js";
import "../style.css";

// Dynamic API data used instead of static mock variables

const tagColor = (t) =>
  ({
    Onboarding: "badge-blue",
    "Follow-up": "badge-orange",
    Reminder: "badge-yellow",
    Information: "badge-gray",
  })[t] || "badge-gray";

const statusColor = (s) =>
  ({
    completed: "badge-green",
    active: "badge-blue",
    scheduled: "badge-orange",
  })[s] || "badge-gray";
const msgStatusColor = (s) =>
  ({ delivered: "badge-green", read: "badge-blue", sent: "badge-teal" })[s] ||
  "badge-gray";

axios.defaults.baseURL = "http://localhost:5001";

export function Communication() {
  const [tab, setTab] = useState("email");
  const [compose, setCompose] = useState(false);
  const [campaign, setCampaign] = useState(false);

  const [emailLogs, setEmailLogs] = useState([]);
  const [emailStats, setEmailStats] = useState({
    total_emails: 0,
    opened: 0,
    clicked: 0,
    open_rate: 0,
    click_rate: 0,
  });
  const [stats, setStats] = useState({
    smsCount: 0,
    whatsappCount: 0,
    emailCount: 0,
  });
  const [templates, setTemplates] = useState([]);
  const [emailRecipients, setEmailRecipients] = useState([]);
  const [loadingEmailData, setLoadingEmailData] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [creatingTemplate, setCreatingTemplate] = useState(false);
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [sendInProgress, setSendInProgress] = useState(false);
  const [pageError, setPageError] = useState("");
  const [composeError, setComposeError] = useState("");
  const [templateError, setTemplateError] = useState("");
  const [templateModalOpen, setTemplateModalOpen] = useState(false);

  const [composeForm, setComposeForm] = useState({
    recipient_type: "lead",
    recipient_id: "",
    template_id: "",
    subject: "",
    message: "",
    recipient_search: "",
  });

  const [templateForm, setTemplateForm] = useState({
    name: "",
    category: "",
    subject: "",
    content: "",
  });

  const selectedRecipient = useMemo(
    () =>
      emailRecipients.find(
        (recipient) =>
          String(recipient.id) === String(composeForm.recipient_id),
      ),
    [emailRecipients, composeForm.recipient_id],
  );

  const formatDateTime = (value) => {
    if (!value) {
      return "-";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleString();
  };

  const loadEmailData = async () => {
    setLoadingEmailData(true);
    setPageError("");

    try {
      const [logsResponse, statsResponse] = await Promise.all([
        fetchEmailLogs({ limit: 20 }),
        fetchEmailStats(),
      ]);

      setEmailLogs(logsResponse.logs || []);
      setEmailStats(statsResponse || {});
    } catch (error) {
      setPageError(error.message || "Failed to load email data.");
      setEmailLogs([]);
    } finally {
      setLoadingEmailData(false);
    }
  };

  const [smsData, setSmsData] = useState([]);
  const [whatsappData, setWhatsappData] = useState([]);
  const [campaignData, setCampaignData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAxiosConfig = () => {
    const token = getToken();

    if (!token) {
      return {};
    }

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const fetchStats = async () => {
    setLoadingStats(true);

    try {
      const config = getAxiosConfig();
      const [smsRes, waRes, emailStatsRes] = await Promise.all([
        axios.get("/api/sms/logs", config),
        axios.get("/api/whatsapp/logs", config),
        axios.get("/api/email/stats", config),
      ]);

      const smsList = Array.isArray(smsRes?.data?.data) ? smsRes.data.data : [];
      const whatsappList = Array.isArray(waRes?.data?.data)
        ? waRes.data.data
        : [];

      setStats({
        smsCount: smsList.length,
        whatsappCount: whatsappList.length,
        emailCount: Number(emailStatsRes?.data?.data?.total_emails || 0),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchTemplates = async () => {
    setLoadingTemplates(true);
    setTemplateError("");

    try {
      const config = getAxiosConfig();
      const res = await axios.get("/api/email/templates", config);
      const list = Array.isArray(res?.data?.data) ? res.data.data : [];
      setTemplates(list);
    } catch (err) {
      console.error(err);
      setTemplateError("Failed to fetch templates.");
      setTemplates([]);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setTemplateForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const createTemplate = async () => {
    if (
      !templateForm.name.trim() ||
      !templateForm.category.trim() ||
      !templateForm.subject.trim() ||
      !templateForm.content.trim()
    ) {
      setTemplateError("All template fields are required.");
      return;
    }

    setCreatingTemplate(true);
    setTemplateError("");

    try {
      const config = getAxiosConfig();
      const res = await axios.post(
        "/api/email/templates",
        {
          name: templateForm.name.trim(),
          category: templateForm.category.trim(),
          subject: templateForm.subject.trim(),
          content: templateForm.content.trim(),
        },
        config,
      );

      if (res?.data?.success) {
        alert("Template created successfully");
        await fetchTemplates();
        await fetchStats();
        setTemplateForm({
          name: "",
          category: "",
          subject: "",
          content: "",
        });
        setTemplateModalOpen(false);
      } else {
        setTemplateError(res?.data?.message || "Error creating template.");
      }
    } catch (err) {
      console.error(err);
      setTemplateError(
        err?.response?.data?.message || "Error creating template.",
      );
      alert("Error creating template");
    } finally {
      setCreatingTemplate(false);
    }
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);

      const [smsRes, waRes, campRes] = await Promise.all([
        fetchSmsLogs({ limit: 20 }),
        fetchWhatsappLogs({ limit: 20 }),
        fetchCampaigns(),
      ]);

      setSmsData(smsRes.logs || []);
      setWhatsappData(waRes.logs || []);
      setCampaignData(campRes || []);
    } catch (err) {
      setError(err?.message || "Failed to load communication data");
    } finally {
      setLoading(false);
    }
  };

  const loadRecipients = async (type, search = "") => {
    setLoadingRecipients(true);
    setComposeError("");

    try {
      const recipients = await fetchEmailRecipients(type, search);
      setEmailRecipients(recipients || []);
    } catch (error) {
      setComposeError(error.message || "Failed to load recipients.");
      setEmailRecipients([]);
    } finally {
      setLoadingRecipients(false);
    }
  };

  const openComposeModal = async () => {
    setCompose(true);
    setComposeError("");
    await loadRecipients(
      composeForm.recipient_type,
      composeForm.recipient_search,
    );
  };

  const closeComposeModal = () => {
    setCompose(false);
    setComposeError("");
    setComposeForm({
      recipient_type: "lead",
      recipient_id: "",
      template_id: "",
      subject: "",
      message: "",
      recipient_search: "",
    });
  };

  const handleTemplateChange = (templateId) => {
    const selectedTemplate = templates.find(
      (template) => String(template.id) === String(templateId),
    );

    setComposeForm((prev) => ({
      ...prev,
      template_id: templateId,
      subject: selectedTemplate?.subject || prev.subject,
      message: selectedTemplate?.content || prev.message,
    }));
  };

  const handleSendEmail = async () => {
    setComposeError("");

    if (!composeForm.recipient_id) {
      setComposeError("Please select a recipient.");
      return;
    }

    if (!composeForm.subject?.trim()) {
      setComposeError("Subject is required.");
      return;
    }

    if (!composeForm.message?.trim() && !composeForm.template_id) {
      setComposeError("Message is required when template is not selected.");
      return;
    }

    setSendInProgress(true);

    try {
      await sendEmailMessage({
        recipient_type: composeForm.recipient_type,
        recipient_id: Number.parseInt(composeForm.recipient_id, 10),
        subject: composeForm.subject.trim(),
        message: composeForm.message.trim(),
        template_id: composeForm.template_id
          ? Number.parseInt(composeForm.template_id, 10)
          : undefined,
      });

      closeComposeModal();
      await loadEmailData();
    } catch (error) {
      setComposeError(error.message || "Failed to send email.");
    } finally {
      setSendInProgress(false);
    }
  };

  useEffect(() => {
    loadEmailData();
    fetchAllData();
    fetchStats();
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (!compose) {
      return;
    }

    loadRecipients(composeForm.recipient_type, composeForm.recipient_search);
  }, [composeForm.recipient_type]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Communication Hub</h1>
          <p className="page-sub">
            Manage all parent communications in one place
          </p>
        </div>
        <button className="btn btn-primary" onClick={openComposeModal}>
          <Plus size={15} /> New Message
        </button>
      </div>

      {/* Stats */}
      <div className="grid-4 mb-5">
        {[
          {
            label: "Emails Sent",
            value: loadingStats ? "..." : `${stats.emailCount}`,
            icon: Mail,
            color: "var(--blue-bg)",
            ic: "var(--blue)",
          },
          {
            label: "SMS Sent",
            value: loadingStats ? "..." : `${stats.smsCount}`,
            icon: MessageSquare,
            color: "var(--green-bg)",
            ic: "var(--green)",
          },
          {
            label: "WhatsApp Sent",
            value: loadingStats ? "..." : `${stats.whatsappCount}`,
            icon: Eye,
            color: "var(--purple-bg)",
            ic: "var(--purple)",
          },
          {
            label: "Click Rate",
            value: loadingEmailData ? "..." : `${emailStats.click_rate || 0}%`,
            icon: BarChart2,
            color: "var(--orange-bg)",
            ic: "var(--orange)",
          },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div className="stat-card" key={i}>
              <div className="stat-wide">
                <div className="stat-icon" style={{ background: s.color }}>
                  <Icon size={20} style={{ color: s.ic }} />
                </div>
                <div>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-value">{s.value}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="comm-tabs">
        {["email", "sms", "whatsapp", "campaigns"].map((t) => (
          <div
            key={t}
            className={`comm-tab ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </div>
        ))}
      </div>

      {/* Tab content */}
      {tab !== "campaigns" ? (
        <div className="flex gap-5" style={{ flexWrap: "wrap" }}>
          {/* Messages */}
          <div className="card flex-1" style={{ minWidth: 300 }}>
            <div className="card-header">
              <div className="card-title">
                {tab === "email"
                  ? "Recent Messages"
                  : tab === "sms"
                    ? "SMS Messages"
                    : "WhatsApp Messages"}
              </div>
            </div>
            <div className="card-body">
              {tab === "email" && pageError && (
                <div
                  style={{
                    marginBottom: 12,
                    color: "var(--red)",
                    fontSize: 13,
                  }}
                >
                  {pageError}
                </div>
              )}
              <table className="table">
                <thead>
                  <tr>
                    <th>Recipient</th>
                    <th>{tab === "email" ? "Subject" : "Message"}</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {tab === "sms" && !smsData.length && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center" }}>
                        <p>No SMS data found</p>
                      </td>
                    </tr>
                  )}
                  {tab === "whatsapp" && !whatsappData.length && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center" }}>
                        <p>No WhatsApp data found</p>
                      </td>
                    </tr>
                  )}
                  {tab === "email" &&
                    !loadingEmailData &&
                    !emailLogs.length && (
                      <tr>
                        <td
                          colSpan={4}
                          style={{
                            textAlign: "center",
                            color: "var(--gray-500)",
                          }}
                        >
                          <p>No email logs found</p>
                        </td>
                      </tr>
                    )}

                  {(tab === "email"
                    ? emailLogs.map((item) => ({
                        recipient:
                          item.recipient_name ||
                          `Recipient #${item.recipient_id}`,
                        subject: item.subject,
                        message: item.message,
                        status: item.status || "sent",
                        date: formatDateTime(item.sent_at),
                      }))
                    : tab === "sms"
                      ? smsData.map((item) => ({
                          recipient: item.recipient_name || "Unknown",
                          message: item.message || "-",
                          status: item.status || "sent",
                          date: new Date(item.sent_at).toLocaleString(),
                        }))
                      : whatsappData.map((item) => ({
                          recipient: item.recipient_name || "Unknown",
                          message: item.message || "-",
                          status: item.status || "sent",
                          date: new Date(item.sent_at).toLocaleString(),
                        }))
                  ).map((m, i) => (
                    <tr key={i}>
                      <td className="td-bold">{m.recipient}</td>
                      <td>{m.subject || m.message}</td>
                      <td>
                        <span
                          className={`badge ${msgStatusColor(m.status)}`}
                          style={{ textTransform: "capitalize" }}
                        >
                          {m.status}
                        </span>
                      </td>
                      <td style={{ fontSize: 13, color: "var(--gray-500)" }}>
                        {m.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Templates */}
          <div className="card" style={{ width: 300 }}>
            <div className="card-header">
              <div className="card-title">Templates</div>
              <button
                className="btn btn-ghost btn-icon"
                onClick={() => {
                  setTemplateError("");
                  setTemplateModalOpen(true);
                }}
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="card-body">
              {loadingTemplates && (
                <div style={{ color: "var(--gray-500)", fontSize: 13 }}>
                  Loading templates...
                </div>
              )}
              {templates.map((template) => (
                <div className="template-card" key={template.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="template-name">{template.name}</span>
                    <span
                      className={`badge ${tagColor(template.category || "General")}`}
                      style={{ fontSize: 11 }}
                    >
                      {template.category || "General"}
                    </span>
                  </div>
                  <div className="template-desc">
                    {template.subject || template.content || "-"}
                  </div>
                  <div className="template-meta">
                    Last used:{" "}
                    {template.last_used_at
                      ? formatDateTime(template.last_used_at)
                      : "Never used"}
                  </div>
                </div>
              ))}
              {!loadingTemplates && templates.length === 0 && (
                <div style={{ color: "var(--gray-500)", fontSize: 13 }}>
                  No templates created yet.
                </div>
              )}
              {templateError && (
                <div style={{ color: "var(--red)", fontSize: 13 }}>
                  {templateError}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <div className="card-title"></div>
            <button
              className="btn btn-primary"
              onClick={() => setCampaign(true)}
            >
              <Plus size={15} /> Create Campaign
            </button>
          </div>
          <div className="card-body">
            <table className="table">
              <thead>
                <tr>
                  <th>Campaign Name</th>
                  <th>Type</th>
                  <th>Audience</th>
                  <th>Sent</th>
                  <th>Opened</th>
                  <th>Clicked</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {campaignData.length === 0 && (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center" }}>
                      <p>No Campaigns data found</p>
                    </td>
                  </tr>
                )}
                {campaignData.map((c, i) => (
                  <tr key={c.id || i}>
                    <td className="td-bold">{c.name}</td>
                    <td>
                      <span
                        className={`badge ${c.channel === "email" ? "badge-blue" : c.channel === "sms" ? "badge-green" : "badge-teal"}`}
                      >
                        {String(c.channel).toUpperCase()}
                      </span>
                    </td>
                    <td style={{ textTransform: "capitalize" }}>
                      {c.audience_type || "-"}
                    </td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>
                      <span
                        className={`badge ${statusColor(c.status)}`}
                        style={{ textTransform: "capitalize" }}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: "var(--gray-500)" }}>
                      {new Date(c.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Compose Modal */}
      {compose && (
        <div className="modal-backdrop" onClick={closeComposeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">Compose Email</div>
                <div style={{ fontSize: 13, color: "var(--gray-500)" }}>
                  Send email to parents or leads
                </div>
              </div>
              <button
                className="btn btn-ghost btn-icon"
                onClick={closeComposeModal}
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-body space-y-4">
              <div className="form-group">
                <label className="form-label">
                  Recipient Type <span className="req">*</span>
                </label>
                <select
                  className="form-select"
                  value={composeForm.recipient_type}
                  onChange={(e) =>
                    setComposeForm((prev) => ({
                      ...prev,
                      recipient_type: e.target.value,
                      recipient_id: "",
                    }))
                  }
                >
                  <option value="lead">Lead</option>
                  <option value="student">Student</option>
                  <option value="parent">Parent</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Search Recipient</label>
                <input
                  className="form-input"
                  value={composeForm.recipient_search}
                  onChange={(e) =>
                    setComposeForm((prev) => ({
                      ...prev,
                      recipient_search: e.target.value,
                    }))
                  }
                  placeholder="Search by name, phone or email"
                />
                <button
                  className="btn btn-outline"
                  style={{ marginTop: 8 }}
                  type="button"
                  onClick={() =>
                    loadRecipients(
                      composeForm.recipient_type,
                      composeForm.recipient_search,
                    )
                  }
                >
                  {loadingRecipients ? "Searching..." : "Search"}
                </button>
              </div>
              <div className="form-group">
                <label className="form-label">
                  Recipient <span className="req">*</span>
                </label>
                <select
                  className="form-select"
                  value={composeForm.recipient_id}
                  onChange={(e) =>
                    setComposeForm((prev) => ({
                      ...prev,
                      recipient_id: e.target.value,
                    }))
                  }
                >
                  <option value="">Select recipient</option>
                  {emailRecipients.map((recipient) => (
                    <option key={recipient.id} value={recipient.id}>
                      {recipient.name || `Recipient #${recipient.id}`}
                    </option>
                  ))}
                </select>
                {selectedRecipient?.email && (
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 12,
                      color: "var(--gray-500)",
                    }}
                  >
                    Email: {selectedRecipient.email}
                  </div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Template</label>
                <select
                  className="form-select"
                  value={composeForm.template_id}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                >
                  <option value="">Select a template (optional)</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">
                  Subject <span className="req">*</span>
                </label>
                <input
                  className="form-input"
                  placeholder="Email subject"
                  value={composeForm.subject}
                  onChange={(e) =>
                    setComposeForm((prev) => ({
                      ...prev,
                      subject: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Message <span className="req">*</span>
                </label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  placeholder="Type your message..."
                  value={composeForm.message}
                  onChange={(e) =>
                    setComposeForm((prev) => ({
                      ...prev,
                      message: e.target.value,
                    }))
                  }
                />
              </div>
              {composeError && (
                <div style={{ color: "var(--red)", fontSize: 13 }}>
                  {composeError}
                </div>
              )}
              <div className="flex gap-3">
                <button className="btn btn-outline" style={{ fontSize: 13 }}>
                  Attach Files
                </button>
                <button className="btn btn-outline" style={{ fontSize: 13 }}>
                  Insert Variable
                </button>
              </div>
              <div className="flex justify-end gap-3">
                <button className="btn btn-outline" onClick={closeComposeModal}>
                  Cancel
                </button>
                <button className="btn btn-outline">⬡ Schedule</button>
                <button
                  className="btn btn-primary"
                  onClick={handleSendEmail}
                  disabled={sendInProgress}
                >
                  {sendInProgress ? "Sending..." : "✈ Send Now"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {templateModalOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setTemplateModalOpen(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">Add Template</div>
                <div style={{ fontSize: 13, color: "var(--gray-500)" }}>
                  Create a reusable email template
                </div>
              </div>
              <button
                className="btn btn-ghost btn-icon"
                onClick={() => setTemplateModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-body space-y-4">
              <div className="form-group">
                <label className="form-label">
                  Template Name <span className="req">*</span>
                </label>
                <input
                  className="form-input"
                  name="name"
                  value={templateForm.name}
                  onChange={handleChange}
                  placeholder="e.g. Admission Welcome"
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Category <span className="req">*</span>
                </label>
                <input
                  className="form-input"
                  name="category"
                  value={templateForm.category}
                  onChange={handleChange}
                  placeholder="e.g. Onboarding"
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Subject <span className="req">*</span>
                </label>
                <input
                  className="form-input"
                  name="subject"
                  value={templateForm.subject}
                  onChange={handleChange}
                  placeholder="Email subject"
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Content <span className="req">*</span>
                </label>
                <textarea
                  className="form-textarea"
                  rows={5}
                  name="content"
                  value={templateForm.content}
                  onChange={handleChange}
                  placeholder="Write your template content"
                />
              </div>
              {templateError && (
                <div style={{ color: "var(--red)", fontSize: 13 }}>
                  {templateError}
                </div>
              )}
              <div className="flex justify-end gap-3">
                <button
                  className="btn btn-outline"
                  onClick={() => setTemplateModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={createTemplate}
                  disabled={creatingTemplate}
                >
                  {creatingTemplate ? "Saving..." : "Save Template"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Campaign Modal */}
      {campaign && (
        <div className="modal-backdrop" onClick={() => setCampaign(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">Create Campaign</div>
                <div style={{ fontSize: 13, color: "var(--gray-500)" }}>
                  Set up a new communication campaign
                </div>
              </div>
              <button
                className="btn btn-ghost btn-icon"
                onClick={() => setCampaign(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-body space-y-4">
              <div className="form-group">
                <label className="form-label">
                  Campaign Name <span className="req">*</span>
                </label>
                <input
                  className="form-input"
                  placeholder="Enter campaign name"
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Channel <span className="req">*</span>
                </label>
                <select className="form-select">
                  <option value="">Select channel</option>
                  <option>Email</option>
                  <option>SMS</option>
                  <option>WhatsApp</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">
                  Audience Filter <span className="req">*</span>
                </label>
                <select className="form-select">
                  <option value="">Select audience</option>
                  <option>All Leads</option>
                  <option>New Leads</option>
                  <option>Interested</option>
                  <option>All Parents</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Schedule</label>
                <select className="form-select">
                  <option>Send immediately</option>
                  <option>Schedule for later</option>
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  className="btn btn-outline"
                  onClick={() => setCampaign(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-primary">Create Campaign</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

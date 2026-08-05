import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  DollarSign,
  Edit3,
  Filter,
  Mail,
  MoreHorizontal,
  Plus,
  Search,
  Target,
  Trash2,
  TrendingUp,
  User,
  UserPlus,
  X,
} from "lucide-react";

import AppLayout from "../components/layout/AppLayout";
import { useAuth } from "../context/AuthContext";

import {
  createLead,
  deleteLead,
  getLeads,
  updateLead,
} from "../services/leadsService";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
  source: "Website",
  status: "New",
  priority: "Medium",
  value: "",
  assignedTo: "",
};

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getInitials(name) {
  if (!name?.trim()) {
    return "LF";
  }

  return name
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getStatusClass(status) {
  return status.toLowerCase().replaceAll(" ", "-");
}

function Leads() {
  const { user } = useAuth();

  const [leads, setLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const defaultOwner =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "LeadFlow User";

  useEffect(() => {
    if (!user?.id) {
      return undefined;
    }

    let isMounted = true;

    async function loadLeads() {
      setLoading(true);
      setErrorMessage("");

      const { data, error } = await getLeads(user.id);

      if (!isMounted) {
        return;
      }

      if (error) {
        setLeads([]);
        setErrorMessage(error.message);
      } else {
        setLeads(data ?? []);
      }

      setLoading(false);
    }

    loadLeads();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const filteredLeads = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return leads.filter((lead) => {
      const matchesSearch =
        lead.name.toLowerCase().includes(normalizedSearch) ||
        lead.company.toLowerCase().includes(normalizedSearch) ||
        lead.email.toLowerCase().includes(normalizedSearch) ||
        lead.source.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "All" || lead.status === statusFilter;

      const matchesPriority =
        priorityFilter === "All" ||
        lead.priority === priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    });
  }, [
    leads,
    searchTerm,
    statusFilter,
    priorityFilter,
  ]);

  const potentialRevenue = leads.reduce(
    (total, lead) => total + Number(lead.value || 0),
    0
  );

  const qualifiedLeads = leads.filter((lead) =>
    ["Qualified", "Proposal", "Won"].includes(lead.status)
  ).length;

  const wonLeads = leads.filter(
    (lead) => lead.status === "Won"
  ).length;

  const conversionRate =
    leads.length === 0
      ? 0
      : Math.round((wonLeads / leads.length) * 100);

  function handleInputChange(event) {
    const { name, value } = event.target;

    setFormData((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  function openAddModal() {
    setEditingLeadId(null);

    setFormData({
      ...emptyForm,
      assignedTo: defaultOwner,
    });

    setErrorMessage("");
    setIsModalOpen(true);
  }

  function openEditModal(lead) {
    setEditingLeadId(lead.id);

    setFormData({
      name: lead.name,
      email: lead.email,
      phone: lead.phone ?? "",
      company: lead.company,
      source: lead.source,
      status: lead.status,
      priority: lead.priority,
      value: lead.value ?? "",
      assignedTo: lead.assigned_to ?? defaultOwner,
    });

    setErrorMessage("");
    setIsModalOpen(true);
  }

  function closeModal() {
    if (isSaving) {
      return;
    }

    setEditingLeadId(null);
    setFormData(emptyForm);
    setErrorMessage("");
    setIsModalOpen(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!user?.id) {
      setErrorMessage("The authenticated user is missing.");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    const leadPayload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      company: formData.company.trim(),
      source: formData.source,
      status: formData.status,
      priority: formData.priority,
      value: Number(formData.value) || 0,
      assignedTo:
        formData.assignedTo.trim() || defaultOwner,
    };

    if (editingLeadId) {
      const { data, error } = await updateLead(
        editingLeadId,
        leadPayload
      );

      if (error) {
        setErrorMessage(error.message);
        setIsSaving(false);
        return;
      }

      setLeads((currentLeads) =>
        currentLeads.map((lead) =>
          lead.id === editingLeadId ? data : lead
        )
      );
    } else {
      const { data, error } = await createLead(
        user.id,
        leadPayload
      );

      if (error) {
        setErrorMessage(error.message);
        setIsSaving(false);
        return;
      }

      setLeads((currentLeads) => [
        data,
        ...currentLeads,
      ]);
    }

    setIsSaving(false);
    setEditingLeadId(null);
    setFormData(emptyForm);
    setIsModalOpen(false);
  }

  async function handleDelete(leadId, leadName) {
    const shouldDelete = window.confirm(
      `Delete ${leadName} from your leads?`
    );

    if (!shouldDelete) {
      return;
    }

    setErrorMessage("");

    const { error } = await deleteLead(leadId);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setLeads((currentLeads) =>
      currentLeads.filter((lead) => lead.id !== leadId)
    );
  }

  return (
    <AppLayout>
      <section className="leads-page">
        <div className="leads-header">
          <div>
            <p className="page-eyebrow">
              Lead management
            </p>

            <h1>Leads</h1>

            <p>
              Track opportunities, priorities and potential
              revenue.
            </p>
          </div>

          <button
            className="primary-button leads-add-button"
            type="button"
            onClick={openAddModal}
          >
            <Plus size={18} />
            Add lead
          </button>
        </div>

        {errorMessage && !isModalOpen && (
          <div className="leads-error-message">
            {errorMessage}
          </div>
        )}

        <section className="leads-summary-grid">
          <article className="leads-summary-card">
            <div className="leads-summary-icon">
              <UserPlus size={21} />
            </div>

            <div>
              <span>Total leads</span>
              <strong>{leads.length}</strong>
            </div>
          </article>

          <article className="leads-summary-card">
            <div className="leads-summary-icon purple">
              <Target size={21} />
            </div>

            <div>
              <span>Qualified leads</span>
              <strong>{qualifiedLeads}</strong>
            </div>
          </article>

          <article className="leads-summary-card">
            <div className="leads-summary-icon orange">
              <DollarSign size={21} />
            </div>

            <div>
              <span>Potential revenue</span>
              <strong>
                {formatCurrency(potentialRevenue)}
              </strong>
            </div>
          </article>

          <article className="leads-summary-card">
            <div className="leads-summary-icon green">
              <TrendingUp size={21} />
            </div>

            <div>
              <span>Conversion rate</span>
              <strong>{conversionRate}%</strong>
            </div>
          </article>
        </section>

        <article className="leads-table-card">
          <div className="leads-toolbar">
            <div className="leads-search">
              <Search size={18} />

              <input
                type="search"
                placeholder="Search by lead, company, email or source..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
              />
            </div>

            <div className="leads-filters">
              <div className="lead-filter">
                <Filter size={16} />

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value)
                  }
                >
                  <option value="All">
                    All statuses
                  </option>
                  <option value="New">New</option>
                  <option value="Contacted">
                    Contacted
                  </option>
                  <option value="Qualified">
                    Qualified
                  </option>
                  <option value="Proposal">
                    Proposal
                  </option>
                  <option value="Won">Won</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>

              <div className="lead-filter">
                <Target size={16} />

                <select
                  value={priorityFilter}
                  onChange={(event) =>
                    setPriorityFilter(event.target.value)
                  }
                >
                  <option value="All">
                    All priorities
                  </option>
                  <option value="High">High</option>
                  <option value="Medium">
                    Medium
                  </option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>
          </div>

          <div className="leads-table-wrapper">
            {loading ? (
              <div className="leads-loading">
                <div className="route-loading-spinner" />
                <p>Loading leads...</p>
              </div>
            ) : (
              <>
                <table className="leads-table">
                  <thead>
                    <tr>
                      <th>Lead</th>
                      <th>Source</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Value</th>
                      <th>Assigned</th>
                      <th>Created</th>
                      <th aria-label="Actions" />
                    </tr>
                  </thead>

                  <tbody>
                    {filteredLeads.map((lead) => (
                      <tr key={lead.id}>
                        <td>
                          <div className="lead-identity">
                            <div className="lead-avatar">
                              {getInitials(lead.name)}
                            </div>

                            <div>
                              <strong>{lead.name}</strong>
                              <span>{lead.company}</span>

                              <div className="lead-contact-inline">
                                <Mail size={12} />
                                {lead.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="lead-source">
                            {lead.source}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`lead-status ${getStatusClass(
                              lead.status
                            )}`}
                          >
                            {lead.status}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`lead-priority ${lead.priority.toLowerCase()}`}
                          >
                            {lead.priority}
                          </span>
                        </td>

                        <td className="lead-value">
                          {formatCurrency(lead.value)}
                        </td>

                        <td>
                          <div className="lead-owner">
                            <User size={15} />
                            {lead.assigned_to ||
                              "Unassigned"}
                          </div>
                        </td>

                        <td>
                          <div className="lead-date">
                            <CalendarDays size={14} />
                            {formatDate(lead.created_at)}
                          </div>
                        </td>

                        <td>
                          <div className="lead-actions">
                            <button
                              type="button"
                              aria-label={`Edit ${lead.name}`}
                              onClick={() =>
                                openEditModal(lead)
                              }
                            >
                              <Edit3 size={16} />
                            </button>

                            <button
                              type="button"
                              aria-label={`Delete ${lead.name}`}
                              onClick={() =>
                                handleDelete(
                                  lead.id,
                                  lead.name
                                )
                              }
                            >
                              <Trash2 size={16} />
                            </button>

                            <button
                              type="button"
                              aria-label={`More actions for ${lead.name}`}
                            >
                              <MoreHorizontal size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredLeads.length === 0 && (
                  <div className="leads-empty">
                    <Target size={36} />
                    <h3>No leads found</h3>

                    <p>
                      Add your first lead or change the
                      filters.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="leads-table-footer">
            Showing {filteredLeads.length} of{" "}
            {leads.length} leads
          </div>
        </article>
      </section>

      {isModalOpen && (
        <div
          className="lead-modal-backdrop"
          role="presentation"
          onMouseDown={closeModal}
        >
          <div
            className="lead-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="lead-modal-title"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="lead-modal-header">
              <div>
                <p className="page-eyebrow">
                  {editingLeadId
                    ? "Update record"
                    : "New opportunity"}
                </p>

                <h2 id="lead-modal-title">
                  {editingLeadId
                    ? "Edit lead"
                    : "Add lead"}
                </h2>
              </div>

              <button
                className="modal-close-button"
                type="button"
                aria-label="Close"
                disabled={isSaving}
                onClick={closeModal}
              >
                <X size={20} />
              </button>
            </div>

            {errorMessage && (
              <div className="lead-modal-error">
                {errorMessage}
              </div>
            )}

            <form
              className="lead-form"
              onSubmit={handleSubmit}
            >
              <div className="lead-form-grid">
                <label>
                  Full name

                  <input
                    required
                    name="name"
                    type="text"
                    placeholder="Example: Daniel Carter"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </label>

                <label>
                  Company

                  <input
                    required
                    name="company"
                    type="text"
                    placeholder="Example: PixelCraft"
                    value={formData.company}
                    onChange={handleInputChange}
                  />
                </label>

                <label>
                  Email address

                  <input
                    required
                    name="email"
                    type="email"
                    placeholder="daniel@company.com"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </label>

                <label>
                  Phone

                  <input
                    name="phone"
                    type="tel"
                    placeholder="+1 202 555 0100"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </label>

                <label>
                  Source

                  <select
                    name="source"
                    value={formData.source}
                    onChange={handleInputChange}
                  >
                    <option value="Website">
                      Website
                    </option>
                    <option value="Google Ads">
                      Google Ads
                    </option>
                    <option value="LinkedIn">
                      LinkedIn
                    </option>
                    <option value="Referral">
                      Referral
                    </option>
                    <option value="Cold Email">
                      Cold Email
                    </option>
                    <option value="Social Media">
                      Social Media
                    </option>
                  </select>
                </label>

                <label>
                  Status

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="New">New</option>
                    <option value="Contacted">
                      Contacted
                    </option>
                    <option value="Qualified">
                      Qualified
                    </option>
                    <option value="Proposal">
                      Proposal
                    </option>
                    <option value="Won">Won</option>
                    <option value="Lost">Lost</option>
                  </select>
                </label>

                <label>
                  Priority

                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                  >
                    <option value="High">High</option>
                    <option value="Medium">
                      Medium
                    </option>
                    <option value="Low">Low</option>
                  </select>
                </label>

                <label>
                  Estimated value

                  <input
                    min="0"
                    name="value"
                    type="number"
                    placeholder="15000"
                    value={formData.value}
                    onChange={handleInputChange}
                  />
                </label>

                <label className="lead-owner-field">
                  Assigned to

                  <input
                    name="assignedTo"
                    type="text"
                    placeholder={defaultOwner}
                    value={formData.assignedTo}
                    onChange={handleInputChange}
                  />
                </label>
              </div>

              <div className="lead-form-actions">
                <button
                  className="secondary-button"
                  type="button"
                  disabled={isSaving}
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  className="primary-button"
                  type="submit"
                  disabled={isSaving}
                >
                  {isSaving
                    ? "Saving..."
                    : editingLeadId
                      ? "Save changes"
                      : "Add lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

export default Leads;
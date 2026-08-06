import { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  CircleDollarSign,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import { supabase } from "../services/supabase";

import {
  createLead,
  deleteLead,
  getLeads,
} from "../services/leadsService";

import "../styles/leads.css";

const initialFormData = {
  name: "",
  company: "",
  email: "",
  phone: "",

  dealTitle: "",
  jobTitle: "",
  website: "",
  linkedin: "",
  city: "",
  country: "",

  source: "Website",
  status: "New",
  priority: "Medium",

  value: "",
  currency: "EUR",
  probability: "20",

  expectedCloseDate: "",
  nextFollowUp: "",

  assignedTo: "Cipicao Cao",
  tags: "",
  notes: "",
};

const statusOptions = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal",
  "Won",
  "Lost",
];

const sourceOptions = [
  "Website",
  "Google Ads",
  "LinkedIn",
  "Referral",
  "Cold Email",
  "Social Media",
];

const priorityOptions = ["High", "Medium", "Low"];

function Leads() {
  const [userId, setUserId] = useState(null);
  const [leads, setLeads] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openedMenuId, setOpenedMenuId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [pageError, setPageError] = useState("");
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    loadAuthenticatedUser();
  }, []);

  useEffect(() => {
    function closeMenus() {
      setOpenedMenuId(null);
    }

    window.addEventListener("click", closeMenus);

    return () => {
      window.removeEventListener("click", closeMenus);
    };
  }, []);

  async function loadAuthenticatedUser() {
    setIsLoading(true);
    setPageError("");

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      setPageError(
        error?.message || "You must be logged in to access your leads."
      );
      setIsLoading(false);
      return;
    }

    setUserId(user.id);
    await loadLeads(user.id);
  }

  async function loadLeads(authenticatedUserId = userId) {
    if (!authenticatedUserId) {
      return;
    }

    setIsLoading(true);
    setPageError("");

    const { data, error } = await getLeads(authenticatedUserId);

    if (error) {
      console.error("Load leads error:", error);
      setPageError(error.message || "The leads could not be loaded.");
      setIsLoading(false);
      return;
    }

    setLeads(data);
    setIsLoading(false);
  }

  function openModal() {
    setFormData(initialFormData);
    setFormError("");
    setIsModalOpen(true);
  }

  function closeModal() {
    if (isSubmitting) {
      return;
    }

    setIsModalOpen(false);
    setFormError("");
    setFormData(initialFormData);
  }

  function handleOverlayMouseDown(event) {
    if (event.target === event.currentTarget) {
      closeModal();
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    if (formError) {
      setFormError("");
    }
  }

  function validateForm() {
    if (!formData.name.trim()) {
      return "Full name is required.";
    }

    if (!formData.company.trim()) {
      return "Company is required.";
    }

    if (!formData.email.trim()) {
      return "Email address is required.";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(formData.email.trim())) {
      return "Enter a valid email address.";
    }

    if (Number(formData.value) < 0) {
      return "Estimated value cannot be negative.";
    }

    const probability = Number(formData.probability);

    if (
      Number.isNaN(probability) ||
      probability < 0 ||
      probability > 100
    ) {
      return "Probability must be between 0 and 100.";
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    if (!userId) {
      setFormError("The authenticated user is missing.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    const { data, error } = await createLead(userId, formData);

    if (error) {
      console.error("Create lead error:", error);
      setFormError(error.message || "The lead could not be created.");
      setIsSubmitting(false);
      return;
    }

    setLeads((currentLeads) => [data, ...currentLeads]);

    setFormData(initialFormData);
    setIsSubmitting(false);
    setIsModalOpen(false);
  }

  async function handleDeleteLead(leadId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this lead?"
    );

    if (!confirmed) {
      return;
    }

    const { error } = await deleteLead(leadId);

    if (error) {
      console.error("Delete lead error:", error);
      setPageError(error.message || "The lead could not be deleted.");
      return;
    }

    setLeads((currentLeads) =>
      currentLeads.filter((lead) => lead.id !== leadId)
    );

    setOpenedMenuId(null);
  }

  function toggleMenu(event, leadId) {
    event.stopPropagation();

    setOpenedMenuId((currentId) =>
      currentId === leadId ? null : leadId
    );
  }

  const filteredLeads = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return leads.filter((lead) => {
      const matchesSearch =
        !normalizedSearch ||
        lead.name?.toLowerCase().includes(normalizedSearch) ||
        lead.company?.toLowerCase().includes(normalizedSearch) ||
        lead.email?.toLowerCase().includes(normalizedSearch) ||
        lead.deal_title?.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "All" || lead.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [leads, searchTerm, statusFilter]);

  const statistics = useMemo(() => {
    const totalValue = leads.reduce(
      (sum, lead) => sum + Number(lead.value || 0),
      0
    );

    const qualifiedLeads = leads.filter(
      (lead) =>
        lead.status === "Qualified" ||
        lead.status === "Proposal" ||
        lead.status === "Won"
    ).length;

    const wonLeads = leads.filter(
      (lead) => lead.status === "Won"
    ).length;

    return {
      totalLeads: leads.length,
      qualifiedLeads,
      wonLeads,
      totalValue,
    };
  }, [leads]);

  return (
    <main className="leads-page">
      <div className="leads-page-heading">
        <div>
          <p className="leads-page-eyebrow">SALES MANAGEMENT</p>
          <h1>Leads</h1>
          <p className="leads-page-description">
            Manage prospects, opportunities and follow-up activities.
          </p>
        </div>

        <button
          type="button"
          className="leads-add-button"
          onClick={openModal}
        >
          <Plus size={19} />
          Add lead
        </button>
      </div>

      {pageError && (
        <div className="leads-page-error">
          <span>{pageError}</span>

          <button
            type="button"
            onClick={() => loadLeads()}
          >
            Try again
          </button>
        </div>
      )}

      <section className="leads-statistics">
        <article className="lead-stat-card">
          <div className="lead-stat-icon">
            <Users size={21} />
          </div>

          <div>
            <p>Total leads</p>
            <strong>{statistics.totalLeads}</strong>
            <span>All opportunities</span>
          </div>
        </article>

        <article className="lead-stat-card">
          <div className="lead-stat-icon">
            <BriefcaseBusiness size={21} />
          </div>

          <div>
            <p>Qualified</p>
            <strong>{statistics.qualifiedLeads}</strong>
            <span>Sales-ready leads</span>
          </div>
        </article>

        <article className="lead-stat-card">
          <div className="lead-stat-icon">
            <CircleDollarSign size={21} />
          </div>

          <div>
            <p>Pipeline value</p>
            <strong>
              {formatMoney(statistics.totalValue, "EUR")}
            </strong>
            <span>Combined estimated value</span>
          </div>
        </article>

        <article className="lead-stat-card">
          <div className="lead-stat-icon">
            <UserPlus size={21} />
          </div>

          <div>
            <p>Won leads</p>
            <strong>{statistics.wonLeads}</strong>
            <span>Successfully converted</span>
          </div>
        </article>
      </section>

      <section className="leads-content-card">
        <div className="leads-toolbar">
          <div className="leads-search">
            <Search size={19} />

            <input
              type="search"
              placeholder="Search by name, company, email or deal..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="leads-status-filter">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="All">All statuses</option>

              {statusOptions.map((status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              ))}
            </select>

            <ChevronDown size={17} />
          </div>
        </div>

        {isLoading ? (
          <div className="leads-loading">
            <div className="leads-loader" />
            <p>Loading leads...</p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="leads-empty-state">
            <div className="leads-empty-icon">
              <Users size={31} />
            </div>

            <h2>
              {leads.length === 0
                ? "No leads yet"
                : "No leads found"}
            </h2>

            <p>
              {leads.length === 0
                ? "Create your first lead and start building your sales pipeline."
                : "Try changing the search text or selected status."}
            </p>

            {leads.length === 0 && (
              <button
                type="button"
                onClick={openModal}
              >
                <Plus size={18} />
                Create first lead
              </button>
            )}
          </div>
        ) : (
          <div className="leads-table-wrapper">
            <table className="leads-table">
              <thead>
                <tr>
                  <th>Lead</th>
                  <th>Deal</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Value</th>
                  <th>Follow-up</th>
                  <th>Assigned to</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>

              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <div className="lead-person-cell">
                        <div className="lead-avatar">
                          {getInitials(lead.name)}
                        </div>

                        <div>
                          <strong>{lead.name}</strong>
                          <span>{lead.company}</span>

                          <div className="lead-contact-details">
                            {lead.email && (
                              <span>
                                <Mail size={12} />
                                {lead.email}
                              </span>
                            )}

                            {lead.phone && (
                              <span>
                                <Phone size={12} />
                                {lead.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="lead-deal-cell">
                        <strong>
                          {lead.deal_title || "Untitled opportunity"}
                        </strong>

                        <span>{lead.source}</span>

                        {(lead.city || lead.country) && (
                          <small>
                            <MapPin size={12} />
                            {[lead.city, lead.country]
                              .filter(Boolean)
                              .join(", ")}
                          </small>
                        )}
                      </div>
                    </td>

                    <td>
                      <span
                        className={`lead-status lead-status-${normalizeClassName(
                          lead.status
                        )}`}
                      >
                        {lead.status}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`lead-priority lead-priority-${normalizeClassName(
                          lead.priority
                        )}`}
                      >
                        <span />
                        {lead.priority}
                      </span>
                    </td>

                    <td>
                      <div className="lead-value-cell">
                        <strong>
                          {formatMoney(
                            lead.value,
                            lead.currency || "EUR"
                          )}
                        </strong>

                        <span>
                          {Number(lead.probability || 0)}% probability
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className="lead-date-cell">
                        <CalendarDays size={15} />

                        <span>
                          {lead.next_follow_up
                            ? formatDate(lead.next_follow_up, true)
                            : lead.expected_close_date
                              ? formatDate(
                                  lead.expected_close_date,
                                  false
                                )
                              : "Not scheduled"}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className="lead-assigned">
                        {lead.assigned_to || "Unassigned"}
                      </span>
                    </td>

                    <td>
                      <div className="lead-actions">
                        <button
                          type="button"
                          className="lead-actions-button"
                          aria-label={`Actions for ${lead.name}`}
                          onClick={(event) =>
                            toggleMenu(event, lead.id)
                          }
                        >
                          <MoreHorizontal size={20} />
                        </button>

                        {openedMenuId === lead.id && (
                          <div
                            className="lead-actions-menu"
                            onClick={(event) =>
                              event.stopPropagation()
                            }
                          >
                            <button
                              type="button"
                              className="lead-delete-option"
                              onClick={() =>
                                handleDeleteLead(lead.id)
                              }
                            >
                              <Trash2 size={16} />
                              Delete lead
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {isModalOpen && (
        <div
          className="lead-modal-overlay"
          onMouseDown={handleOverlayMouseDown}
        >
          <div
            className="lead-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-lead-title"
          >
            <header className="lead-modal-header">
              <div>
                <p className="lead-modal-eyebrow">
                  NEW OPPORTUNITY
                </p>

                <h2 id="add-lead-title">Add lead</h2>

                <p className="lead-modal-description">
                  Add contact information and configure the sales
                  opportunity.
                </p>
              </div>

              <button
                type="button"
                className="lead-modal-close"
                onClick={closeModal}
                aria-label="Close modal"
                disabled={isSubmitting}
              >
                <X size={26} />
              </button>
            </header>

            <form
              className="lead-form"
              onSubmit={handleSubmit}
            >
              {formError && (
                <div className="lead-form-error">
                  {formError}
                </div>
              )}

              <section className="lead-form-section">
                <div className="lead-section-heading">
                  <UserPlus size={21} />

                  <div>
                    <h3>Contact information</h3>
                    <p>
                      Basic information about the potential customer.
                    </p>
                  </div>
                </div>

                <div className="lead-form-grid">
                  <FormField
                    label="Full name"
                    required
                  >
                    <input
                      name="name"
                      type="text"
                      placeholder="Example: Daniel Carter"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </FormField>

                  <FormField
                    label="Company"
                    required
                  >
                    <input
                      name="company"
                      type="text"
                      placeholder="Example: PixelCraft"
                      value={formData.company}
                      onChange={handleChange}
                    />
                  </FormField>

                  <FormField
                    label="Email address"
                    required
                  >
                    <input
                      name="email"
                      type="email"
                      placeholder="daniel@company.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </FormField>

                  <FormField label="Phone">
                    <input
                      name="phone"
                      type="tel"
                      placeholder="+40 712 345 678"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </FormField>

                  <FormField label="Job title">
                    <input
                      name="jobTitle"
                      type="text"
                      placeholder="Example: Marketing Manager"
                      value={formData.jobTitle}
                      onChange={handleChange}
                    />
                  </FormField>

                  <FormField label="Website">
                    <input
                      name="website"
                      type="url"
                      placeholder="https://company.com"
                      value={formData.website}
                      onChange={handleChange}
                    />
                  </FormField>

                  <FormField label="LinkedIn profile">
                    <input
                      name="linkedin"
                      type="url"
                      placeholder="https://linkedin.com/in/..."
                      value={formData.linkedin}
                      onChange={handleChange}
                    />
                  </FormField>

                  <FormField label="City">
                    <input
                      name="city"
                      type="text"
                      placeholder="Bucharest"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </FormField>

                  <FormField label="Country">
                    <input
                      name="country"
                      type="text"
                      placeholder="Romania"
                      value={formData.country}
                      onChange={handleChange}
                    />
                  </FormField>
                </div>
              </section>

              <section className="lead-form-section">
                <div className="lead-section-heading">
                  <BriefcaseBusiness size={21} />

                  <div>
                    <h3>Sales information</h3>
                    <p>
                      Configure the opportunity, value and follow-up.
                    </p>
                  </div>
                </div>

                <div className="lead-form-grid">
                  <FormField
                    label="Deal title"
                    fullWidth
                  >
                    <input
                      name="dealTitle"
                      type="text"
                      placeholder="Example: Company website redesign"
                      value={formData.dealTitle}
                      onChange={handleChange}
                    />
                  </FormField>

                  <FormField label="Source">
                    <select
                      name="source"
                      value={formData.source}
                      onChange={handleChange}
                    >
                      {sourceOptions.map((source) => (
                        <option
                          key={source}
                          value={source}
                        >
                          {source}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Status">
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      {statusOptions.map((status) => (
                        <option
                          key={status}
                          value={status}
                        >
                          {status}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Priority">
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                    >
                      {priorityOptions.map((priority) => (
                        <option
                          key={priority}
                          value={priority}
                        >
                          {priority}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Probability to close">
                    <div className="lead-percentage-input">
                      <input
                        name="probability"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.probability}
                        onChange={handleChange}
                      />

                      <span>%</span>
                    </div>
                  </FormField>

                  <FormField label="Estimated value">
                    <div className="lead-money-input">
                      <select
                        name="currency"
                        value={formData.currency}
                        onChange={handleChange}
                        aria-label="Currency"
                      >
                        <option value="RON">RON</option>
                        <option value="EUR">EUR</option>
                        <option value="USD">USD</option>
                        <option value="GBP">GBP</option>
                      </select>

                      <input
                        name="value"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="15000"
                        value={formData.value}
                        onChange={handleChange}
                      />
                    </div>
                  </FormField>

                  <FormField label="Expected close date">
                    <input
                      name="expectedCloseDate"
                      type="date"
                      value={formData.expectedCloseDate}
                      onChange={handleChange}
                    />
                  </FormField>

                  <FormField label="Next follow-up">
                    <input
                      name="nextFollowUp"
                      type="datetime-local"
                      value={formData.nextFollowUp}
                      onChange={handleChange}
                    />
                  </FormField>

                  <FormField label="Assigned to">
                    <select
                      name="assignedTo"
                      value={formData.assignedTo}
                      onChange={handleChange}
                    >
                      <option value="Cipicao Cao">
                        Cipicao Cao
                      </option>

                      <option value="Unassigned">
                        Unassigned
                      </option>
                    </select>
                  </FormField>

                  <FormField
                    label="Tags"
                    helperText="Separate tags using commas."
                  >
                    <input
                      name="tags"
                      type="text"
                      placeholder="Hot lead, Website, VIP"
                      value={formData.tags}
                      onChange={handleChange}
                    />
                  </FormField>

                  <FormField
                    label="Internal notes"
                    fullWidth
                  >
                    <textarea
                      name="notes"
                      rows="5"
                      placeholder="Add information about the customer's requirements, previous discussions or next steps..."
                      value={formData.notes}
                      onChange={handleChange}
                    />
                  </FormField>
                </div>
              </section>

              <footer className="lead-form-footer">
                <button
                  type="button"
                  className="lead-cancel-button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="lead-submit-button"
                  disabled={isSubmitting}
                >
                  <UserPlus size={18} />

                  {isSubmitting
                    ? "Creating lead..."
                    : "Create lead"}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function FormField({
  label,
  required = false,
  fullWidth = false,
  helperText = "",
  children,
}) {
  return (
    <label
      className={`lead-field ${
        fullWidth ? "lead-field-full" : ""
      }`}
    >
      <span className="lead-field-label">
        {label}
        {required && <b> *</b>}
      </span>

      {children}

      {helperText && <small>{helperText}</small>}
    </label>
  );
}

function getInitials(name) {
  if (!name) {
    return "NA";
  }

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function normalizeClassName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function formatMoney(value, currency = "EUR") {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  } catch {
    return `${Number(value || 0).toLocaleString()} ${currency}`;
  }
}

function formatDate(value, includeTime = false) {
  if (!value) {
    return "Not scheduled";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not scheduled";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(includeTime
      ? {
          hour: "2-digit",
          minute: "2-digit",
        }
      : {}),
  }).format(date);
}

export default Leads;
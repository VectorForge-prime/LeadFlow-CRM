import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  CircleDollarSign,
  GripVertical,
  Mail,
  Target,
  TrendingUp,
  UserRound,
} from "lucide-react";

import AppLayout from "../components/layout/AppLayout";
import { useAuth } from "../context/AuthContext";
import {
  getLeads,
  updateLead,
} from "../services/leadsService";

const pipelineStages = [
  {
    name: "New",
    label: "New leads",
    description: "Recently added opportunities",
  },
  {
    name: "Contacted",
    label: "Contacted",
    description: "Initial communication started",
  },
  {
    name: "Qualified",
    label: "Qualified",
    description: "Potential customers validated",
  },
  {
    name: "Proposal",
    label: "Proposal",
    description: "Offer or proposal submitted",
  },
  {
    name: "Won",
    label: "Won",
    description: "Successfully converted deals",
  },
  {
    name: "Lost",
    label: "Lost",
    description: "Closed opportunities",
  },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
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

function normalizeLead(databaseLead) {
  return {
    id: databaseLead.id,
    userId: databaseLead.user_id,
    name: databaseLead.name,
    email: databaseLead.email,
    phone: databaseLead.phone ?? "",
    company: databaseLead.company,
    source: databaseLead.source,
    status: databaseLead.status,
    priority: databaseLead.priority,
    value: Number(databaseLead.value) || 0,
    assignedTo:
      databaseLead.assigned_to || "Unassigned",
    createdAt: databaseLead.created_at,
    updatedAt: databaseLead.updated_at,
  };
}

function Pipeline() {
  const { user } = useAuth();

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [movingLeadId, setMovingLeadId] =
    useState(null);
  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    if (!user?.id) {
      return undefined;
    }

    let isMounted = true;

    async function loadLeads() {
      setLoading(true);
      setErrorMessage("");

      const { data, error } = await getLeads(
        user.id
      );

      if (!isMounted) {
        return;
      }

      if (error) {
        setLeads([]);
        setErrorMessage(error.message);
      } else {
        setLeads(
          (data ?? []).map(normalizeLead)
        );
      }

      setLoading(false);
    }

    loadLeads();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const metrics = useMemo(() => {
    const totalPipelineValue = leads.reduce(
      (total, lead) =>
        total + Number(lead.value || 0),
      0
    );

    const wonLeads = leads.filter(
      (lead) => lead.status === "Won"
    );

    const wonValue = wonLeads.reduce(
      (total, lead) =>
        total + Number(lead.value || 0),
      0
    );

    const activeLeads = leads.filter(
      (lead) =>
        !["Won", "Lost"].includes(lead.status)
    );

    const conversionRate =
      leads.length === 0
        ? 0
        : Math.round(
            (wonLeads.length / leads.length) * 100
          );

    return {
      totalPipelineValue,
      wonValue,
      activeLeads: activeLeads.length,
      conversionRate,
    };
  }, [leads]);

  function handleDragStart(event, leadId) {
    event.dataTransfer.setData(
      "leadId",
      leadId
    );

    event.dataTransfer.effectAllowed = "move";
    setMovingLeadId(leadId);
  }

  function handleDragEnd() {
    setMovingLeadId(null);
  }

  function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  async function handleDrop(event, newStatus) {
    event.preventDefault();

    const leadId =
      event.dataTransfer.getData("leadId");

    const selectedLead = leads.find(
      (lead) => lead.id === leadId
    );

    setMovingLeadId(null);

    if (
      !selectedLead ||
      selectedLead.status === newStatus
    ) {
      return;
    }

    const previousStatus = selectedLead.status;

    setLeads((currentLeads) =>
      currentLeads.map((lead) =>
        lead.id === leadId
          ? {
              ...lead,
              status: newStatus,
            }
          : lead
      )
    );

    const leadPayload = {
      name: selectedLead.name,
      email: selectedLead.email,
      phone: selectedLead.phone,
      company: selectedLead.company,
      source: selectedLead.source,
      status: newStatus,
      priority: selectedLead.priority,
      value: selectedLead.value,
      assignedTo: selectedLead.assignedTo,
    };

    const { data, error } = await updateLead(
      leadId,
      leadPayload
    );

    if (error) {
      setLeads((currentLeads) =>
        currentLeads.map((lead) =>
          lead.id === leadId
            ? {
                ...lead,
                status: previousStatus,
              }
            : lead
        )
      );

      setErrorMessage(error.message);
      return;
    }

    if (data) {
      const updatedLead = normalizeLead(data);

      setLeads((currentLeads) =>
        currentLeads.map((lead) =>
          lead.id === updatedLead.id
            ? updatedLead
            : lead
        )
      );
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="pipeline-loading">
          <div className="route-loading-spinner" />
          <p>Loading sales pipeline...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <section className="premium-pipeline-page">
        <div className="pipeline-page-header">
          <div>
            <p className="page-eyebrow">
              Sales management
            </p>

            <h1>Pipeline</h1>

            <p>
              Move leads between stages and monitor the
              progress of every sales opportunity.
            </p>
          </div>

          <div className="pipeline-header-badge">
            <Target size={18} />

            <div>
              <span>Active opportunities</span>
              <strong>{metrics.activeLeads}</strong>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="pipeline-error-message">
            {errorMessage}
          </div>
        )}

        <section className="pipeline-summary-grid">
          <article className="pipeline-summary-card">
            <div className="pipeline-summary-icon blue">
              <Target size={21} />
            </div>

            <div>
              <span>Total leads</span>
              <strong>{leads.length}</strong>
              <small>All pipeline opportunities</small>
            </div>
          </article>

          <article className="pipeline-summary-card">
            <div className="pipeline-summary-icon purple">
              <CircleDollarSign size={21} />
            </div>

            <div>
              <span>Pipeline value</span>
              <strong>
                {formatCurrency(
                  metrics.totalPipelineValue
                )}
              </strong>
              <small>Potential sales revenue</small>
            </div>
          </article>

          <article className="pipeline-summary-card">
            <div className="pipeline-summary-icon green">
              <TrendingUp size={21} />
            </div>

            <div>
              <span>Won revenue</span>
              <strong>
                {formatCurrency(metrics.wonValue)}
              </strong>
              <small>Successfully converted</small>
            </div>
          </article>

          <article className="pipeline-summary-card">
            <div className="pipeline-summary-icon orange">
              <UserRound size={21} />
            </div>

            <div>
              <span>Conversion rate</span>
              <strong>
                {metrics.conversionRate}%
              </strong>
              <small>Won leads from total</small>
            </div>
          </article>
        </section>

        <div className="pipeline-help-message">
          <GripVertical size={16} />

          <span>
            Drag and drop a lead card into another column
            to update its status automatically.
          </span>
        </div>

        <section className="pipeline-board">
          {pipelineStages.map((stage) => {
            const stageLeads = leads.filter(
              (lead) => lead.status === stage.name
            );

            const stageValue = stageLeads.reduce(
              (total, lead) =>
                total + Number(lead.value || 0),
              0
            );

            return (
              <article
                className={`pipeline-column pipeline-column-${stage.name.toLowerCase()}`}
                key={stage.name}
                onDragOver={handleDragOver}
                onDrop={(event) =>
                  handleDrop(event, stage.name)
                }
              >
                <div className="pipeline-column-header">
                  <div className="pipeline-column-title">
                    <span
                      className={`pipeline-stage-dot ${stage.name.toLowerCase()}`}
                    />

                    <div>
                      <h2>{stage.label}</h2>
                      <p>{stage.description}</p>
                    </div>
                  </div>

                  <span className="pipeline-column-count">
                    {stageLeads.length}
                  </span>
                </div>

                <div className="pipeline-column-value">
                  <span>Stage value</span>
                  <strong>
                    {formatCurrency(stageValue)}
                  </strong>
                </div>

                <div className="pipeline-column-cards">
                  {stageLeads.map((lead) => (
                    <article
                      className={`pipeline-lead-card ${
                        movingLeadId === lead.id
                          ? "dragging"
                          : ""
                      }`}
                      draggable
                      key={lead.id}
                      onDragEnd={handleDragEnd}
                      onDragStart={(event) =>
                        handleDragStart(
                          event,
                          lead.id
                        )
                      }
                    >
                      <div className="pipeline-card-top">
                        <div className="pipeline-card-avatar">
                          {getInitials(lead.name)}
                        </div>

                        <GripVertical
                          className="pipeline-drag-icon"
                          size={17}
                        />
                      </div>

                      <div className="pipeline-card-person">
                        <strong>{lead.name}</strong>

                        <span>{lead.company}</span>
                      </div>

                      <div className="pipeline-card-details">
                        <span>
                          <Mail size={13} />
                          {lead.email}
                        </span>

                        <span>
                          <Building2 size={13} />
                          {lead.source}
                        </span>
                      </div>

                      <div className="pipeline-card-footer">
                        <strong>
                          {formatCurrency(lead.value)}
                        </strong>

                        <span
                          className={`pipeline-priority ${lead.priority.toLowerCase()}`}
                        >
                          {lead.priority}
                        </span>
                      </div>
                    </article>
                  ))}

                  {stageLeads.length === 0 && (
                    <div className="pipeline-empty-column">
                      <Target size={25} />
                      <strong>No leads</strong>
                      <span>
                        Drop an opportunity here.
                      </span>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      </section>
    </AppLayout>
  );
}

export default Pipeline;
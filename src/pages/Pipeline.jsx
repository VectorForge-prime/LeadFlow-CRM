import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  DollarSign,
  GripVertical,
  Search,
  Target,
  User,
} from "lucide-react";

import AppLayout from "../components/layout/AppLayout";
import { useAuth } from "../context/AuthContext";

import {
  getLeads,
  updateLeadStatus,
} from "../services/leadsService";

const pipelineStages = [
  {
    name: "New",
    className: "new",
  },
  {
    name: "Contacted",
    className: "contacted",
  },
  {
    name: "Qualified",
    className: "qualified",
  },
  {
    name: "Proposal",
    className: "proposal",
  },
  {
    name: "Won",
    className: "won",
  },
  {
    name: "Lost",
    className: "lost",
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

function Pipeline() {
  const { user } = useAuth();

  const [leads, setLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [movingLeadId, setMovingLeadId] = useState(null);
  const [draggedLeadId, setDraggedLeadId] = useState(null);
  const [dragOverStage, setDragOverStage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!user?.id) {
      return undefined;
    }

    let isMounted = true;

    async function loadPipeline() {
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

    loadPipeline();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const filteredLeads = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return leads.filter((lead) => {
      return (
        lead.name.toLowerCase().includes(normalizedSearch) ||
        lead.company.toLowerCase().includes(normalizedSearch) ||
        lead.email.toLowerCase().includes(normalizedSearch) ||
        lead.source.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [leads, searchTerm]);

  const totalPipelineValue = leads
    .filter((lead) => lead.status !== "Lost")
    .reduce(
      (total, lead) => total + Number(lead.value || 0),
      0
    );

  const wonLeads = leads.filter(
    (lead) => lead.status === "Won"
  );

  const wonValue = wonLeads.reduce(
    (total, lead) => total + Number(lead.value || 0),
    0
  );

  const winRate =
    leads.length === 0
      ? 0
      : Math.round((wonLeads.length / leads.length) * 100);

  async function moveLead(leadId, newStatus) {
    const currentLead = leads.find(
      (lead) => lead.id === leadId
    );

    if (!currentLead || currentLead.status === newStatus) {
      return;
    }

    const previousStatus = currentLead.status;

    setErrorMessage("");
    setMovingLeadId(leadId);

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

    const { data, error } = await updateLeadStatus(
      leadId,
      newStatus
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
      setMovingLeadId(null);
      return;
    }

    setLeads((currentLeads) =>
      currentLeads.map((lead) =>
        lead.id === leadId ? data : lead
      )
    );

    setMovingLeadId(null);
  }

  function handleDragStart(event, leadId) {
    setDraggedLeadId(leadId);

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", leadId);
  }

  function handleDragEnd() {
    setDraggedLeadId(null);
    setDragOverStage("");
  }

  function handleDragOver(event, stageName) {
    event.preventDefault();

    event.dataTransfer.dropEffect = "move";
    setDragOverStage(stageName);
  }

  async function handleDrop(event, stageName) {
    event.preventDefault();

    const leadId =
      event.dataTransfer.getData("text/plain") ||
      draggedLeadId;

    setDraggedLeadId(null);
    setDragOverStage("");

    if (!leadId) {
      return;
    }

    await moveLead(leadId, stageName);
  }

  return (
    <AppLayout>
      <section className="pipeline-page">
        <div className="pipeline-page-header">
          <div>
            <p className="page-eyebrow">
              Sales workflow
            </p>

            <h1>Pipeline</h1>

            <p>
              Drag leads between stages to update their sales
              status.
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="pipeline-error-message">
            {errorMessage}
          </div>
        )}

        <section className="pipeline-summary-grid">
          <article className="pipeline-summary-card">
            <span>Total leads</span>
            <strong>{leads.length}</strong>
          </article>

          <article className="pipeline-summary-card">
            <span>Pipeline value</span>
            <strong>
              {formatCurrency(totalPipelineValue)}
            </strong>
          </article>

          <article className="pipeline-summary-card">
            <span>Won value</span>
            <strong>{formatCurrency(wonValue)}</strong>
          </article>

          <article className="pipeline-summary-card">
            <span>Win rate</span>
            <strong>{winRate}%</strong>
          </article>
        </section>

        <div className="pipeline-toolbar">
          <div className="pipeline-search">
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
        </div>

        {loading ? (
          <div className="pipeline-loading">
            <div className="route-loading-spinner" />
            <p>Loading pipeline...</p>
          </div>
        ) : (
          <section className="kanban-board">
            {pipelineStages.map((stage) => {
              const stageLeads = filteredLeads.filter(
                (lead) => lead.status === stage.name
              );

              const stageValue = stageLeads.reduce(
                (total, lead) =>
                  total + Number(lead.value || 0),
                0
              );

              return (
                <article
                  className={`kanban-column ${
                    dragOverStage === stage.name
                      ? "drag-over"
                      : ""
                  }`}
                  key={stage.name}
                  onDragOver={(event) =>
                    handleDragOver(event, stage.name)
                  }
                  onDragLeave={() =>
                    setDragOverStage("")
                  }
                  onDrop={(event) =>
                    handleDrop(event, stage.name)
                  }
                >
                  <div
                    className={`kanban-stage-line ${stage.className}`}
                  />

                  <div className="kanban-column-header">
                    <div>
                      <div className="kanban-title-row">
                        <span
                          className={`kanban-stage-dot ${stage.className}`}
                        />

                        <h2>{stage.name}</h2>
                      </div>

                      <span>
                        {stageLeads.length}{" "}
                        {stageLeads.length === 1
                          ? "lead"
                          : "leads"}
                      </span>
                    </div>

                    <strong>
                      {formatCurrency(stageValue)}
                    </strong>
                  </div>

                  <div className="kanban-column-body">
                    {stageLeads.map((lead) => (
                      <article
                        className={`deal-card ${
                          draggedLeadId === lead.id
                            ? "dragging"
                            : ""
                        } ${
                          movingLeadId === lead.id
                            ? "saving"
                            : ""
                        }`}
                        key={lead.id}
                        draggable={movingLeadId !== lead.id}
                        onDragStart={(event) =>
                          handleDragStart(event, lead.id)
                        }
                        onDragEnd={handleDragEnd}
                      >
                        <div className="deal-card-top">
                          <div className="deal-avatar">
                            {getInitials(lead.name)}
                          </div>

                          <GripVertical
                            className="deal-drag-icon"
                            size={18}
                          />
                        </div>

                        <div className="deal-card-content">
                          <h3>{lead.name}</h3>

                          <p>
                            <Building2 size={14} />
                            {lead.company}
                          </p>
                        </div>

                        <div className="deal-value">
                          <DollarSign size={15} />
                          {formatCurrency(lead.value)}
                        </div>

                        <div className="deal-card-meta">
                          <span
                            className={`deal-priority ${lead.priority.toLowerCase()}`}
                          >
                            {lead.priority}
                          </span>

                          <span className="deal-owner">
                            <User size={14} />
                            {lead.assigned_to ||
                              "Unassigned"}
                          </span>
                        </div>

                        <div className="deal-source-row">
                          <Target size={13} />
                          {lead.source}
                        </div>

                        {movingLeadId === lead.id && (
                          <div className="deal-saving-message">
                            Saving status...
                          </div>
                        )}
                      </article>
                    ))}

                    {stageLeads.length === 0 && (
                      <div className="kanban-empty">
                        <Target size={24} />
                        <p>Drop a lead here</p>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </section>
    </AppLayout>
  );
}

export default Pipeline;
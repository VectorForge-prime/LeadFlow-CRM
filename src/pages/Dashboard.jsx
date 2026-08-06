import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Target,
  TrendingUp,
  UserPlus,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

import AppLayout from "../components/layout/AppLayout";
import { useAuth } from "../context/AuthContext";
import { getDashboardData } from "../services/dashboardService";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
);

const monthLabels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

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
];

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) {
    return "No deadline";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T12:00:00`));
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

function Dashboard() {
  const { user } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!user?.id) {
      return undefined;
    }

    let isMounted = true;

    async function loadDashboard() {
      setLoading(true);
      setErrorMessage("");

      const { data, error } = await getDashboardData(user.id);

      if (!isMounted) {
        return;
      }

      if (error) {
        setCustomers([]);
        setLeads([]);
        setTasks([]);
        setErrorMessage(error.message);
      } else {
        setCustomers(data?.customers ?? []);
        setLeads(data?.leads ?? []);
        setTasks(data?.tasks ?? []);
      }

      setLoading(false);
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const dashboardData = useMemo(() => {
    const customerRevenue = customers.reduce(
      (total, customer) =>
        total + Number(customer.revenue || 0),
      0
    );

    const totalLeadValue = leads.reduce(
      (total, lead) => total + Number(lead.value || 0),
      0
    );

    const wonLeads = leads.filter(
      (lead) => lead.status === "Won"
    );

    const wonRevenue = wonLeads.reduce(
      (total, lead) => total + Number(lead.value || 0),
      0
    );

    const activeLeads = leads.filter(
      (lead) => !["Won", "Lost"].includes(lead.status)
    );

    const conversionRate =
      leads.length === 0
        ? 0
        : Math.round((wonLeads.length / leads.length) * 100);

    const completedTasks = tasks.filter(
      (task) => task.completed
    );

    const pendingTasks = tasks.filter(
      (task) => !task.completed
    );

    const overdueTasks = pendingTasks.filter((task) => {
      if (!task.due_date) {
        return false;
      }

      const deadline = new Date(`${task.due_date}T23:59:59`);
      return deadline < new Date();
    });

    const monthlyRevenue = Array.from(
      { length: 12 },
      () => 0
    );

    customers.forEach((customer) => {
      if (!customer.created_at) {
        return;
      }

      const date = new Date(customer.created_at);

      if (date.getFullYear() !== new Date().getFullYear()) {
        return;
      }

      monthlyRevenue[date.getMonth()] += Number(
        customer.revenue || 0
      );
    });

    wonLeads.forEach((lead) => {
      const dateValue = lead.updated_at || lead.created_at;

      if (!dateValue) {
        return;
      }

      const date = new Date(dateValue);

      if (date.getFullYear() !== new Date().getFullYear()) {
        return;
      }

      monthlyRevenue[date.getMonth()] += Number(
        lead.value || 0
      );
    });

    return {
      customerRevenue,
      totalLeadValue,
      wonRevenue,
      activeLeads,
      wonLeads,
      conversionRate,
      completedTasks,
      pendingTasks,
      overdueTasks,
      monthlyRevenue,
    };
  }, [customers, leads, tasks]);

  const recentLeads = [...leads]
    .sort(
      (firstLead, secondLead) =>
        new Date(secondLead.created_at) -
        new Date(firstLead.created_at)
    )
    .slice(0, 5);

  const priorityTasks = [...dashboardData.pendingTasks]
    .sort((firstTask, secondTask) => {
      const priorityWeight = {
        High: 1,
        Medium: 2,
        Low: 3,
      };

      const priorityDifference =
        priorityWeight[firstTask.priority] -
        priorityWeight[secondTask.priority];

      if (priorityDifference !== 0) {
        return priorityDifference;
      }

      if (!firstTask.due_date) {
        return 1;
      }

      if (!secondTask.due_date) {
        return -1;
      }

      return firstTask.due_date.localeCompare(
        secondTask.due_date
      );
    })
    .slice(0, 4);

  const pipelineData = pipelineStages.map((stage) => {
    const stageLeads = leads.filter(
      (lead) => lead.status === stage.name
    );

    const stageValue = stageLeads.reduce(
      (total, lead) => total + Number(lead.value || 0),
      0
    );

    return {
      ...stage,
      count: stageLeads.length,
      value: stageValue,
      percentage:
        leads.length === 0
          ? 0
          : Math.round((stageLeads.length / leads.length) * 100),
    };
  });

  const chartData = {
    labels: monthLabels,
    datasets: [
      {
        label: "Revenue",
        data: dashboardData.monthlyRevenue,
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.10)",
        pointBackgroundColor: "#2563eb",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 6,
        borderWidth: 3,
        fill: true,
        tension: 0.42,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: "index",
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        displayColors: false,
        backgroundColor: "#0f172a",
        padding: 12,
        cornerRadius: 10,
        callbacks: {
          label(context) {
            return formatCurrency(context.parsed.y);
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: "#94a3b8",
          font: {
            size: 10,
          },
        },
      },
      y: {
        beginAtZero: true,
        border: {
          display: false,
        },
        grid: {
          color: "#eef2f7",
        },
        ticks: {
          color: "#94a3b8",
          font: {
            size: 10,
          },
          callback(value) {
            if (value >= 1000) {
              return `$${Math.round(value / 1000)}k`;
            }

            return `$${value}`;
          },
        },
      },
    },
  };

  const stats = [
    {
      label: "Customer revenue",
      value: formatCurrency(
        dashboardData.customerRevenue
      ),
      description: "Revenue from customers",
      trend: `${customers.length} customers`,
      icon: CircleDollarSign,
      className: "blue",
    },
    {
      label: "Active leads",
      value: dashboardData.activeLeads.length,
      description: "Open sales opportunities",
      trend: `${formatCurrency(
        dashboardData.totalLeadValue
      )} potential`,
      icon: UserPlus,
      className: "purple",
    },
    {
      label: "Conversion rate",
      value: `${dashboardData.conversionRate}%`,
      description: "Leads converted to won",
      trend: `${dashboardData.wonLeads.length} won leads`,
      icon: TrendingUp,
      className: "green",
    },
    {
      label: "Pending tasks",
      value: dashboardData.pendingTasks.length,
      description: "Activities requiring attention",
      trend: `${dashboardData.overdueTasks.length} overdue`,
      icon: CalendarClock,
      className: "orange",
    },
  ];

  if (loading) {
    return (
      <AppLayout>
        <div className="dashboard-loading">
          <div className="route-loading-spinner" />
          <p>Preparing your workspace...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <section className="premium-dashboard">
        <div className="dashboard-welcome-banner">
          <div>
            <span className="dashboard-welcome-badge">
              <BriefcaseBusiness size={14} />
              Sales overview
            </span>

            <h1>
              Grow your pipeline with better decisions.
            </h1>

            <p>
              Review your live CRM performance, manage
              opportunities and prioritize today&apos;s work.
            </p>
          </div>

          <div className="dashboard-welcome-actions">
            <Link
              className="dashboard-secondary-action"
              to="/analytics"
            >
              View analytics
            </Link>

            <Link
              className="dashboard-primary-action"
              to="/leads"
            >
              <UserPlus size={17} />
              Add new lead
            </Link>
          </div>

          <div className="dashboard-banner-glow dashboard-banner-glow-one" />
          <div className="dashboard-banner-glow dashboard-banner-glow-two" />
        </div>

        {errorMessage && (
          <div className="dashboard-error-message">
            {errorMessage}
          </div>
        )}

        <section className="dashboard-premium-stats">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <article
                className="dashboard-premium-stat-card"
                key={stat.label}
              >
                <div
                  className={`dashboard-stat-icon ${stat.className}`}
                >
                  <Icon size={21} />
                </div>

                <div className="dashboard-stat-top">
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                </div>

                <p>{stat.description}</p>

                <div className="dashboard-stat-footer">
                  <TrendingUp size={13} />
                  <span>{stat.trend}</span>
                </div>
              </article>
            );
          })}
        </section>

        <section className="dashboard-primary-grid">
          <article className="premium-dashboard-card dashboard-revenue-panel">
            <div className="premium-card-header">
              <div>
                <span className="premium-card-eyebrow">
                  Performance
                </span>

                <h2>Revenue overview</h2>

                <p>
                  Customer and won-deal revenue during{" "}
                  {new Date().getFullYear()}.
                </p>
              </div>

              <div className="dashboard-revenue-total">
                <span>Total recorded</span>
                <strong>
                  {formatCurrency(
                    dashboardData.customerRevenue +
                      dashboardData.wonRevenue
                  )}
                </strong>
              </div>
            </div>

            <div className="dashboard-premium-chart">
              <Line
                data={chartData}
                options={chartOptions}
              />
            </div>
          </article>

          <article className="premium-dashboard-card dashboard-pipeline-panel">
            <div className="premium-card-header">
              <div>
                <span className="premium-card-eyebrow">
                  Sales funnel
                </span>

                <h2>Pipeline status</h2>

                <p>Current opportunity distribution.</p>
              </div>

              <Link
                className="premium-card-link"
                to="/pipeline"
              >
                View pipeline
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="dashboard-pipeline-list">
              {pipelineData.map((stage) => (
                <div
                  className="dashboard-pipeline-item"
                  key={stage.name}
                >
                  <div className="dashboard-pipeline-item-top">
                    <div>
                      <span
                        className={`dashboard-pipeline-dot ${stage.className}`}
                      />

                      <strong>{stage.name}</strong>
                    </div>

                    <span>{formatCurrency(stage.value)}</span>
                  </div>

                  <div className="dashboard-pipeline-meta">
                    <span>
                      {stage.count}{" "}
                      {stage.count === 1 ? "lead" : "leads"}
                    </span>

                    <span>{stage.percentage}%</span>
                  </div>

                  <div className="dashboard-pipeline-track">
                    <span
                      className={stage.className}
                      style={{
                        width: `${Math.max(
                          stage.percentage,
                          stage.count > 0 ? 5 : 0
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="dashboard-secondary-premium-grid">
          <article className="premium-dashboard-card">
            <div className="premium-card-header">
              <div>
                <span className="premium-card-eyebrow">
                  Opportunities
                </span>

                <h2>Recent leads</h2>

                <p>Latest contacts added to your CRM.</p>
              </div>

              <Link
                className="premium-card-link"
                to="/leads"
              >
                View all
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="dashboard-recent-leads">
              {recentLeads.map((lead) => (
                <article
                  className="dashboard-recent-lead"
                  key={lead.id}
                >
                  <div className="dashboard-recent-avatar">
                    {getInitials(lead.name)}
                  </div>

                  <div className="dashboard-recent-lead-copy">
                    <strong>{lead.name}</strong>
                    <span>{lead.company}</span>
                  </div>

                  <div className="dashboard-recent-lead-value">
                    <strong>
                      {formatCurrency(lead.value)}
                    </strong>

                    <span
                      className={`dashboard-lead-status ${lead.status
                        .toLowerCase()
                        .replaceAll(" ", "-")}`}
                    >
                      {lead.status}
                    </span>
                  </div>
                </article>
              ))}

              {recentLeads.length === 0 && (
                <div className="dashboard-premium-empty">
                  <Target size={30} />
                  <strong>No leads yet</strong>
                  <span>
                    Add your first lead to populate this list.
                  </span>
                </div>
              )}
            </div>
          </article>

          <article className="premium-dashboard-card">
            <div className="premium-card-header">
              <div>
                <span className="premium-card-eyebrow">
                  Today&apos;s focus
                </span>

                <h2>Priority tasks</h2>

                <p>Activities requiring your attention.</p>
              </div>

              <Link
                className="premium-card-link"
                to="/tasks"
              >
                View all
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="dashboard-priority-tasks">
              {priorityTasks.map((task) => (
                <article
                  className="dashboard-priority-task"
                  key={task.id}
                >
                  <div className="dashboard-task-checkbox">
                    <Clock3 size={16} />
                  </div>

                  <div className="dashboard-task-copy">
                    <strong>{task.title}</strong>

                    <span>
                      {formatDate(task.due_date)} ·{" "}
                      {task.assigned_to || "Unassigned"}
                    </span>
                  </div>

                  <span
                    className={`dashboard-task-priority ${task.priority.toLowerCase()}`}
                  >
                    {task.priority}
                  </span>
                </article>
              ))}

              {priorityTasks.length === 0 && (
                <div className="dashboard-premium-empty">
                  <CheckCircle2 size={30} />
                  <strong>You&apos;re all caught up</strong>
                  <span>No pending tasks require attention.</span>
                </div>
              )}
            </div>
          </article>

          <article className="premium-dashboard-card dashboard-workspace-summary">
            <div className="premium-card-header">
              <div>
                <span className="premium-card-eyebrow">
                  Workspace
                </span>

                <h2>CRM progress</h2>

                <p>Your current activity summary.</p>
              </div>
            </div>

            <div className="dashboard-summary-content">
              <div className="dashboard-summary-ring">
                <div>
                  <strong>
                    {tasks.length === 0
                      ? 0
                      : Math.round(
                          (dashboardData.completedTasks.length /
                            tasks.length) *
                            100
                        )}
                    %
                  </strong>

                  <span>Task completion</span>
                </div>
              </div>

              <div className="dashboard-summary-metrics">
                <div>
                  <UsersRound size={16} />
                  <span>Customers</span>
                  <strong>{customers.length}</strong>
                </div>

                <div>
                  <Target size={16} />
                  <span>Total leads</span>
                  <strong>{leads.length}</strong>
                </div>

                <div>
                  <CheckCircle2 size={16} />
                  <span>Tasks completed</span>
                  <strong>
                    {dashboardData.completedTasks.length}
                  </strong>
                </div>
              </div>
            </div>
          </article>
        </section>
      </section>
    </AppLayout>
  );
}

export default Dashboard;
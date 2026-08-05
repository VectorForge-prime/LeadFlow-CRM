import { useEffect, useMemo, useState } from "react";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  ArrowUpRight,
  CheckCircle2,
  DollarSign,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

import AppLayout from "../components/layout/AppLayout";
import { useAuth } from "../context/AuthContext";
import { getDashboardData } from "../services/dashboardService";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
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

const leadSources = [
  "Website",
  "Google Ads",
  "LinkedIn",
  "Referral",
  "Cold Email",
  "Social Media",
];

const leadStatuses = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal",
  "Won",
  "Lost",
];

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function getRecordDate(record) {
  return record.updated_at || record.created_at;
}

function Analytics() {
  const { user } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear()
  );

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!user?.id) {
      return undefined;
    }

    let isMounted = true;

    async function loadAnalytics() {
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
        setCustomers(data.customers ?? []);
        setLeads(data.leads ?? []);
        setTasks(data.tasks ?? []);
      }

      setLoading(false);
    }

    loadAnalytics();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const availableYears = useMemo(() => {
    const years = new Set([new Date().getFullYear()]);

    [...customers, ...leads, ...tasks].forEach((record) => {
      const dateValue = getRecordDate(record);

      if (!dateValue) {
        return;
      }

      years.add(new Date(dateValue).getFullYear());
    });

    return [...years].sort((firstYear, secondYear) => {
      return secondYear - firstYear;
    });
  }, [customers, leads, tasks]);

  const analytics = useMemo(() => {
    const filteredCustomers = customers.filter((customer) => {
      if (!customer.created_at) {
        return false;
      }

      return (
        new Date(customer.created_at).getFullYear() ===
        selectedYear
      );
    });

    const filteredLeads = leads.filter((lead) => {
      const dateValue = getRecordDate(lead);

      if (!dateValue) {
        return false;
      }

      return (
        new Date(dateValue).getFullYear() === selectedYear
      );
    });

    const filteredTasks = tasks.filter((task) => {
      const dateValue = getRecordDate(task);

      if (!dateValue) {
        return false;
      }

      return (
        new Date(dateValue).getFullYear() === selectedYear
      );
    });

    const totalCustomerRevenue = customers.reduce(
      (total, customer) =>
        total + Number(customer.revenue || 0),
      0
    );

    const wonLeads = leads.filter(
      (lead) => lead.status === "Won"
    );

    const wonLeadRevenue = wonLeads.reduce(
      (total, lead) => total + Number(lead.value || 0),
      0
    );

    const totalRevenue =
      totalCustomerRevenue + wonLeadRevenue;

    const conversionRate =
      leads.length === 0
        ? 0
        : Math.round((wonLeads.length / leads.length) * 100);

    const completedTasks = tasks.filter(
      (task) => task.completed
    ).length;

    const taskCompletionRate =
      tasks.length === 0
        ? 0
        : Math.round((completedTasks / tasks.length) * 100);

    const monthlyRevenue = Array.from(
      { length: 12 },
      () => 0
    );

    filteredCustomers.forEach((customer) => {
      const createdDate = new Date(customer.created_at);

      monthlyRevenue[createdDate.getMonth()] += Number(
        customer.revenue || 0
      );
    });

    filteredLeads
      .filter((lead) => lead.status === "Won")
      .forEach((lead) => {
        const dateValue = getRecordDate(lead);

        if (!dateValue) {
          return;
        }

        const leadDate = new Date(dateValue);

        monthlyRevenue[leadDate.getMonth()] += Number(
          lead.value || 0
        );
      });

    const monthlyLeads = Array.from(
      { length: 12 },
      () => 0
    );

    filteredLeads.forEach((lead) => {
      const dateValue = getRecordDate(lead);

      if (!dateValue) {
        return;
      }

      const leadDate = new Date(dateValue);

      monthlyLeads[leadDate.getMonth()] += 1;
    });

    const sourceStats = leadSources.map((source) => {
      const sourceLeads = leads.filter(
        (lead) => lead.source === source
      );

      const sourceWonLeads = sourceLeads.filter(
        (lead) => lead.status === "Won"
      );

      const revenue = sourceWonLeads.reduce(
        (total, lead) => total + Number(lead.value || 0),
        0
      );

      const conversion =
        sourceLeads.length === 0
          ? 0
          : Math.round(
              (sourceWonLeads.length / sourceLeads.length) *
                100
            );

      return {
        source,
        leads: sourceLeads.length,
        won: sourceWonLeads.length,
        conversion,
        revenue,
      };
    });

    const statusStats = leadStatuses.map((status) => {
      return leads.filter((lead) => lead.status === status)
        .length;
    });

    return {
      filteredCustomers,
      filteredLeads,
      filteredTasks,
      totalRevenue,
      totalCustomerRevenue,
      wonLeadRevenue,
      conversionRate,
      taskCompletionRate,
      completedTasks,
      monthlyRevenue,
      monthlyLeads,
      sourceStats,
      statusStats,
    };
  }, [
    customers,
    leads,
    tasks,
    selectedYear,
  ]);

  const revenueChartData = {
    labels: monthLabels,
    datasets: [
      {
        label: "Revenue",
        data: analytics.monthlyRevenue,
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.10)",
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointBackgroundColor: "#2563eb",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const leadsChartData = {
    labels: monthLabels,
    datasets: [
      {
        label: "Leads",
        data: analytics.monthlyLeads,
        backgroundColor: "#7c3aed",
        borderRadius: 7,
        borderSkipped: false,
        maxBarThickness: 42,
      },
    ],
  };

  const sourceChartData = {
    labels: analytics.sourceStats.map(
      (item) => item.source
    ),
    datasets: [
      {
        label: "Leads",
        data: analytics.sourceStats.map(
          (item) => item.leads
        ),
        backgroundColor: [
          "#2563eb",
          "#7c3aed",
          "#ea580c",
          "#16a34a",
          "#0ea5e9",
          "#db2777",
        ],
        borderRadius: 8,
        borderSkipped: false,
        maxBarThickness: 48,
      },
    ],
  };

  const statusChartData = {
    labels: leadStatuses,
    datasets: [
      {
        data: analytics.statusStats,
        backgroundColor: [
          "#2563eb",
          "#7c3aed",
          "#ea580c",
          "#0ea5e9",
          "#16a34a",
          "#dc2626",
        ],
        borderWidth: 0,
        hoverOffset: 5,
      },
    ],
  };

  const lineOptions = {
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
        backgroundColor: "#111827",
        padding: 12,
        displayColors: false,
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
        ticks: {
          color: "#9ca3af",
        },
        border: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "#eef2f7",
        },
        ticks: {
          color: "#9ca3af",
          callback(value) {
            return formatCurrency(value);
          },
        },
        border: {
          display: false,
        },
      },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#111827",
        padding: 12,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#9ca3af",
        },
        border: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "#eef2f7",
        },
        ticks: {
          color: "#9ca3af",
          precision: 0,
        },
        border: {
          display: false,
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "68%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          padding: 17,
          color: "#64748b",
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        backgroundColor: "#111827",
        padding: 12,
      },
    },
  };

  const metrics = [
    {
      title: "Total Revenue",
      value: formatCurrency(analytics.totalRevenue),
      description: "Customers and won leads",
      icon: DollarSign,
      className: "blue",
    },
    {
      title: "Customers",
      value: customers.length,
      description: "Saved customer records",
      icon: Users,
      className: "purple",
    },
    {
      title: "Leads",
      value: leads.length,
      description: "Total opportunities",
      icon: Target,
      className: "orange",
    },
    {
      title: "Conversion Rate",
      value: `${analytics.conversionRate}%`,
      description: "Leads converted to won",
      icon: TrendingUp,
      className: "green",
    },
  ];

  if (loading) {
    return (
      <AppLayout>
        <div className="analytics-loading">
          <div className="route-loading-spinner" />
          <p>Loading analytics...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <section className="analytics-page">
        <div className="analytics-header">
          <div>
            <p className="page-eyebrow">
              Business intelligence
            </p>

            <h1>Analytics</h1>

            <p>
              Monitor live revenue, leads, customers and sales
              performance.
            </p>
          </div>

          <select
            className="analytics-period-select"
            value={selectedYear}
            onChange={(event) =>
              setSelectedYear(Number(event.target.value))
            }
          >
            {availableYears.map((year) => (
              <option value={year} key={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {errorMessage && (
          <div className="analytics-error-message">
            {errorMessage}
          </div>
        )}

        <section className="analytics-metrics-grid">
          {metrics.map((metric) => {
            const Icon = metric.icon;

            return (
              <article
                className="analytics-metric-card"
                key={metric.title}
              >
                <div
                  className={`analytics-metric-icon ${metric.className}`}
                >
                  <Icon size={22} />
                </div>

                <div className="analytics-metric-content">
                  <span>{metric.title}</span>
                  <strong>{metric.value}</strong>

                  <p>
                    <ArrowUpRight size={14} />
                    {metric.description}
                  </p>
                </div>
              </article>
            );
          })}
        </section>

        <section className="analytics-charts-grid">
          <article className="analytics-card analytics-revenue-card">
            <div className="analytics-card-header">
              <div>
                <h2>Revenue Growth</h2>

                <p>
                  Monthly recorded revenue during{" "}
                  {selectedYear}
                </p>
              </div>

              <span className="analytics-card-badge">
                Live data
              </span>
            </div>

            <div className="analytics-chart-large">
              <Line
                data={revenueChartData}
                options={lineOptions}
              />
            </div>
          </article>

          <article className="analytics-card">
            <div className="analytics-card-header">
              <div>
                <h2>Lead Statuses</h2>

                <p>
                  Current distribution across the pipeline
                </p>
              </div>
            </div>

            <div className="analytics-chart-small">
              {leads.length > 0 ? (
                <Doughnut
                  data={statusChartData}
                  options={doughnutOptions}
                />
              ) : (
                <div className="analytics-empty-chart">
                  <Target size={34} />
                  <strong>No leads available</strong>
                  <span>
                    Add leads to generate this chart.
                  </span>
                </div>
              )}
            </div>
          </article>
        </section>

        <section className="analytics-charts-grid analytics-second-charts">
          <article className="analytics-card">
            <div className="analytics-card-header">
              <div>
                <h2>Monthly Leads</h2>

                <p>
                  New and updated leads during{" "}
                  {selectedYear}
                </p>
              </div>
            </div>

            <div className="analytics-chart-medium">
              <Bar
                data={leadsChartData}
                options={barOptions}
              />
            </div>
          </article>

          <article className="analytics-card">
            <div className="analytics-card-header">
              <div>
                <h2>Lead Sources</h2>

                <p>Opportunities acquired by channel</p>
              </div>
            </div>

            <div className="analytics-chart-medium">
              <Bar
                data={sourceChartData}
                options={barOptions}
              />
            </div>
          </article>
        </section>

        <section className="analytics-bottom-grid">
          <article className="analytics-card">
            <div className="analytics-card-header">
              <div>
                <h2>Source Performance</h2>

                <p>
                  Conversion and revenue by acquisition
                  channel
                </p>
              </div>
            </div>

            <div className="analytics-table-wrapper">
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Leads</th>
                    <th>Won</th>
                    <th>Conversion</th>
                    <th>Won revenue</th>
                  </tr>
                </thead>

                <tbody>
                  {analytics.sourceStats.map((item) => (
                    <tr key={item.source}>
                      <td>
                        <strong>{item.source}</strong>
                      </td>

                      <td>{item.leads}</td>

                      <td>{item.won}</td>

                      <td>
                        <span className="analytics-conversion-badge">
                          {item.conversion}%
                        </span>
                      </td>

                      <td className="analytics-revenue-value">
                        {formatCurrency(item.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="analytics-card">
            <div className="analytics-card-header">
              <div>
                <h2>Workspace Overview</h2>

                <p>Current performance indicators</p>
              </div>
            </div>

            <div className="analytics-overview-list">
              <div className="analytics-overview-item">
                <div className="analytics-overview-icon blue">
                  <DollarSign size={18} />
                </div>

                <div>
                  <span>Customer revenue</span>

                  <strong>
                    {formatCurrency(
                      analytics.totalCustomerRevenue
                    )}
                  </strong>
                </div>
              </div>

              <div className="analytics-overview-item">
                <div className="analytics-overview-icon green">
                  <TrendingUp size={18} />
                </div>

                <div>
                  <span>Won lead revenue</span>

                  <strong>
                    {formatCurrency(
                      analytics.wonLeadRevenue
                    )}
                  </strong>
                </div>
              </div>

              <div className="analytics-overview-item">
                <div className="analytics-overview-icon purple">
                  <CheckCircle2 size={18} />
                </div>

                <div>
                  <span>Completed tasks</span>

                  <strong>
                    {analytics.completedTasks} of{" "}
                    {tasks.length}
                  </strong>
                </div>
              </div>

              <div className="analytics-overview-item">
                <div className="analytics-overview-icon orange">
                  <Target size={18} />
                </div>

                <div>
                  <span>Task completion</span>

                  <strong>
                    {analytics.taskCompletionRate}%
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

export default Analytics;
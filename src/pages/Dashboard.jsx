import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Target,
} from "lucide-react";

import AppLayout from "../components/layout/AppLayout";
import PipelineSummary from "../components/dashboard/PipelineSummary";
import RevenueChart from "../components/dashboard/RevenueChart";
import StatsCards from "../components/dashboard/StatsCards";

import { useAuth } from "../context/AuthContext";
import { getDashboardData } from "../services/dashboardService";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
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
        setErrorMessage(error.message);
        setCustomers([]);
        setLeads([]);
        setTasks([]);
      } else {
        setCustomers(data.customers);
        setLeads(data.leads);
        setTasks(data.tasks);
      }

      setLoading(false);
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const metrics = useMemo(() => {
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

    const conversionRate =
      leads.length === 0
        ? 0
        : Math.round((wonLeads.length / leads.length) * 100);

    const pendingTasks = tasks.filter(
      (task) => !task.completed
    );

    return {
      customerRevenue,
      totalLeadValue,
      conversionRate,
      pendingTasks,
      completedTasks: tasks.filter(
        (task) => task.completed
      ).length,
    };
  }, [customers, leads, tasks]);

  const recentTasks = [...tasks]
    .filter((task) => !task.completed)
    .sort((firstTask, secondTask) => {
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

  if (loading) {
    return (
      <AppLayout>
        <div className="dashboard-loading">
          <div className="route-loading-spinner" />
          <p>Loading dashboard...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <section className="dashboard-page">
        <div className="dashboard-header">
          <div>
            <p className="dashboard-eyebrow">Overview</p>

            <h1>Dashboard</h1>

            <p className="dashboard-subtitle">
              Live business data from your LeadFlow workspace.
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="dashboard-error-message">
            {errorMessage}
          </div>
        )}

        <StatsCards
          customerRevenue={metrics.customerRevenue}
          totalCustomers={customers.length}
          totalLeads={leads.length}
          conversionRate={metrics.conversionRate}
        />

        <section className="dashboard-main-grid">
          <RevenueChart
            customers={customers}
            leads={leads}
          />

          <PipelineSummary leads={leads} />
        </section>

        <section className="dashboard-secondary-grid">
          <article className="dashboard-card dashboard-tasks-card">
            <div className="dashboard-card-header">
              <div>
                <h2>Upcoming Tasks</h2>
                <p>Next actions requiring attention</p>
              </div>
            </div>

            <div className="dashboard-task-list">
              {recentTasks.map((task) => (
                <div
                  className="dashboard-task-item"
                  key={task.id}
                >
                  <div className="dashboard-task-icon">
                    <Clock3 size={17} />
                  </div>

                  <div>
                    <strong>{task.title}</strong>

                    <span>
                      {task.due_date
                        ? new Intl.DateTimeFormat("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }).format(
                            new Date(
                              `${task.due_date}T12:00:00`
                            )
                          )
                        : "No deadline"}
                    </span>
                  </div>

                  <span
                    className={`dashboard-task-priority ${task.priority.toLowerCase()}`}
                  >
                    {task.priority}
                  </span>
                </div>
              ))}

              {recentTasks.length === 0 && (
                <div className="dashboard-empty-state">
                  <CheckCircle2 size={30} />
                  <strong>No pending tasks</strong>
                  <span>Your work is up to date.</span>
                </div>
              )}
            </div>
          </article>

          <article className="dashboard-card dashboard-overview-card">
            <div className="dashboard-card-header">
              <div>
                <h2>Sales Overview</h2>
                <p>Current workspace totals</p>
              </div>
            </div>

            <div className="dashboard-overview-list">
              <div>
                <span>
                  <Target size={17} />
                  Lead value
                </span>

                <strong>
                  {formatCurrency(metrics.totalLeadValue)}
                </strong>
              </div>

              <div>
                <span>
                  <Clock3 size={17} />
                  Pending tasks
                </span>

                <strong>
                  {metrics.pendingTasks.length}
                </strong>
              </div>

              <div>
                <span>
                  <CheckCircle2 size={17} />
                  Completed tasks
                </span>

                <strong>
                  {metrics.completedTasks}
                </strong>
              </div>

              <div>
                <span>
                  <Target size={17} />
                  Won leads
                </span>

                <strong>
                  {
                    leads.filter(
                      (lead) => lead.status === "Won"
                    ).length
                  }
                </strong>
              </div>
            </div>
          </article>
        </section>
      </section>
    </AppLayout>
  );
}

export default Dashboard;
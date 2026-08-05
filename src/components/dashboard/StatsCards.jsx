import {
  DollarSign,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function StatsCards({
  customerRevenue,
  totalCustomers,
  totalLeads,
  conversionRate,
}) {
  const stats = [
    {
      title: "Customer Revenue",
      value: formatCurrency(customerRevenue),
      description: "from saved customers",
      icon: DollarSign,
      className: "revenue",
    },
    {
      title: "Customers",
      value: totalCustomers,
      description: "total customers",
      icon: Users,
      className: "customers",
    },
    {
      title: "Active Leads",
      value: totalLeads,
      description: "total sales leads",
      icon: UserPlus,
      className: "leads",
    },
    {
      title: "Conversion Rate",
      value: `${conversionRate}%`,
      description: "won leads",
      icon: TrendingUp,
      className: "conversion",
    },
  ];

  return (
    <section className="stats-grid">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <article className="stat-card" key={stat.title}>
            <div className="stat-card-header">
              <div>
                <p className="stat-title">{stat.title}</p>
                <h2 className="stat-value">{stat.value}</h2>
              </div>

              <div className={`stat-icon ${stat.className}`}>
                <Icon size={22} strokeWidth={2.1} />
              </div>
            </div>

            <div className="stat-footer">
              <span className="stat-description">
                {stat.description}
              </span>
            </div>
          </article>
        );
      })}
    </section>
  );
}

export default StatsCards;
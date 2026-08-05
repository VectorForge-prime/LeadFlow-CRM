import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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

function RevenueChart({ customers, leads }) {
  const currentYear = new Date().getFullYear();

  const monthlyRevenue = Array.from(
    { length: 12 },
    () => 0
  );

  customers.forEach((customer) => {
    if (!customer.created_at) {
      return;
    }

    const createdDate = new Date(customer.created_at);

    if (createdDate.getFullYear() !== currentYear) {
      return;
    }

    monthlyRevenue[createdDate.getMonth()] +=
      Number(customer.revenue || 0);
  });

  leads
    .filter((lead) => lead.status === "Won")
    .forEach((lead) => {
      if (!lead.updated_at && !lead.created_at) {
        return;
      }

      const date = new Date(
        lead.updated_at || lead.created_at
      );

      if (date.getFullYear() !== currentYear) {
        return;
      }

      monthlyRevenue[date.getMonth()] +=
        Number(lead.value || 0);
    });

  const data = {
    labels: monthLabels,
    datasets: [
      {
        label: "Revenue",
        data: monthlyRevenue,
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

  const options = {
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
            return `$${context.parsed.y.toLocaleString()}`;
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
            return `$${value / 1000}k`;
          },
        },
        border: {
          display: false,
        },
      },
    },
  };

  return (
    <article className="dashboard-card revenue-card">
      <div className="dashboard-card-header">
        <div>
          <h2>Revenue Overview</h2>
          <p>Revenue recorded during {currentYear}</p>
        </div>
      </div>

      <div className="chart-container">
        <Line data={data} options={options} />
      </div>
    </article>
  );
}

export default RevenueChart;
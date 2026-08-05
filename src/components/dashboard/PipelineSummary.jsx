function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

const stageConfig = [
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

function PipelineSummary({ leads }) {
  const totalLeads = leads.length || 1;

  const stages = stageConfig.map((stage) => {
    const stageLeads = leads.filter(
      (lead) => lead.status === stage.name
    );

    const value = stageLeads.reduce(
      (total, lead) => total + Number(lead.value || 0),
      0
    );

    return {
      ...stage,
      count: stageLeads.length,
      value,
      percentage: Math.round(
        (stageLeads.length / totalLeads) * 100
      ),
    };
  });

  return (
    <article className="dashboard-card pipeline-card">
      <div className="dashboard-card-header">
        <div>
          <h2>Sales Pipeline</h2>
          <p>Current lead distribution</p>
        </div>
      </div>

      <div className="pipeline-list">
        {stages.map((stage) => (
          <div className="pipeline-item" key={stage.name}>
            <div className="pipeline-item-top">
              <div>
                <strong>{stage.name}</strong>
                <span>
                  {stage.count}{" "}
                  {stage.count === 1 ? "lead" : "leads"}
                </span>
              </div>

              <strong>{formatCurrency(stage.value)}</strong>
            </div>

            <div className="pipeline-progress">
              <span
                className={`pipeline-progress-bar ${stage.className}`}
                style={{
                  width: `${Math.max(stage.percentage, 2)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

export default PipelineSummary;
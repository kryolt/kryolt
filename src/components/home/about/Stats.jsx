import "./Stats.css";

const STATS = [
    {
        value: "1",
        label: "Upload to full dashboard",
    },
    {
        value: "Minutes",
        label: "Not weeks, to first insight",
    },
    {
        value: "0",
        label: "Formulas or SQL required",
    },
    {
        value: "24/7",
        label: "Insights that keep watching your data",
    },
];

function Stats() {
    return (
        <section className="about-stats">
            <div className="stats-container">

                {STATS.map((stat) => (
                    <div className="stat-item" key={stat.label}>
                        <strong>{stat.value}</strong>
                        <span>{stat.label}</span>
                    </div>
                ))}

            </div>
        </section>
    );
}

export default Stats;
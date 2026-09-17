import "./DashboardPreview.css";
import { APP } from "../../config/appConfig";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Wallet, Users, ArrowUpRight, Rocket } from "lucide-react";

const PREVIEW_METRICS = [
    { icon: TrendingUp, label: "Sales", value: "₹61.3L", trend: "+18%" },
    { icon: Wallet, label: "Profit", value: "₹11.7L", trend: "+9%" },
    { icon: Users, label: "Customers", value: "150", trend: "+12%" },
];

function DashboardPreview() {
    const navigate = useNavigate();

    return (
        <section className="dashboard-preview-section" aria-label="Dashboard preview">
            <div className="preview-left">
                <span className="preview-badge">
                    <Rocket size={14} strokeWidth={2.5} />
                    LIVE DASHBOARD
                </span>

                <h2>
                    Beautiful Dashboard
                    <br />
                    <span> AI Powered Analytics</span>

                </h2>

                <p>
                    Every number you need, in one place. <strong>{APP.name}</strong> reads
                    your CSV and builds interactive dashboards, KPI tracking and AI insights
                    automatically — so you can spend less time formatting data and more time
                    acting on it.
                </p>

                <button
                    className="preview-btn"
                    type="button"
                    onClick={() => navigate("/features")}
                >
                    Explore {APP.name}
                    <ArrowUpRight size={18} strokeWidth={2.5} />
                </button>
            </div>

            <div className="preview-right">
                <div className="dashboard-window" role="img" aria-label="Sample dashboard with sales, profit, and customer metrics">
                    <div className="window-top">
                        <div className="window-dots">
                            <span className="red"></span>
                            <span className="yellow"></span>
                            <span className="green"></span>
                        </div>
                        <span className="window-title">{APP.name} Analytics</span>
                    </div>

                    <div className="window-content">
                        {PREVIEW_METRICS.map(({ icon: Icon, label, value, trend }) => (
                            <div className="mini-card" key={label}>
                                <div className="mini-card-top">
                                    <span className="mini-icon">
                                        <Icon size={16} strokeWidth={2.2} />
                                    </span>
                                    <span className="mini-trend">{trend}</span>
                                </div>
                                <span className="mini-label">{label}</span>
                                <h3>{value}</h3>
                            </div>
                        ))}

                        <div className="graph-box">
                            <div className="graph-header">
                                <span>Revenue Trend</span>
                                <span className="graph-badge">This Month</span>
                            </div>
                            <div className="graph-bars">
                                <div className="graph-bar h1"></div>
                                <div className="graph-bar h2"></div>
                                <div className="graph-bar h3"></div>
                                <div className="graph-bar h4"></div>
                                <div className="graph-bar h5"></div>
                                <div className="graph-bar h6 active"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glow-blob"></div>
            </div>
        </section>
    );
}

export default DashboardPreview;
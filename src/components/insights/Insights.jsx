import { useMemo } from "react";
import { FileWarning } from "lucide-react";

import { useDashboardDataContext } from "../../context/DashboardDataContext";

import {
    generateExecutiveSummary,
    generatePerformanceAnalysis,
    generateGrowthOpportunities,
    generateRiskAnalysis,
} from "../../utils/analytics/aiInsights";

import InsightsHero from "./hero/InsightsHero";
import ExecutiveSummary from "./summary/ExecutiveSummary";
import PerformanceAnalysis from "./performance/PerformanceAnalysis";
import GrowthOpportunities from "./growth/GrowthOpportunities";
import RiskAnalysis from "./risk/RiskAnalysis";

import "./Insights.css";

function Insights() {
    const { data = [], analytics = {} } = useDashboardDataContext();

    const executiveSummary = useMemo(
        () => generateExecutiveSummary(analytics),
        [analytics]
    );

    const performanceAnalysis = useMemo(
        () => generatePerformanceAnalysis(analytics),
        [analytics]
    );

    const opportunities = useMemo(
        () => generateGrowthOpportunities(analytics),
        [analytics]
    );

    const risks = useMemo(
        () => generateRiskAnalysis(analytics),
        [analytics]
    );

    if (!data?.length) {
        return (
            <div className="insights-empty">
                <FileWarning size={40} />

                <h2>No Business Data Found</h2>

                <p>
                    Upload a CSV or Excel file to unlock AI-powered business insights,
                    recommendations, forecasts, and growth opportunities.
                </p>
            </div>
        );
    }

    return (
        <main className="insights-page">

            <InsightsHero
                analytics={analytics}
            />

            <ExecutiveSummary
                summary={executiveSummary}
                analytics={analytics}
            />

            <PerformanceAnalysis
                analysis={performanceAnalysis}
                analytics={analytics}
            />

            <GrowthOpportunities
                opportunities={opportunities}
                analytics={analytics}
            />

            <RiskAnalysis
                risks={risks}
            />

        </main>
    );
}

export default Insights;

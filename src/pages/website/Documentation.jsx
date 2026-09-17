import HomeNavbar from "../../components/home/HomeNavbar";
import HomeFooter from "../../components/home/HomeFooter";
import "./Documentation.css";

function Documentation() {
    return (
        <div className="documentation-page">

            <HomeNavbar />

            <main className="documentation-main">

                {/* Hero */}
                <section className="documentation-hero">

                    <span className="documentation-eyebrow">
                        ✦ Kryolt Documentation
                    </span>

                    <h1>
                        Learn how to use Kryolt
                    </h1>

                    <p>
                        Everything you need to understand Kryolt, upload your
                        business data, explore analytics and get meaningful
                        AI-powered insights.
                    </p>

                </section>


                {/* Documentation Layout */}
                <div className="documentation-container">

                    {/* Sidebar */}
                    <aside className="documentation-sidebar">

                        <h3>
                            Documentation
                        </h3>

                        <nav>

                            <a href="#getting-started">
                                Getting Started
                            </a>

                            <a href="#account">
                                Account & Setup
                            </a>

                            <a href="#upload-data">
                                Upload Business Data
                            </a>

                            <a href="#dashboard">
                                Understanding Dashboard
                            </a>

                            <a href="#analytics">
                                Analytics & KPIs
                            </a>

                            <a href="#ai-insights">
                                AI Insights
                            </a>

                            <a href="#reports">
                                Reports
                            </a>

                            <a href="#data-security">
                                Data & Security
                            </a>

                        </nav>

                    </aside>


                    {/* Main Content */}
                    <article className="documentation-content">

                        {/* Getting Started */}
                        <section id="getting-started">

                            <span className="documentation-label">
                                GETTING STARTED
                            </span>

                            <h2>
                                Welcome to Kryolt
                            </h2>

                            <p>
                                Kryolt is an AI-powered business intelligence
                                platform designed to help businesses turn
                                raw data into meaningful insights.
                            </p>

                            <p>
                                You can upload your business data, explore
                                interactive dashboards, monitor key performance
                                indicators and use AI-powered insights to better
                                understand your business performance.
                            </p>

                            <div className="documentation-info">

                                <strong>
                                    Quick Start
                                </strong>

                                <p>
                                    Create your account, upload your business
                                    data and start exploring your analytics
                                    dashboard.
                                </p>

                            </div>

                        </section>


                        {/* Account */}
                        <section id="account">

                            <span className="documentation-label">
                                ACCOUNT
                            </span>

                            <h2>
                                Account & Setup
                            </h2>

                            <p>
                                To get started with Kryolt, create an account
                                using your email address and complete the
                                required account information.
                            </p>

                            <h3>
                                Basic setup
                            </h3>

                            <ul>
                                <li>Create your Kryolt account.</li>
                                <li>Complete your profile information.</li>
                                <li>Open your business dashboard.</li>
                                <li>Upload your first dataset.</li>
                            </ul>

                        </section>


                        {/* Upload Data */}
                        <section id="upload-data">

                            <span className="documentation-label">
                                DATA
                            </span>

                            <h2>
                                Upload Business Data
                            </h2>

                            <p>
                                Kryolt allows you to upload business data so
                                that the platform can analyze your information
                                and generate useful insights.
                            </p>

                            <h3>
                                Supported file formats
                            </h3>

                            <ul>
                                <li>CSV files</li>
                                <li>Excel files (.xlsx)</li>
                            </ul>

                            <h3>
                                Recommended data structure
                            </h3>

                            <p>
                                For the best results, keep your business data
                                organized into clear columns with meaningful
                                headers.
                            </p>

                            <pre className="documentation-code">
                                {`Date        Product        Sales       Profit
2026-01-01  Product A      25000       5000
2026-01-02  Product B      18000       3500`}
                            </pre>

                        </section>


                        {/* Dashboard */}
                        <section id="dashboard">

                            <span className="documentation-label">
                                DASHBOARD
                            </span>

                            <h2>
                                Understanding Your Dashboard
                            </h2>

                            <p>
                                Your Kryolt dashboard provides a centralized
                                view of your business performance and important
                                metrics.
                            </p>

                            <h3>
                                Key Performance Indicators
                            </h3>

                            <p>
                                KPI cards can help you quickly monitor important
                                metrics such as total sales, customers, orders
                                and profit.
                            </p>

                            <div className="documentation-info">

                                <strong>
                                    Tip
                                </strong>

                                <p>
                                    Use your dashboard regularly to identify
                                    changes and trends in your business data.
                                </p>

                            </div>

                        </section>


                        {/* Analytics */}
                        <section id="analytics">

                            <span className="documentation-label">
                                ANALYTICS
                            </span>

                            <h2>
                                Analytics & KPIs
                            </h2>

                            <p>
                                Kryolt transforms your uploaded data into
                                interactive analytics that help you understand
                                business performance.
                            </p>

                            <ul>
                                <li>Monitor sales performance.</li>
                                <li>Analyze product performance.</li>
                                <li>Track customer activity.</li>
                                <li>Identify business trends.</li>
                                <li>Understand changes over time.</li>
                            </ul>

                        </section>


                        {/* AI Insights */}
                        <section id="ai-insights">

                            <span className="documentation-label">
                                AI
                            </span>

                            <h2>
                                AI-Powered Insights
                            </h2>

                            <p>
                                Kryolt uses AI-powered analysis to help you
                                understand important patterns and trends in
                                your business data.
                            </p>

                            <p>
                                AI insights may highlight unusual changes,
                                important trends and potential areas that
                                deserve your attention.
                            </p>

                            <div className="documentation-warning">

                                <strong>
                                    Important
                                </strong>

                                <p>
                                    AI-generated insights are provided for
                                    informational purposes and should not be
                                    considered professional financial, legal
                                    or business advice.
                                </p>

                            </div>

                        </section>


                        {/* Reports */}
                        <section id="reports">

                            <span className="documentation-label">
                                REPORTS
                            </span>

                            <h2>
                                Reports
                            </h2>

                            <p>
                                Kryolt may provide business reports that
                                summarize important analytics and insights
                                generated from your data.
                            </p>

                            <p>
                                Reports can help you review business performance
                                and share important information with your team.
                            </p>

                        </section>


                        {/* Security */}
                        <section id="data-security">

                            <span className="documentation-label">
                                SECURITY
                            </span>

                            <h2>
                                Data & Security
                            </h2>

                            <p>
                                We take reasonable measures to protect the data
                                processed through Kryolt and work to maintain
                                a secure platform.
                            </p>

                            <p>
                                For more information about how Kryolt handles
                                personal information and business data, please
                                review our Privacy Policy.
                            </p>

                        </section>

                    </article>

                </div>

            </main>

            <HomeFooter />

        </div>
    );
}

export default Documentation;
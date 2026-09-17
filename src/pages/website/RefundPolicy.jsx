import HomeNavbar from "../../components/home/HomeNavbar";
import HomeFooter from "../../components/home/HomeFooter";
import "./RefundPolicy.css";

function RefundPolicy() {
    return (
        <div className="refund-policy-page">

            <HomeNavbar />

            <main className="refund-policy-main">

                {/* ================= HERO ================= */}

                <section className="refund-policy-hero">

                    <span className="refund-policy-eyebrow">
                        KRYOLT · LEGAL
                    </span>

                    <h1>
                        Refund Policy
                    </h1>

                    <p>
                        We want every Kryolt customer to have a positive
                        experience. This policy explains how refund requests,
                        subscription cancellations and billing issues are handled.
                    </p>

                    <div className="refund-policy-date">
                        <span>◷</span>
                        Last updated: July 2026
                    </div>

                </section>


                {/* ================= POLICY CARD ================= */}

                <section className="refund-policy-content">

                    {/* 01 */}

                    <div className="refund-policy-section">

                        <div className="refund-policy-icon">
                            $
                        </div>

                        <div className="refund-policy-text">

                            <h2>
                                1. Subscription Services
                            </h2>

                            <p>
                                Kryolt may offer paid subscription plans and
                                services. Subscription charges are processed
                                according to the plan and billing cycle selected
                                by the customer.
                            </p>

                        </div>

                    </div>


                    {/* 02 */}

                    <div className="refund-policy-section">

                        <div className="refund-policy-icon">
                            ?
                        </div>

                        <div className="refund-policy-text">

                            <h2>
                                2. Refund Requests
                            </h2>

                            <p>
                                If you believe you have been charged incorrectly,
                                experience a billing issue, or have a problem
                                with your subscription, please contact our
                                support team.
                            </p>

                            <p>
                                Refund requests can be submitted by contacting{" "}
                                <a href="mailto:hello@kryolt.com">
                                    hello@kryolt.com
                                </a>
                            </p>

                        </div>

                    </div>


                    {/* 03 */}

                    <div className="refund-policy-section">

                        <div className="refund-policy-icon">
                            ✓
                        </div>

                        <div className="refund-policy-text">

                            <h2>
                                3. Refund Eligibility
                            </h2>

                            <p>
                                Refund requests are reviewed on a case-by-case
                                basis. Eligibility may depend on the circumstances
                                of the request, the services used, the billing
                                status and the applicable subscription terms.
                            </p>

                            <p>
                                Submitting a refund request does not guarantee
                                that a refund will be approved.
                            </p>

                        </div>

                    </div>


                    {/* 04 */}

                    <div className="refund-policy-section">

                        <div className="refund-policy-icon">
                            ×
                        </div>

                        <div className="refund-policy-text">

                            <h2>
                                4. Cancellation
                            </h2>

                            <p>
                                You may cancel your subscription using the
                                cancellation options available through your
                                account or by contacting our support team.
                            </p>

                            <p>
                                Cancelling a subscription may prevent future
                                charges, but cancellation does not automatically
                                guarantee a refund for previous payments.
                            </p>

                        </div>

                    </div>


                    {/* 05 */}

                    <div className="refund-policy-section">

                        <div className="refund-policy-icon">
                            ◷
                        </div>

                        <div className="refund-policy-text">

                            <h2>
                                5. Processing of Refunds
                            </h2>

                            <p>
                                If a refund is approved, it will generally be
                                processed using the original payment method.
                                The time required for the refund to appear in
                                your account may depend on your payment provider
                                or financial institution.
                            </p>

                        </div>

                    </div>


                    {/* 06 */}

                    <div className="refund-policy-section last">

                        <div className="refund-policy-icon">
                            @
                        </div>

                        <div className="refund-policy-text">

                            <h2>
                                6. Contact Us
                            </h2>

                            <p>
                                If you have questions about refunds, billing,
                                subscriptions or cancellation, please contact
                                the Kryolt support team.
                            </p>

                            <a
                                href="mailto:hello@kryolt.com"
                                className="refund-policy-contact"
                            >
                                hello@kryolt.com
                                <span>↗</span>
                            </a>

                        </div>

                    </div>

                </section>

            </main>

            <HomeFooter />

        </div>
    );
}

export default RefundPolicy;
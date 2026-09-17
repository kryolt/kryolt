import { useState } from "react";
import { useNavigate } from "react-router-dom";

import HomeNavbar from "../../components/home/HomeNavbar";
import PricingSection from "../../components/home/Pricing";
import HomeFooter from "../../components/home/HomeFooter";
import AuthModal from "../../components/auth/AuthModal";

import "./Pricing.css";


function Pricing() {

    const navigate = useNavigate();


    const [showAuth, setShowAuth] =
        useState(false);


    const [selectedPlan, setSelectedPlan] =
        useState("Free");


    // =====================================================
    // PLAN ACTION
    // =====================================================

    const handleGetStarted = (plan) => {

        if (!plan) {
            return;
        }


        // =================================================
        // FREE PLAN
        // =================================================

        if (plan.action === "signup") {

            setSelectedPlan(
                plan.title ||
                plan.id ||
                "Free"
            );

            setShowAuth(true);

            return;
        }


        // =================================================
        // PAID PLAN
        // =================================================

        if (
            plan.action === "checkout" ||
            !plan.action
        ) {

            navigate(
                "/checkout",
                {
                    state: {
                        plan,
                    },
                }
            );

            return;
        }

    };


    return (

        <div className="pricing-page">

            <HomeNavbar
                onGetStartedClick={() =>
                    setShowAuth(true)
                }
            />


            <main>

                <PricingSection
                    onGetStartedClick={
                        handleGetStarted
                    }
                />

            </main>


            <HomeFooter />


            <AuthModal
                open={showAuth}
                onClose={() =>
                    setShowAuth(false)
                }
                selectedPlan={
                    selectedPlan
                }
            />

        </div>

    );
}


export default Pricing;
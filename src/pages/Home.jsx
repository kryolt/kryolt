import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import AuthModal from "../components/auth/AuthModal";

import HomeNavbar from "../components/home/HomeNavbar";
import HomeHero from "../components/home/HomeHero";
import Trusted from "../components/home/Trusted";
import Features from "../components/home/Features";
import DashboardPreview from "../components/home/DashboardPreview";
import HowItWorks from "../components/home/HowItWorks";
import Pricing from "../components/home/Pricing";
import Testimonials from "../components/home/Testimonials";
import FAQ from "../components/home/FAQ";
import CTA from "../components/home/CTA";
import HomeFooter from "../components/home/HomeFooter";

import "./Home.css";

function Home() {
    const navigate = useNavigate();

    const [showAuth, setShowAuth] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState("Free");

    // Opens the auth modal pre-selected on the Free plan.
    // Used by both the hero and the bottom CTA section.
    const handleStartFree = useCallback(() => {
        setSelectedPlan("Free");
        setShowAuth(true);
    }, []);

    // Navbar "Get Started" button — same Free-plan entry point.
    const handleGetStarted = useCallback(() => {
        setSelectedPlan("Free");
        setShowAuth(true);
    }, []);

    // Routes a pricing card click to either signup (free) or checkout (paid).
    const handlePricingAction = useCallback((plan) => {
        if (!plan) return;

        if (plan.action === "signup") {
            setSelectedPlan(plan.title || plan.id || "Free");
            setShowAuth(true);
            return;
        }

        if (plan.action === "checkout") {
            // New-user WELCOME40 offer replaces the Home history entry so the
            // post-payment back navigation goes Dashboard -> Home, not
            // Dashboard -> Payment -> Checkout -> Home.
            const isNewUserOffer =
                plan.promoOffer === true &&
                String(plan.couponCode || "").trim().toUpperCase() === "WELCOME40";

            navigate("/checkout", {
                replace: isNewUserOffer,
                state: {
                    plan,
                    couponCode: plan.couponCode || null,
                    promoOffer: plan.promoOffer === true,
                },
            });
        }
    }, [navigate]);

    const closeAuthModal = useCallback(() => setShowAuth(false), []);

    return (
        <>
            <HomeNavbar onGetStartedClick={handleGetStarted} />
            <HomeHero onGetStartedClick={handleStartFree} />
            <Trusted />
            <Features />
            <DashboardPreview />
            <HowItWorks />
            <Pricing onGetStartedClick={handlePricingAction} />
            <Testimonials />
            <FAQ />
            <CTA onStartFree={handleStartFree} />
            <HomeFooter />

            <AuthModal
                open={showAuth}
                onClose={closeAuthModal}
                selectedPlan={selectedPlan}
            />
        </>
    );
}

export default Home;
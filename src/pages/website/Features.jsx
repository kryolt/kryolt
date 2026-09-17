import { useState } from "react";

import "./Features.css";

import HomeNavbar from "../../components/home/HomeNavbar";
import FeaturesSection from "../../components/home/Features";
import HomeFooter from "../../components/home/HomeFooter";
import AuthModal from "../../components/auth/AuthModal";

function Features() {

    const [showAuth, setShowAuth] = useState(false);

    return (
        <div className="features-page">

            <HomeNavbar
                onGetStartedClick={() =>
                    setShowAuth(true)
                }
            />

            <main>
                <FeaturesSection />
            </main>

            <HomeFooter />

            <AuthModal
                open={showAuth}
                onClose={() =>
                    setShowAuth(false)
                }
            />

        </div>
    );
}

export default Features;
import { useState } from "react";

import "./About.css";

import HomeNavbar from "../../components/home/HomeNavbar";
import AboutHero from "../../components/home/about/AboutHero";
import Mission from "../../components/home/about/Mission";
import Vision from "../../components/home/about/Vision";
import Values from "../../components/home/about/Values";
import Stats from "../../components/home/about/Stats";
import Team from "../../components/home/about/Team";
import CTA from "../../components/home/about/CTA";
import HomeFooter from "../../components/home/HomeFooter";

import AuthModal from "../../components/auth/AuthModal";


function About() {

    const [showAuth, setShowAuth] = useState(false);


    return (

        <div className="about-page">

            <HomeNavbar
                onGetStartedClick={() =>
                    setShowAuth(true)
                }
            />


            <main>

                <AboutHero />

                <Mission />

                <Vision />

                <Values />

                <Stats />

                <Team />

                <CTA />

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


export default About;
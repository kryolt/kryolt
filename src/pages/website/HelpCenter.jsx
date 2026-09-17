import "./HelpCenter.css";

import HomeNavbar from "../../components/home/HomeNavbar";
import HomeFooter from "../../components/home/HomeFooter";

import HelpHero from "../../components/home/help/HelpHero";
import HelpCategories from "../../components/home/help/HelpCategories";
import PopularArticles from "../../components/home/help/PopularArticles";
import SupportCTA from "../../components/home/help/SupportCTA";

function HelpCenter() {
    return (
        <div className="help-center-page">

            <HomeNavbar />

            <main className="help-main">

                <HelpHero />

                <HelpCategories />

                <PopularArticles />

                <SupportCTA />

            </main>

            <HomeFooter />

        </div>
    );
}

export default HelpCenter;
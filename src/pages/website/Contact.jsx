import { useState } from "react";

import HomeNavbar from "../../components/home/HomeNavbar";
import ContactHero from "../../components/home/contact/ContactHero";
import ContactForm from "../../components/home/contact/ContactForm";
import ContactCards from "../../components/home/contact/ContactCards";
import OfficeLocation from "../../components/home/contact/OfficeLocation";
import FAQPreview from "../../components/home/contact/FAQPreview";
import HomeFooter from "../../components/home/HomeFooter";

import AuthModal from "../../components/auth/AuthModal";

import "./Contact.css";


function Contact() {

    const [showAuth, setShowAuth] = useState(false);


    return (

        <div className="website-page contact-page">


            <HomeNavbar
                onGetStartedClick={() =>
                    setShowAuth(true)
                }
            />


            <main>

                <ContactHero />

                <ContactCards />

                <ContactForm />

                <OfficeLocation />

                <FAQPreview />

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


export default Contact;
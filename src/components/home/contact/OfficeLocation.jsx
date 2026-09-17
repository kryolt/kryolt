import { MapPin } from "lucide-react";

import "./OfficeLocation.css";

function OfficeLocation() {
    return (
        <section className="office-location">

            <div className="office-location-content">

                <div className="office-icon">
                    <MapPin size={22} />
                </div>

                <div>
                    <span>Our Location</span>

                    <h2>
                        Churu, Rajasthan, India
                    </h2>

                    <p>
                        Kryolt is proudly building AI-powered business
                        intelligence solutions from India for businesses
                        around the world.
                    </p>
                </div>

            </div>

        </section>
    );
}

export default OfficeLocation;
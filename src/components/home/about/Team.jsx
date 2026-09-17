import "./Team.css";
import ramawtarPhoto from "../../../assets/branding/ramawtar.jpeg";

function Team() {
    return (
        <section className="about-team">
            <div className="team-header">
                <span>Our Team</span>
                <h2>The person behind Kryolt</h2>
                <p>
                    A small, focused team building the platform we wish
                    existed when running our own business.
                </p>
            </div>

            <div className="team-container">
                <div className="team-card">

                    <div className="team-image">
                        <img
                            src={ramawtarPhoto}
                            alt="Ramawtar King"
                        />
                    </div>

                    <div className="team-content">
                        <h3>Ramawtar King</h3>
                        <span>Founder</span>

                        <p>
                            Building Kryolt with the vision of making
                            AI-powered business intelligence simple and
                            accessible for small businesses worldwide.
                        </p>
                    </div>

                </div>
            </div>
        </section>
    );
}

export default Team;
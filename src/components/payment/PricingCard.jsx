import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function PricingCard({ plan }) {

    const navigate = useNavigate();

    const { currentUser } = useAuth();

    const handleClick = () => {

        switch (plan.action) {

            case "signup":

                if (currentUser) {

                    navigate("/dashboard");

                } else {

                    navigate("/signup");

                }

                break;

            case "checkout":

                navigate("/checkout", {
                    state: {
                        plan,
                    },
                });

                break;

            case "contact":

                navigate("/contact");

                break;

            default:

                break;

        }

    };

    return (

        <div
            className={`pricing-card ${plan.popular ? "popular" : ""
                }`}
        >

            {plan.popular && (

                <div className="popular-badge">

                    Most Popular

                </div>

            )}

            <h2>

                {plan.title}

            </h2>

            <p>

                {plan.desc}

            </p>

            <h1>

                {plan.displayPrice}

                <span>

                    {plan.period}

                </span>

            </h1>

            <ul>

                {plan.features.map((feature) => (

                    <li key={feature}>

                        ✔ {feature}

                    </li>

                ))}

            </ul>

            <button
                className="pricing-btn"
                onClick={handleClick}
            >

                {plan.button}

            </button>

        </div>

    );

}

export default PricingCard;
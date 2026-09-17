import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import Loader from "../common/Loader";


function PremiumRoute({ children }) {

    const {
        loading,
        isAuthenticated,
        isPremium,
    } = useAuth();


    // -------------------------------------------------
    // AUTH / PROFILE LOADING
    // -------------------------------------------------

    if (loading) {
        return <Loader />;
    }


    // -------------------------------------------------
    // NOT LOGGED IN
    // -------------------------------------------------

    if (!isAuthenticated) {

        return (
            <Navigate
                to="/"
                replace
            />
        );
    }


    // -------------------------------------------------
    // FREE PLAN
    // -------------------------------------------------

    if (!isPremium) {

        return (
            <Navigate
                to="/pricing"
                replace
            />
        );
    }


    // -------------------------------------------------
    // PREMIUM
    // -------------------------------------------------

    return children;
}


export default PremiumRoute;
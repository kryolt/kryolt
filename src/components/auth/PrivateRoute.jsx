import {
    Navigate,
    Outlet,
    useLocation,
} from "react-router-dom";

import { useAuth } from "../../context/useAuth";


export default function PrivateRoute() {

    const {
        currentUser,
        loading,
    } = useAuth();

    const location = useLocation();


    // -------------------------------------------------
    // AUTH INITIALIZATION
    // -------------------------------------------------

    if (loading) {
        return null;
    }


    // -------------------------------------------------
    // NOT AUTHENTICATED
    // -------------------------------------------------

    if (!currentUser) {

        const from =
            location.pathname +
            location.search +
            location.hash;


        return (

            <Navigate
                to="/"
                replace
                state={{
                    from,
                }}
            />

        );
    }


    // -------------------------------------------------
    // AUTHENTICATED
    // -------------------------------------------------

    return <Outlet />;
}
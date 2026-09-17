import { useContext } from "react";
import DashboardDataContext from "./DashboardDataContext";

export function useDashboardDataContext() {
    const context = useContext(DashboardDataContext);

    if (!context) {
        throw new Error(
            "useDashboardDataContext must be used inside DashboardDataProvider"
        );
    }

    return context;
}

export default useDashboardDataContext;
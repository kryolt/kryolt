import {
    createContext,
    useContext,
} from "react";

const DashboardDataContext =
    createContext(null);

DashboardDataContext.displayName =
    "DashboardDataContext";

export function useDashboardDataContext() {
    const context =
        useContext(DashboardDataContext);

    if (context === null) {
        throw new Error(
            "useDashboardDataContext must be used inside DashboardDataProvider"
        );
    }

    return context;
}

export default DashboardDataContext;
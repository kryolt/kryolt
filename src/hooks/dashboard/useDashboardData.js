import {
    useDashboardDataContext,
} from "../../context/DashboardDataContext";

export function useDashboardData() {
    return useDashboardDataContext();
}

export default useDashboardData;
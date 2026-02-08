import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import api from "../../src/api";
import { useToast } from "../ui/Toast";
import { useAuth } from "./AuthContext";

const StudentDashboardContext = createContext();

export const useStudentDashboard = () => useContext(StudentDashboardContext);

export const StudentDashboardProvider = ({ children }) => {
    const [companies, setCompanies] = useState([]);
    const [themes, setThemes] = useState([]);
    const [periods, setPeriods] = useState([]);
    const [existingInternship, setExistingInternship] = useState(null);
    const [internshipHistory, setInternshipHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();
    const { user, isAuthenticated } = useAuth();

    // Use a ref to track if initial data has been fetched to avoid double fetch in StrictMode
    const hasFetched = useRef(false);

    const fetchInitialData = useCallback(async (force = false) => {
        if (!isAuthenticated || user?.role !== 'mahasiswa') return;
        if (!force && hasFetched.current) return;

        setLoading(true);
        try {
            const [compRes, themeRes, periodRes, internshipRes, historyRes] = await Promise.all([
                api.get("/companies"),
                api.get("/themes"),
                api.get("/periods"),
                api.get("/internships/my").catch(() => ({ data: null })),
                api.get("/internships/my/history").catch(() => ({ data: [] }))
            ]);

            setCompanies(compRes.data.data?.data || []);
            setThemes(themeRes.data.data?.data || []);
            setPeriods(periodRes.data.data?.data || []);
            setExistingInternship(internshipRes.data);
            setInternshipHistory(historyRes.data || []);

            hasFetched.current = true;
        } catch (error) {
            console.error("Error fetching student dashboard data", error);
            // Only show toast if it's a forced refresh or initial load failed significantly
            // Avoid toast on login page before fully authenticated
            if (force) addToast("Gagal mengambil data dashboard", "error");
        } finally {
            setLoading(false);
        }
    }, [addToast, isAuthenticated, user?.role]);

    const refreshInternship = useCallback(async () => {
        if (!isAuthenticated || user?.role !== 'mahasiswa') return;
        try {
            const response = await api.get("/internships/my");
            setExistingInternship(response.data);
        } catch (error) {
            console.error("Error refreshing internship status", error);
        }
    }, [isAuthenticated, user?.role]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData, isAuthenticated, user]);

    const value = {
        companies,
        themes,
        periods,
        existingInternship,
        internshipHistory,
        loading,
        fetchInitialData,
        refreshInternship,
        setExistingInternship
    };

    return (
        <StudentDashboardContext.Provider value={value}>
            {children}
        </StudentDashboardContext.Provider>
    );
};

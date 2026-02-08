import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import api from "../../src/api";
import { useToast } from "../ui/Toast";
import { useAuth } from "./AuthContext";

const AdminInternshipContext = createContext();

export const useAdminInternship = () => useContext(AdminInternshipContext);

export const AdminInternshipProvider = ({ children }) => {
    const [submittedRegistrations, setSubmittedRegistrations] = useState([]);
    const [approvedRegistrations, setApprovedRegistrations] = useState([]);
    const [lecturers, setLecturers] = useState([]);

    const [loadingSubmitted, setLoadingSubmitted] = useState(false);
    const [loadingApproved, setLoadingApproved] = useState(false);
    const [loadingLecturers, setLoadingLecturers] = useState(false);

    const { addToast } = useToast();
    const { user, isAuthenticated } = useAuth();
    const hasFetched = useRef({ submitted: false, approved: false, lecturers: false });

    const fetchSubmitted = useCallback(async (force = false) => {
        if (!isAuthenticated || user?.role !== 'admin') return;
        if (!force && hasFetched.current.submitted) return;

        setLoadingSubmitted(true);
        try {
            const response = await api.get("/admin/internships", {
                params: { status: 'submitted' }
            });
            setSubmittedRegistrations(Array.isArray(response.data) ? response.data : response.data.data || []);
            hasFetched.current.submitted = true;
        } catch (error) {
            console.error("Gagal mengambil data pendaftaran submitted", error);
            if (force) addToast("Gagal mengambil data pendaftaran", "error");
        } finally {
            setLoadingSubmitted(false);
        }
    }, [isAuthenticated, user, addToast]);

    const fetchApproved = useCallback(async (force = false) => {
        if (!isAuthenticated || user?.role !== 'admin') return;
        if (!force && hasFetched.current.approved) return;

        setLoadingApproved(true);
        try {
            const response = await api.get("/admin/internships", {
                params: { status: 'approved' }
            });
            setApprovedRegistrations(Array.isArray(response.data) ? response.data : response.data.data || []);
            hasFetched.current.approved = true;
        } catch (error) {
            console.error("Gagal mengambil data pendaftaran approved", error);
            if (force) addToast("Gagal mengambil data pendaftaran", "error");
        } finally {
            setLoadingApproved(false);
        }
    }, [isAuthenticated, user, addToast]);

    const fetchLecturers = useCallback(async (force = false) => {
        if (!isAuthenticated || user?.role !== 'admin') return;
        if (!force && hasFetched.current.lecturers) return;

        setLoadingLecturers(true);
        try {
            const response = await api.get("/lecturers", {
                params: { per_page: 500 }
            });
            setLecturers(response.data.data.data || response.data.data || []);
            hasFetched.current.lecturers = true;
        } catch (error) {
            console.error("Gagal mengambil data dosen", error);
        } finally {
            setLoadingLecturers(false);
        }
    }, [isAuthenticated, user]);

    const refreshAll = useCallback(async () => {
        await Promise.all([
            fetchSubmitted(true),
            fetchApproved(true),
            fetchLecturers(true)
        ]);
    }, [fetchSubmitted, fetchApproved, fetchLecturers]);

    const value = {
        submittedRegistrations,
        approvedRegistrations,
        lecturers,
        loadingSubmitted,
        loadingApproved,
        loadingLecturers,
        fetchSubmitted,
        fetchApproved,
        fetchLecturers,
        refreshAll,
        setSubmittedRegistrations,
        setApprovedRegistrations
    };

    return (
        <AdminInternshipContext.Provider value={value}>
            {children}
        </AdminInternshipContext.Provider>
    );
};

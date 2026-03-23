import { createContext, useContext, useState, useCallback, useRef } from "react";
import api from "../../src/api";
import { toast } from "react-toastify";

const LecturerContext = createContext();

export const useLecturers = () => useContext(LecturerContext);

export const LecturerProvider = ({ children }) => {
    const [lecturers, setLecturers] = useState([]);
    const [pagination, setPagination] = useState({
        total: 0,
        per_page: 10,
        current_page: 1,
        last_page: 1,
    });
    const [loading, setLoading] = useState(false);

    // Cache key to store the last used parameters
    const lastParamsRef = useRef(null);

    const getLecturers = useCallback(async (page = 1, perPage = 10, search = "") => {
        const params = { page, per_page: perPage, search };

        // Check if params match the last fetch. If so, and we have data, don't re-fetch.
        if (
            lastParamsRef.current &&
            lastParamsRef.current.page === page &&
            lastParamsRef.current.per_page === perPage &&
            lastParamsRef.current.search === search &&
            lecturers.length > 0
        ) {
            return; // Use cached data
        }

        setLoading(true);
        try {
            const response = await api.get(`/lecturers`, { params });
            const data = response.data.data;
            setLecturers(data.data);
            setPagination({
                total: data.total,
                per_page: data.per_page,
                current_page: data.current_page,
                last_page: data.last_page,
            });
            // Update last params on success
            lastParamsRef.current = params;
        } catch (error) {
            console.error("Error fetching lecturers:", error);
            toast.error("Gagal mengambil data dosen");
        } finally {
            setLoading(false);
        }
    }, [lecturers.length]); // Dependencies: lecturers.length (to know if valid cache exists)

    // Force refresh (e.g., after add/edit/delete)
    const refreshLecturers = useCallback(async () => {
        if (lastParamsRef.current) {
            const { page, per_page, search } = lastParamsRef.current;
            // Clear lastParams to force fetch inside getLecturers or just call api directly
            // Better: reset lastParamsRef.current to null temporarily or just force logic.
            // Simplest: just fetch and update state, then update lastParams.
            setLoading(true);
            try {
                const response = await api.get(`/lecturers`, { params: lastParamsRef.current });
                const data = response.data.data;
                setLecturers(data.data);
                setPagination({
                    total: data.total,
                    per_page: data.per_page,
                    current_page: data.current_page,
                    last_page: data.last_page,
                });
            } catch (error) {
                console.error("Error refreshing lecturers:", error);
                toast.error("Gagal memperbarui data dosen");
            } finally {
                setLoading(false);
            }
        } else {
            // If never fetched, fetch default
            getLecturers();
        }
    }, [getLecturers]);

    const value = {
        lecturers,
        pagination,
        loading,
        getLecturers,
        refreshLecturers,
    };

    return (
        <LecturerContext.Provider value={value}>
            {children}
        </LecturerContext.Provider>
    );
};

import { createContext, useContext, useState, useCallback, useRef } from "react";
import api from "../../src/api";
import { toast } from "react-toastify";

const ThemeContext = createContext();

export const useThemes = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const [themes, setThemes] = useState([]);
    const [pagination, setPagination] = useState({
        total: 0,
        per_page: 10,
        current_page: 1,
        last_page: 1,
    });
    const [loading, setLoading] = useState(false);

    const lastParamsRef = useRef(null);

    const getThemes = useCallback(async (page = 1, perPage = 10, search = "") => {
        const params = { page, per_page: perPage, search };

        if (
            lastParamsRef.current &&
            lastParamsRef.current.page === page &&
            lastParamsRef.current.per_page === perPage &&
            lastParamsRef.current.search === search &&
            lastParamsRef.current.hasData
        ) {
            return;
        }

        setLoading(true);
        try {
            const response = await api.get(`/themes`, { params });
            const data = response.data.data;
            setThemes(data.data);
            setPagination({
                total: data.total,
                per_page: data.per_page,
                current_page: data.current_page,
                last_page: data.last_page,
            });
            lastParamsRef.current = { ...params, hasData: true };
        } catch (error) {
            console.error("Error fetching themes:", error);
            toast.error("Gagal mengambil data tema");
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    const refreshThemes = useCallback(async () => {
        if (lastParamsRef.current) {
            setLoading(true);
            try {
                const response = await api.get(`/themes`, { params: lastParamsRef.current });
                const data = response.data.data;
                setThemes(data.data);
                setPagination({
                    total: data.total,
                    per_page: data.per_page,
                    current_page: data.current_page,
                    last_page: data.last_page,
                });
            } catch (error) {
                console.error("Error refreshing themes:", error);
                toast.error("Gagal memperbarui data tema");
            } finally {
                setLoading(false);
            }
        } else {
            getThemes();
        }
    }, [getThemes, addToast]);

    const value = {
        themes,
        pagination,
        loading,
        getThemes,
        refreshThemes,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

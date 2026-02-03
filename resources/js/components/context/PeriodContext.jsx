import { createContext, useContext, useState, useCallback, useRef } from "react";
import api from "../../src/api";
import { useToast } from "../ui/Toast";

const PeriodContext = createContext();

export const usePeriods = () => useContext(PeriodContext);

export const PeriodProvider = ({ children }) => {
    const [periods, setPeriods] = useState([]);
    const [pagination, setPagination] = useState({
        total: 0,
        per_page: 10,
        current_page: 1,
        last_page: 1,
    });
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    const lastParamsRef = useRef(null);

    const getPeriods = useCallback(async (page = 1, perPage = 10, search = "") => {
        const params = { page, per_page: perPage, search };

        if (
            lastParamsRef.current &&
            lastParamsRef.current.page === page &&
            lastParamsRef.current.per_page === perPage &&
            lastParamsRef.current.search === search &&
            periods.length > 0
        ) {
            return;
        }

        setLoading(true);
        try {
            const response = await api.get(`/periods`, { params });
            const data = response.data.data;
            setPeriods(data.data);
            setPagination({
                total: data.total,
                per_page: data.per_page,
                current_page: data.current_page,
                last_page: data.last_page,
            });
            lastParamsRef.current = params;
        } catch (error) {
            console.error("Error fetching periods:", error);
            addToast("Gagal mengambil data periode", "error");
        } finally {
            setLoading(false);
        }
    }, [periods.length, addToast]);

    const refreshPeriods = useCallback(async () => {
        if (lastParamsRef.current) {
            const { page, per_page, search } = lastParamsRef.current;
            setLoading(true);
            try {
                const response = await api.get(`/periods`, { params: lastParamsRef.current });
                const data = response.data.data;
                setPeriods(data.data);
                setPagination({
                    total: data.total,
                    per_page: data.per_page,
                    current_page: data.current_page,
                    last_page: data.last_page,
                });
            } catch (error) {
                console.error("Error refreshing periods:", error);
                addToast("Gagal memperbarui data periode", "error");
            } finally {
                setLoading(false);
            }
        } else {
            getPeriods();
        }
    }, [getPeriods, addToast]);

    const value = {
        periods,
        pagination,
        loading,
        getPeriods,
        refreshPeriods,
    };

    return (
        <PeriodContext.Provider value={value}>
            {children}
        </PeriodContext.Provider>
    );
};
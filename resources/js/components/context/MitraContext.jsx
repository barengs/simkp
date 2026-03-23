import { createContext, useContext, useState, useCallback, useRef } from "react";
import api from "../../src/api";
import { toast } from "react-toastify";

const MitraContext = createContext();

export const useMitra = () => useContext(MitraContext);

export const MitraProvider = ({ children }) => {
    const [mitra, setMitra] = useState([]);
    const [pagination, setPagination] = useState({
        total: 0,
        per_page: 10,
        current_page: 1,
        last_page: 1,
    });
    const [loading, setLoading] = useState(false);

    const lastParamsRef = useRef(null);

    const getMitra = useCallback(async (page = 1, perPage = 10, search = "") => {
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
            const response = await api.get(`/companies`, { params });
            const data = response.data.data;
            setMitra(data.data);
            setPagination({
                total: data.total,
                per_page: data.per_page,
                current_page: data.current_page,
                last_page: data.last_page,
            });
            lastParamsRef.current = { ...params, hasData: true };
        } catch (error) {
            console.error("Error fetching companies:", error);
            toast.error("Gagal mengambil data mitra");
        } finally {
            setLoading(false);
        }
    }, []);

    const refreshMitra = useCallback(async () => {
        if (lastParamsRef.current) {
            setLoading(true);
            try {
                const response = await api.get(`/companies`, { params: lastParamsRef.current });
                const data = response.data.data;
                setMitra(data.data);
                setPagination({
                    total: data.total,
                    per_page: data.per_page,
                    current_page: data.current_page,
                    last_page: data.last_page,
                });
            } catch (error) {
                console.error("Error refreshing companies:", error);
                toast.error("Gagal memperbarui data mitra");
            } finally {
                setLoading(false);
            }
        } else {
            getMitra();
        }
    }, [getMitra]);

    const value = {
        mitra,
        pagination,
        loading,
        getMitra,
        refreshMitra,
    };

    return (
        <MitraContext.Provider value={value}>
            {children}
        </MitraContext.Provider>
    );
};

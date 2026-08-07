import React from 'react';
import { toast } from 'react-toastify';

export const handleApiError = (err, fallbackMessage = 'Terjadi kesalahan') => {
    const message =
        err?.response?.data?.message ||
        err?.data?.message ||
        (err?.data?.errors && Object.values(err.data.errors)[0]?.[0]) ||
        fallbackMessage;

    toast.error(message);
    return message;
};

export const handleApiSuccess = (message = 'Berhasil') => {
    toast.success(message);
};

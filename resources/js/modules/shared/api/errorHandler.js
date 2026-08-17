import React from 'react';
import { toast } from 'react-toastify';

export const handleApiError = (err, fallbackMessage = 'Terjadi kesalahan') => {
    let message = fallbackMessage;

    if (err?.data?.errors && Object.keys(err.data.errors).length > 0) {
        message = Object.values(err.data.errors)[0]?.[0] || fallbackMessage;
    } else if (err?.response?.data?.message) {
        message = err.response.data.message;
    } else if (err?.data?.message) {
        message = err.data.message;
    }

    if (message === 'The file failed to upload.') {
        message = 'Gagal mengupload file. Pastikan file tidak kosong, tidak melebihi batas ukuran (maks 10 MB), dan sesuai format (PDF, DOC, DOCX).';
    }

    toast.error(message);
    return message;
};

export const handleApiSuccess = (message = 'Berhasil') => {
    toast.success(message);
};

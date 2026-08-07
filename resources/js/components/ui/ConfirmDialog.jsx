import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, loading = false }) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title || 'Konfirmasi'}
            size="sm"
            footer={
                <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={onClose} disabled={loading}>
                        Batal
                    </Button>
                    <Button variant="danger" onClick={onConfirm} loading={loading}>
                        Ya, Lanjutkan
                    </Button>
                </div>
            }
        >
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-sm text-gray-600">{message}</p>
            </div>
        </Modal>
    );
};

export default ConfirmDialog;

import { createContext, useContext, useState, Fragment } from 'react';
import { Transition } from '@headlessui/react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import clsx from 'clsx';

const ToastContext = createContext();

export function useToast() {
    return useContext(ToastContext);
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'success', duration = 3000) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
    };

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
                {toasts.map((toast) => (
                    <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

function Toast({ message, type, onClose }) {
    const icons = {
        success: <CheckCircle className="w-6 h-6 text-emerald-500" />,
        error: <XCircle className="w-6 h-6 text-rose-500" />,
        warning: <AlertCircle className="w-6 h-6 text-amber-500" />,
        info: <Info className="w-6 h-6 text-blue-500" />,
    };

    const styles = {
        success: 'bg-white border-l-4 border-emerald-500',
        error: 'bg-white border-l-4 border-rose-500',
        warning: 'bg-white border-l-4 border-amber-500',
        info: 'bg-white border-l-4 border-blue-500',
    };

    return (
        <Transition
            appear={true}
            show={true}
            as={Fragment}
            enter="transform ease-out duration-300 transition"
            enterFrom="translate-x-full opacity-0"
            enterTo="translate-x-0 opacity-100"
            leave="transition ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0 translate-x-full"
        >
            <div className={clsx(
                "pointer-events-auto w-full overflow-hidden rounded-lg shadow-2xl p-4 flex items-start gap-4 ring-1 ring-black/5",
                styles[type]
            )}>
                <div className="shrink-0 pt-0.5">
                    {icons[type]}
                </div>
                <div className="flex-1 w-0">
                    <p className="text-base font-semibold text-slate-900 first-letter:uppercase">
                        {type}
                    </p>
                    <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                        {message}
                    </p>
                </div>
                <div className="ml-4 flex shrink-0">
                    <button
                        type="button"
                        className="inline-flex rounded-md bg-white text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        onClick={onClose}
                    >
                        <span className="sr-only">Close</span>
                        <X className="w-5 h-5" aria-hidden="true" />
                    </button>
                </div>
            </div>
        </Transition>
    );
}

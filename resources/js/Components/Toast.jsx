import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'success', isVisible, onClose }) {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    const configs = {
        success: {
            icon: <CheckCircle size={20} />,
            bg: 'bg-green-500',
            text: 'text-white'
        },
        error: {
            icon: <XCircle size={20} />,
            bg: 'bg-red-500',
            text: 'text-white'
        },
        warning: {
            icon: <AlertTriangle size={20} />,
            bg: 'bg-amber-500',
            text: 'text-white'
        },
        info: {
            icon: <Info size={20} />,
            bg: 'bg-blue-500',
            text: 'text-white'
        }
    };

    const config = configs[type];

    return (
        <div className="fixed top-4 right-4 z-[100] animate-slide-in-right">
            <div className={`${config.bg} ${config.text} rounded-xl shadow-2xl px-4 py-3 flex items-center gap-3 min-w-[300px] max-w-md`}>
                <div>{config.icon}</div>
                <p className="flex-1 font-medium">{message}</p>
                <button onClick={onClose} className="hover:bg-white/20 rounded-lg p-1 transition">
                    <X size={18} />
                </button>
            </div>
        </div>
    );
}

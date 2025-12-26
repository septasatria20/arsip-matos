import React from 'react';
import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, type = 'warning' }) {
    if (!isOpen) return null;

    const icons = {
        warning: <AlertTriangle className="text-amber-500" size={48} />,
        danger: <XCircle className="text-red-500" size={48} />,
        success: <CheckCircle className="text-green-500" size={48} />,
        info: <Info className="text-blue-500" size={48} />
    };

    const buttonColors = {
        warning: 'bg-amber-500 hover:bg-amber-600',
        danger: 'bg-red-500 hover:bg-red-600',
        success: 'bg-green-500 hover:bg-green-600',
        info: 'bg-blue-500 hover:bg-blue-600'
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-scale-in">
                <div className="p-6 flex flex-col items-center text-center">
                    <div className="mb-4">
                        {icons[type]}
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
                    <p className="text-slate-600 mb-6">{message}</p>
                    
                    <div className="flex gap-3 w-full">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition"
                        >
                            Batal
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`flex-1 px-4 py-2.5 ${buttonColors[type]} text-white rounded-xl font-bold transition shadow-lg`}
                        >
                            Ya, Lanjutkan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

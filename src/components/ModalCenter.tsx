import React, { ReactNode, useEffect } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';

interface ModalCenterProps {
    isOpen: boolean;
    title?: string;
    children: ReactNode;
    onClose: () => void;
    onConfirm?: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
    type?: 'info' | 'success' | 'error' | 'confirm';
    autoClose?: boolean; // Auto-close after 1.5 seconds (default: true for success/info)
}

export const ModalCenter: React.FC<ModalCenterProps> = ({
    isOpen,
    title = '',
    children,
    onClose,
    onConfirm,
    confirmLabel = 'OK, Entendi',
    cancelLabel = 'Cancelar',
    type = 'info',
    autoClose,
}) => {
    // Determine if should auto-close
    // If autoClose is explicitly set, use that value
    // Otherwise, auto-close for success/info without confirm button
    const shouldAutoClose = autoClose !== undefined
        ? autoClose
        : (type === 'success' || type === 'info') && !onConfirm;

    // Auto-close for success and info messages (unless explicitly disabled)
    useEffect(() => {
        if (isOpen && shouldAutoClose) {
            const timer = setTimeout(() => {
                onClose();
            }, 1500); // 1.5 seconds

            return () => clearTimeout(timer);
        }
    }, [isOpen, shouldAutoClose, onClose]);

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // Icon configuration based on type
    const iconConfig = {
        success: {
            Icon: CheckCircle,
            iconColor: 'text-green-500',
            bgColor: 'bg-green-100 dark:bg-green-900/30',
            buttonColor: 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600',
        },
        error: {
            Icon: XCircle,
            iconColor: 'text-red-500',
            bgColor: 'bg-red-100 dark:bg-red-900/30',
            buttonColor: 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600',
        },
        info: {
            Icon: Info,
            iconColor: 'text-blue-500',
            bgColor: 'bg-blue-100 dark:bg-blue-900/30',
            buttonColor: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600',
        },
        confirm: {
            Icon: AlertTriangle,
            iconColor: 'text-yellow-500',
            bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
            buttonColor: 'bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600',
        },
    }[type];

    const { Icon, iconColor, bgColor, buttonColor } = iconConfig;

    // Handle click outside to close
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={handleBackdropClick}
        >
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-in zoom-in-95 duration-300">
                {/* Icon Section */}
                <div className="flex flex-col items-center pt-8 pb-4 px-6">
                    <div className={`${bgColor} rounded-full p-4 mb-4`}>
                        <Icon className={`w-16 h-16 ${iconColor}`} />
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center">
                        {title}
                    </h2>

                    {/* Message */}
                    <div className="text-gray-500 dark:text-gray-400 mt-2 text-center">
                        {children}
                    </div>
                </div>

                {/* Actions or Progress Bar */}
                {shouldAutoClose ? (
                    <div className="px-6 pb-6">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 overflow-hidden">
                            <div
                                className={`h-full ${buttonColor.split(' ')[0]} animate-[shrink_1.5s_linear_forwards]`}
                                style={{
                                    animation: 'shrink 1.5s linear forwards',
                                }}
                            />
                        </div>
                        <style>{`
                            @keyframes shrink {
                                from { width: 100%; }
                                to { width: 0%; }
                            }
                        `}</style>
                    </div>
                ) : (
                    <div className="px-6 pb-6 space-y-2">
                        {onConfirm ? (
                            <>
                                <button
                                    onClick={onConfirm}
                                    className={`w-full px-4 py-3 text-white rounded-lg font-medium transition-colors ${buttonColor}`}
                                >
                                    {confirmLabel}
                                </button>
                                <button
                                    onClick={onClose}
                                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    {cancelLabel}
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={onClose}
                                className={`w-full px-4 py-3 text-white rounded-lg font-medium transition-colors ${buttonColor}`}
                            >
                                {confirmLabel}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

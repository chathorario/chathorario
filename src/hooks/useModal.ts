import { useState, ReactNode } from 'react';

type ModalType = 'info' | 'success' | 'error' | 'confirm';

interface ModalContent {
    title?: string;
    message?: ReactNode;
    type?: ModalType;
    onConfirm?: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
    autoClose?: boolean;
}

export const useModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [content, setContent] = useState<ModalContent>({});

    const open = () => setIsOpen(true);
    const close = () => {
        setIsOpen(false);
        setContent({});
    };

    const setModal = (c: ModalContent) => {
        setContent(c);
    };

    return { isOpen, open, close, content, setModal };
};

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ModalContextType {
  isAnyModalOpen: boolean;
  setModalOpen: (isOpen: boolean) => void;
  closeAllModals: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [isAnyModalOpen, setIsAnyModalOpen] = useState(false);

  const setModalOpen = (isOpen: boolean) => {
    setIsAnyModalOpen(isOpen);
  };

  const closeAllModals = () => {
    setIsAnyModalOpen(false);
    // Trigger a custom event that modal components can listen to
    window.dispatchEvent(new CustomEvent('closeAllModals'));
  };

  return (
    <ModalContext.Provider value={{ isAnyModalOpen, setModalOpen, closeAllModals }}>
      {children}
    </ModalContext.Provider>
  );
};
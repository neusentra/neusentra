import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import '@/assets/styles/preloader.scss';

interface PreloaderContextType {
    isPreloaderVisible: boolean;
    setPreloader: (visible: boolean, duration?: number) => void;
}

const PreloaderContext = createContext<PreloaderContextType | undefined>(undefined);

export const PreloaderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isPreloaderVisible, setPreloaderVisible] = useState<boolean>(false);

    const setPreloader = (visible: boolean, duration?: number) => {
        setPreloaderVisible(visible);
        if (visible && duration) {
            setTimeout(() => {
                setPreloaderVisible(false);
            }, duration);
        }
    };

    return (
        <PreloaderContext.Provider value={{ isPreloaderVisible, setPreloader }}>
            {children}
            <AnimatePresence>
                {isPreloaderVisible && <Preloader />}
            </AnimatePresence>
        </PreloaderContext.Provider>
    );
};

const Preloader: React.FC = () => {
    return (
        <motion.section
            className="preloader-container"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }} // Fade out effect
        >
            <div className="preloader">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
            </div>
        </motion.section>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const usePreloader = (): PreloaderContextType => {
    const context = useContext(PreloaderContext);
    if (!context) {
        throw new Error('usePreloader must be used within a PreloaderProvider');
    }
    return context;
};
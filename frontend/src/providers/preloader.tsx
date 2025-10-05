import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import '@/assets/styles/preloader.scss';

interface PreloaderContextType {
    isPreloaderVisible: boolean;
    setPreloader: (visible: boolean, duration?: number) => void;
}

const PreloaderContext = createContext<PreloaderContextType | undefined>(undefined);

export const PreloaderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isPreloaderVisible, setPreloaderVisible] = useState<boolean>(true);

    const setPreloader = (visible: boolean, duration?: number) => {
        setPreloaderVisible(visible);
        if (visible && duration) {
            window.setTimeout(() => setPreloaderVisible(false), duration);
        }
    };

    useEffect(() => {
        const id = window.setTimeout(() => setPreloaderVisible(false), 1200);
        return () => window.clearTimeout(id);
    }, []);

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
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
        >
            <motion.svg
                className="size-[5rem] xl:size-[7rem] fill-black dark:fill-white"
                viewBox="0 0 700 765"
                xmlns="http://www.w3.org/2000/svg"
                animate={{
                    scale: [1, 1.08, 1],
                    opacity: [1, 0.9, 1],
                }}
                transition={{
                    duration: 1.2,
                    ease: [0.22, 1, 0.36, 1],
                    repeat: Infinity,
                    repeatType: 'mirror',
                }}
            >
                <path d="M25 764L53.5 320.5L1.5 292.5L156 227.5L241 451L258.5 181L353.5 142L323 636L223.5 677L138 454.5L119.5 724L25 764Z" />
                <path d="M376.5 459L471 420L469.5 471L552.5 434.5L637 497L367.5 616L376.5 459Z" />
                <path d="M396 130L485 193.5L481.5 273.5L666 195.5L650.5 446L698.5 471.5L652.5 492L559.5 422.5L563.5 341L379.5 418.5L396 130Z" />
                <path d="M407.5 118L677.5 1L669 155L574 195.5L575 147L491 181.5L407.5 118Z" />
            </motion.svg>
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

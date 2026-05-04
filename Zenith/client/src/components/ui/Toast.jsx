import { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((toast) => toast.id !== id)), duration);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((toast) => toast.id !== id));
  }, []);

  const COLORS = {
    info: { bg: '#1A1A1A', text: '#fff' },
    success: { bg: '#1D9E75', text: '#fff' },
    error: { bg: '#E24B4A', text: '#fff' },
    save: { bg: '#7F77DD', text: '#fff' },
  };

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 2000, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', pointerEvents: 'none', width: '100%', maxWidth: 360, padding: '0 16px' }}>
        <AnimatePresence>
          {toasts.map((toast) => {
            const colors = COLORS[toast.type] || COLORS.info;
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -16, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                onClick={() => dismiss(toast.id)}
                style={{
                  background: colors.bg,
                  color: colors.text,
                  padding: '12px 20px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 14,
                  fontWeight: 500,
                  pointerEvents: 'auto',
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                  whiteSpace: 'nowrap',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {toast.message}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx.show;
}

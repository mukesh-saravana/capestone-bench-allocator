import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { Snackbar, Alert, type AlertColor } from '@mui/material';

interface Toast {
  id: string;
  message: string;
  severity: AlertColor;
}

interface ToastContextValue {
  showToast: (message: string, severity?: AlertColor) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, severity: AlertColor = 'success') => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, severity }]);
  }, []);

  const remove = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.map((t) => (
        <Snackbar
          key={t.id}
          open
          autoHideDuration={t.severity === 'error' ? null : 4000}
          onClose={() => remove(t.id)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert severity={t.severity} onClose={() => remove(t.id)} sx={{ width: '100%', minWidth: 300 }}>
            {t.message}
          </Alert>
        </Snackbar>
      ))}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

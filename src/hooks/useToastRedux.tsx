import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { addToast, removeToast, clearToasts } from '@core/store/slices/toastSlice';

interface RootState {
  toast: {
    toasts: Array<{
      id: string;
      message: string;
      severity: 'success' | 'error' | 'warning' | 'info';
      duration?: number;
      action?: {
        label: string;
        onClick: () => void;
      };
    }>;
  };
}

export function useToast() {
  const dispatch = useDispatch();
  const toasts = useSelector((state: RootState) => state.toast.toasts);

  const success = useCallback(
    (
      message: string,
      options?: {
        duration?: number;
        action?: { label: string; onClick: () => void };
      },
    ) => {
      dispatch(addToast({ message, severity: 'success', ...options }));
    },
    [dispatch],
  );

  const error = useCallback(
    (
      message: string,
      options?: {
        duration?: number;
        action?: { label: string; onClick: () => void };
      },
    ) => {
      dispatch(addToast({ message, severity: 'error', ...options }));
    },
    [dispatch],
  );

  const warning = useCallback(
    (
      message: string,
      options?: {
        duration?: number;
        action?: { label: string; onClick: () => void };
      },
    ) => {
      dispatch(addToast({ message, severity: 'warning', ...options }));
    },
    [dispatch],
  );

  const info = useCallback(
    (
      message: string,
      options?: {
        duration?: number;
        action?: { label: string; onClick: () => void };
      },
    ) => {
      dispatch(addToast({ message, severity: 'info', ...options }));
    },
    [dispatch],
  );

  const show = useCallback(
    (
      message: string,
      severity: 'success' | 'error' | 'warning' | 'info',
      options?: {
        duration?: number;
        action?: { label: string; onClick: () => void };
      },
    ) => {
      dispatch(addToast({ message, severity, ...options }));
    },
    [dispatch],
  );

  const dismiss = useCallback(
    (id: string) => {
      dispatch(removeToast(id));
    },
    [dispatch],
  );

  const dismissAll = useCallback(() => {
    dispatch(clearToasts());
  }, [dispatch]);

  return {
    toasts,
    success,
    error,
    warning,
    info,
    show,
    dismiss,
    dismissAll,
  };
}

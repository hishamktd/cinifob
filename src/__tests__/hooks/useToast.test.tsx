import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useToast } from '@/hooks/useToastRedux';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { toastSlice } from '@core/store/slices/toastSlice';

const createMockStore = () => {
  return configureStore({
    reducer: {
      toast: toastSlice.reducer
    }
  });
};

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const store = createMockStore();
  return <Provider store={store}>{children}</Provider>;
};

describe('useToast', () => {
  it('shows success toast', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.success('Operation successful!');
    });

    // Toast state should be updated in store
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      message: 'Operation successful!',
      severity: 'success'
    });
  });

  it('shows error toast', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.error('An error occurred');
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      message: 'An error occurred',
      severity: 'error'
    });
  });

  it('shows warning toast', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.warning('Warning message');
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      message: 'Warning message',
      severity: 'warning'
    });
  });

  it('shows info toast', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.info('Information message');
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      message: 'Information message',
      severity: 'info'
    });
  });

  it('dismisses toast', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.success('Test message');
    });

    const toastId = result.current.toasts[0].id;

    act(() => {
      result.current.dismiss(toastId);
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it('dismisses all toasts', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.success('Message 1');
      result.current.error('Message 2');
      result.current.info('Message 3');
    });

    expect(result.current.toasts).toHaveLength(3);

    act(() => {
      result.current.dismissAll();
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it('handles multiple toasts', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.success('First toast');
      result.current.error('Second toast');
      result.current.warning('Third toast');
    });

    expect(result.current.toasts).toHaveLength(3);
    expect(result.current.toasts[0].message).toBe('First toast');
    expect(result.current.toasts[1].message).toBe('Second toast');
    expect(result.current.toasts[2].message).toBe('Third toast');
  });

  it('generates unique IDs for toasts', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    let dateNowStub = 0;
    vi.spyOn(Date, 'now').mockImplementation(() => ++dateNowStub);

    act(() => {
      result.current.success('Toast 1');
      result.current.success('Toast 2');
    });

    const ids = result.current.toasts.map(t => t.id);
    expect(ids[0]).not.toBe(ids[1]);

    vi.restoreAllMocks();
  });

  it('handles custom duration', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.show('Custom duration', 'info', { duration: 5000 });
    });

    expect(result.current.toasts[0]).toMatchObject({
      message: 'Custom duration',
      severity: 'info',
      duration: 5000
    });
  });

  it('handles custom action', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    const customAction = {
      label: 'Undo',
      onClick: () => console.log('Undo clicked')
    };

    act(() => {
      result.current.show('With action', 'info', { action: customAction });
    });

    expect(result.current.toasts[0].action).toEqual(customAction);
  });
});
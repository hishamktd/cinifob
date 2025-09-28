import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AppDatePicker } from '@core/components/app-date-picker';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const theme = createTheme();

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {component}
      </LocalizationProvider>
    </ThemeProvider>
  );
};

describe('AppDatePicker', () => {
  it('renders with label', () => {
    renderWithProviders(
      <AppDatePicker
        label="Select Date"
        value={null}
        onChange={() => {}}
      />
    );
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('displays selected date', () => {
    const date = dayjs('2024-01-15');
    renderWithProviders(
      <AppDatePicker
        label="Date"
        value={date}
        onChange={() => {}}
      />
    );
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('01/15/2024');
  });

  it('calls onChange when date is selected', () => {
    const handleChange = vi.fn();
    renderWithProviders(
      <AppDatePicker
        label="Date"
        value={null}
        onChange={handleChange}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.click(input);

    // Find and click a date button (simplified test)
    const dateButton = screen.getAllByRole('gridcell')[15]; // Pick middle of month
    fireEvent.click(dateButton);

    expect(handleChange).toHaveBeenCalled();
  });

  it('handles disabled state', () => {
    renderWithProviders(
      <AppDatePicker
        label="Date"
        value={null}
        onChange={() => {}}
        disabled
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('shows error state', () => {
    renderWithProviders(
      <AppDatePicker
        label="Date"
        value={null}
        onChange={() => {}}
        error
        helperText="Invalid date"
      />
    );

    expect(screen.getByText('Invalid date')).toBeInTheDocument();
  });

  it('respects min date', () => {
    const minDate = dayjs('2024-01-01');
    const selectedDate = dayjs('2023-12-31');

    renderWithProviders(
      <AppDatePicker
        label="Date"
        value={selectedDate}
        onChange={() => {}}
        minDate={minDate}
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('respects max date', () => {
    const maxDate = dayjs('2024-12-31');
    const selectedDate = dayjs('2025-01-01');

    renderWithProviders(
      <AppDatePicker
        label="Date"
        value={selectedDate}
        onChange={() => {}}
        maxDate={maxDate}
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('renders with custom format', () => {
    const date = dayjs('2024-01-15');
    renderWithProviders(
      <AppDatePicker
        label="Date"
        value={date}
        onChange={() => {}}
        format="DD/MM/YYYY"
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('15/01/2024');
  });

  it('handles required field', () => {
    renderWithProviders(
      <AppDatePicker
        label="Date"
        value={null}
        onChange={() => {}}
        required
      />
    );

    const label = screen.getByText(/Date/);
    expect(label.textContent).toContain('*');
  });

  it('clears date when clear button is clicked', () => {
    const handleChange = vi.fn();
    const date = dayjs('2024-01-15');

    renderWithProviders(
      <AppDatePicker
        label="Date"
        value={date}
        onChange={handleChange}
        clearable
      />
    );

    const clearButton = screen.getByRole('button', { name: /clear/i });
    fireEvent.click(clearButton);

    expect(handleChange).toHaveBeenCalledWith(null);
  });
});
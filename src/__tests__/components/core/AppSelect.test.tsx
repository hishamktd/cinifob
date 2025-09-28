import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AppSelect } from '@core/components/app-select';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('AppSelect', () => {
  const mockOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' }
  ];

  it('renders with placeholder', () => {
    renderWithTheme(
      <AppSelect
        options={mockOptions}
        placeholder="Select an option..."
      />
    );
    expect(screen.getByText('Select an option...')).toBeInTheDocument();
  });

  it('displays selected value', () => {
    renderWithTheme(
      <AppSelect
        options={mockOptions}
        value={mockOptions[0]}
      />
    );
    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  it('calls onChange when selection changes', () => {
    const handleChange = vi.fn();
    renderWithTheme(
      <AppSelect
        options={mockOptions}
        onChange={handleChange}
      />
    );

    const selectInput = screen.getByRole('combobox');
    fireEvent.mouseDown(selectInput);

    const option = screen.getByText('Option 2');
    fireEvent.click(option);

    expect(handleChange).toHaveBeenCalledWith(mockOptions[1], expect.anything());
  });

  it('renders multi-select mode', () => {
    renderWithTheme(
      <AppSelect
        options={mockOptions}
        isMulti
        value={[mockOptions[0], mockOptions[1]]}
      />
    );

    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('shows loading indicator', () => {
    renderWithTheme(
      <AppSelect
        options={mockOptions}
        isLoading
      />
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('handles disabled state', () => {
    const { container } = renderWithTheme(
      <AppSelect
        options={mockOptions}
        isDisabled
      />
    );

    const selectInput = container.querySelector('input[disabled]');
    expect(selectInput).toBeInTheDocument();
  });

  it('allows clearing selection', () => {
    const handleChange = vi.fn();
    renderWithTheme(
      <AppSelect
        options={mockOptions}
        value={mockOptions[0]}
        isClearable
        onChange={handleChange}
      />
    );

    const clearButton = screen.getByRole('button', { name: /clear/i });
    fireEvent.click(clearButton);

    expect(handleChange).toHaveBeenCalledWith(null, expect.anything());
  });

  it('supports searchable functionality', () => {
    renderWithTheme(
      <AppSelect
        options={mockOptions}
        isSearchable
      />
    );

    const selectInput = screen.getByRole('combobox');
    fireEvent.change(selectInput, { target: { value: '2' } });

    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });
});
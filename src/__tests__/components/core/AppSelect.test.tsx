import { render, screen } from '@testing-library/react';
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

  it('renders with label', () => {
    renderWithTheme(
      <AppSelect
        label="Select Option"
        options={mockOptions}
      />
    );
    expect(screen.getByText('Select Option')).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    renderWithTheme(
      <AppSelect
        options={mockOptions}
        placeholder="Select an option..."
      />
    );
    // React-select renders placeholder differently
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

  it('renders with error state', () => {
    renderWithTheme(
      <AppSelect
        label="Select Option"
        options={mockOptions}
        error
        helperText="This field is required"
      />
    );
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('renders with required indicator', () => {
    renderWithTheme(
      <AppSelect
        label="Select Option"
        options={mockOptions}
        required
      />
    );
    expect(screen.getByText('Select Option')).toBeInTheDocument();
    // Required asterisk should be present
    const labelText = screen.getByText('Select Option').parentElement?.textContent;
    expect(labelText).toContain('*');
  });

  it('renders with helper text', () => {
    renderWithTheme(
      <AppSelect
        label="Select Option"
        options={mockOptions}
        helperText="Choose one option"
      />
    );
    expect(screen.getByText('Choose one option')).toBeInTheDocument();
  });

  it('handles fullWidth prop', () => {
    const { container } = renderWithTheme(
      <AppSelect
        label="Select Option"
        options={mockOptions}
        fullWidth
      />
    );
    const formControl = container.querySelector('.MuiFormControl-root');
    expect(formControl).toHaveClass('MuiFormControl-fullWidth');
  });

  it('renders multi-select mode', () => {
    renderWithTheme(
      <AppSelect
        label="Multi Select"
        options={mockOptions}
        isMulti
        value={[mockOptions[0], mockOptions[1]]}
      />
    );
    // With react-select multi mode, selected items are displayed
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('handles disabled state', () => {
    renderWithTheme(
      <AppSelect
        label="Select Option"
        options={mockOptions}
        isDisabled
      />
    );
    // Check that the component renders without errors
    expect(screen.getByText('Select Option')).toBeInTheDocument();
  });
});
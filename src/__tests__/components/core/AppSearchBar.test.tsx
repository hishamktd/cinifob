import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AppSearchBar } from '@core/components/app-search-bar';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('AppSearchBar', () => {
  it('renders with placeholder', () => {
    renderWithTheme(
      <AppSearchBar
        value=""
        onChange={() => {}}
        placeholder="Search movies..."
      />
    );
    const input = screen.getByPlaceholderText('Search movies...');
    expect(input).toBeInTheDocument();
  });

  it('displays the current value', () => {
    renderWithTheme(
      <AppSearchBar
        value="Star Wars"
        onChange={() => {}}
      />
    );
    const input = screen.getByDisplayValue('Star Wars');
    expect(input).toBeInTheDocument();
  });

  it('calls onChange when typing', async () => {
    const handleChange = vi.fn();
    renderWithTheme(
      <AppSearchBar
        value=""
        onChange={handleChange}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Matrix' } });

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith('Matrix');
    });
  });

  it('shows loading state', () => {
    renderWithTheme(
      <AppSearchBar
        value=""
        onChange={() => {}}
        loading
      />
    );
    const loader = screen.getByRole('progressbar');
    expect(loader).toBeInTheDocument();
  });

  it('calls onSearch when Enter is pressed', () => {
    const handleSearch = vi.fn();
    renderWithTheme(
      <AppSearchBar
        value="Inception"
        onChange={() => {}}
        onSearch={handleSearch}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.keyPress(input, { key: 'Enter', code: 13, charCode: 13 });

    expect(handleSearch).toHaveBeenCalledWith('Inception');
  });

  it('displays search icon', () => {
    renderWithTheme(
      <AppSearchBar
        value=""
        onChange={() => {}}
      />
    );
    const icon = screen.getByTestId('SearchIcon');
    expect(icon).toBeInTheDocument();
  });

  it('renders with custom width', () => {
    const { container } = renderWithTheme(
      <AppSearchBar
        value=""
        onChange={() => {}}
        fullWidth
      />
    );
    const textField = container.querySelector('.MuiTextField-root');
    expect(textField).toHaveClass('MuiFormControl-fullWidth');
  });
});
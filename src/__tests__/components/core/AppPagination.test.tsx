import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AppPagination } from '@core/components/app-pagination';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('AppPagination', () => {
  it('renders with correct page count', () => {
    renderWithTheme(
      <AppPagination
        page={1}
        count={10}
        onChange={() => {}}
      />
    );
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('highlights current page', () => {
    renderWithTheme(
      <AppPagination
        page={5}
        count={10}
        onChange={() => {}}
      />
    );
    const currentPage = screen.getByLabelText('page 5');
    expect(currentPage).toHaveAttribute('aria-current', 'true');
  });

  it('calls onChange when page is clicked', () => {
    const handleChange = vi.fn();
    renderWithTheme(
      <AppPagination
        page={1}
        count={10}
        onChange={handleChange}
      />
    );

    const page3 = screen.getByLabelText('Go to page 3');
    fireEvent.click(page3);

    expect(handleChange).toHaveBeenCalledWith(expect.any(Object), 3);
  });

  it('disables previous button on first page', () => {
    renderWithTheme(
      <AppPagination
        page={1}
        count={10}
        onChange={() => {}}
      />
    );
    const prevButton = screen.getByLabelText('Go to previous page');
    expect(prevButton).toBeDisabled();
  });

  it('disables next button on last page', () => {
    renderWithTheme(
      <AppPagination
        page={10}
        count={10}
        onChange={() => {}}
      />
    );
    const nextButton = screen.getByLabelText('Go to next page');
    expect(nextButton).toBeDisabled();
  });

  it('renders with custom color', () => {
    renderWithTheme(
      <AppPagination
        page={1}
        count={5}
        onChange={() => {}}
        color="secondary"
      />
    );
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
  });

  it('renders with custom variant', () => {
    renderWithTheme(
      <AppPagination
        page={1}
        count={5}
        onChange={() => {}}
        variant="outlined"
      />
    );
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
  });

  it('renders with custom size', () => {
    renderWithTheme(
      <AppPagination
        page={1}
        count={5}
        onChange={() => {}}
        size="large"
      />
    );
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
  });

  it('shows correct sibling count', () => {
    renderWithTheme(
      <AppPagination
        page={5}
        count={20}
        onChange={() => {}}
        siblingCount={2}
      />
    );
    // Should show pages 3, 4, 5, 6, 7
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('handles boundary count', () => {
    renderWithTheme(
      <AppPagination
        page={10}
        count={20}
        onChange={() => {}}
        boundaryCount={2}
      />
    );
    // Should show first 2 and last 2 pages
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('19')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });
});
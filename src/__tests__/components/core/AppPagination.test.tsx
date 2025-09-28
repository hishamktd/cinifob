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
        currentPage={1}
        totalPages={10}
        onPageChange={() => {}}
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
        currentPage={5}
        totalPages={10}
        onPageChange={() => {}}
      />
    );
    const currentPage = screen.getByLabelText('page 5');
    expect(currentPage).toHaveAttribute('aria-current', 'page');
  });

  it('calls onPageChange when page is clicked', () => {
    const handleChange = vi.fn();
    renderWithTheme(
      <AppPagination
        currentPage={1}
        totalPages={10}
        onPageChange={handleChange}
      />
    );

    const page3 = screen.getByLabelText('Go to page 3');
    fireEvent.click(page3);

    expect(handleChange).toHaveBeenCalledWith(3);
  });

  it('disables previous button on first page', () => {
    renderWithTheme(
      <AppPagination
        currentPage={1}
        totalPages={10}
        onPageChange={() => {}}
      />
    );
    const prevButton = screen.getByLabelText('Go to previous page');
    expect(prevButton).toBeDisabled();
  });

  it('disables next button on last page', () => {
    renderWithTheme(
      <AppPagination
        currentPage={10}
        totalPages={10}
        onPageChange={() => {}}
      />
    );
    const nextButton = screen.getByLabelText('Go to next page');
    expect(nextButton).toBeDisabled();
  });

  it('renders with custom size', () => {
    renderWithTheme(
      <AppPagination
        currentPage={1}
        totalPages={5}
        onPageChange={() => {}}
        size="large"
      />
    );
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
  });

  it('shows items info when provided', () => {
    renderWithTheme(
      <AppPagination
        currentPage={1}
        totalPages={5}
        totalItems={50}
        itemsPerPage={10}
        onPageChange={() => {}}
        showInfo
      />
    );
    expect(screen.getByText('1-10 of 50')).toBeInTheDocument();
  });

  it('renders with compact variant', () => {
    renderWithTheme(
      <AppPagination
        currentPage={1}
        totalPages={5}
        onPageChange={() => {}}
        variant="compact"
      />
    );
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
  });

  it('does not render when totalPages is 1', () => {
    const { container } = renderWithTheme(
      <AppPagination
        currentPage={1}
        totalPages={1}
        onPageChange={() => {}}
      />
    );
    expect(container.firstChild).toBeNull();
  });
});
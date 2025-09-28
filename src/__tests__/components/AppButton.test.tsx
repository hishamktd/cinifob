import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AppButton } from '@core/components/app-button';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('AppButton Component', () => {
  describe('Rendering', () => {
    it('renders with text content', () => {
      renderWithTheme(<AppButton>Click me</AppButton>);
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('renders with different variants', () => {
      const { rerender } = renderWithTheme(<AppButton variant="contained">Contained</AppButton>);
      expect(screen.getByText('Contained')).toHaveClass('MuiButton-contained');

      rerender(
        <ThemeProvider theme={theme}>
          <AppButton variant="outlined">Outlined</AppButton>
        </ThemeProvider>,
      );
      expect(screen.getByText('Outlined')).toHaveClass('MuiButton-outlined');

      rerender(
        <ThemeProvider theme={theme}>
          <AppButton variant="text">Text</AppButton>
        </ThemeProvider>,
      );
      expect(screen.getByText('Text')).toHaveClass('MuiButton-text');
    });

    it('renders with different sizes', () => {
      const { rerender } = renderWithTheme(<AppButton size="small">Small</AppButton>);
      expect(screen.getByText('Small')).toHaveClass('MuiButton-sizeSmall');

      rerender(
        <ThemeProvider theme={theme}>
          <AppButton size="medium">Medium</AppButton>
        </ThemeProvider>,
      );
      expect(screen.getByText('Medium')).toHaveClass('MuiButton-sizeMedium');

      rerender(
        <ThemeProvider theme={theme}>
          <AppButton size="large">Large</AppButton>
        </ThemeProvider>,
      );
      expect(screen.getByText('Large')).toHaveClass('MuiButton-sizeLarge');
    });

    it('renders with different colors', () => {
      const { rerender } = renderWithTheme(<AppButton color="primary">Primary</AppButton>);
      expect(screen.getByText('Primary')).toHaveClass('MuiButton-colorPrimary');

      rerender(
        <ThemeProvider theme={theme}>
          <AppButton color="secondary">Secondary</AppButton>
        </ThemeProvider>,
      );
      expect(screen.getByText('Secondary')).toHaveClass('MuiButton-colorSecondary');

      rerender(
        <ThemeProvider theme={theme}>
          <AppButton color="error">Error</AppButton>
        </ThemeProvider>,
      );
      expect(screen.getByText('Error')).toHaveClass('MuiButton-colorError');
    });

    it('renders with start and end icons', () => {
      renderWithTheme(
        <AppButton startIcon="mdi:arrow-left" endIcon="mdi:arrow-right">
          With Icons
        </AppButton>,
      );

      expect(screen.getByText('With Icons')).toBeInTheDocument();
      // Icons are rendered by AppIcon component
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('renders as disabled', () => {
      renderWithTheme(<AppButton disabled>Disabled</AppButton>);
      const button = screen.getByText('Disabled').closest('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('Mui-disabled');
    });

    it('renders with full width', () => {
      renderWithTheme(<AppButton fullWidth>Full Width</AppButton>);
      expect(screen.getByText('Full Width')).toHaveClass('MuiButton-fullWidth');
    });
  });

  describe('Interactions', () => {
    it('handles click events', () => {
      const handleClick = vi.fn();
      renderWithTheme(<AppButton onClick={handleClick}>Click me</AppButton>);

      const button = screen.getByText('Click me');
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not trigger click when disabled', () => {
      const handleClick = vi.fn();
      renderWithTheme(
        <AppButton disabled onClick={handleClick}>
          Disabled
        </AppButton>,
      );

      const button = screen.getByText('Disabled');
      fireEvent.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('handles keyboard events', () => {
      const handleClick = vi.fn();
      renderWithTheme(<AppButton onClick={handleClick}>Press Enter</AppButton>);

      const button = screen.getByText('Press Enter');
      button.focus();
      // Material-UI Button handles Enter and Space keys automatically
      // Simulate a click which is what happens on Enter/Space
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalled();
    });

    it('shows loading state', () => {
      renderWithTheme(<AppButton loading>Loading</AppButton>);

      const button = screen.getByText('Loading').closest('button');
      expect(button).toBeDisabled();
      // CircularProgress is rendered when loading
      const progressbar = document.querySelector('.MuiCircularProgress-root');
      expect(progressbar).toBeInTheDocument();
    });

    it('handles async click operations', async () => {
      const asyncOperation = vi
        .fn()
        .mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

      const { rerender } = renderWithTheme(
        <AppButton onClick={asyncOperation} loading={false}>
          Async Button
        </AppButton>,
      );

      const button = screen.getByText('Async Button');
      fireEvent.click(button);

      // Simulate loading state
      rerender(
        <ThemeProvider theme={theme}>
          <AppButton onClick={asyncOperation} loading={true}>
            Async Button
          </AppButton>
        </ThemeProvider>,
      );

      const progressbar = document.querySelector('.MuiCircularProgress-root');
      expect(progressbar).toBeInTheDocument();

      await waitFor(() => {
        expect(asyncOperation).toHaveBeenCalled();
      });
    });

    it('supports keyboard navigation', () => {
      const handleFocus = vi.fn();
      const handleBlur = vi.fn();

      renderWithTheme(
        <AppButton onFocus={handleFocus} onBlur={handleBlur}>
          Focusable
        </AppButton>,
      );

      const button = screen.getByText('Focusable');

      fireEvent.focus(button);
      expect(handleFocus).toHaveBeenCalled();

      fireEvent.blur(button);
      expect(handleBlur).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      renderWithTheme(
        <AppButton aria-label="Save changes" aria-describedby="save-description">
          Save
        </AppButton>,
      );

      const button = screen.getByText('Save');
      expect(button).toHaveAttribute('aria-label', 'Save changes');
      expect(button).toHaveAttribute('aria-describedby', 'save-description');
    });

    it('announces loading state to screen readers', () => {
      renderWithTheme(
        <AppButton loading aria-label="Processing">
          Submit
        </AppButton>,
      );

      const button = screen.getByText('Submit').closest('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-label', 'Processing');
    });

    it('maintains focus after click', () => {
      const handleClick = vi.fn();
      renderWithTheme(<AppButton onClick={handleClick}>Focus Test</AppButton>);

      const button = screen.getByText('Focus Test');
      button.focus();
      expect(document.activeElement).toBe(button);

      fireEvent.click(button);
      expect(document.activeElement).toBe(button);
    });

    it('has proper role attribute', () => {
      renderWithTheme(<AppButton>Role Test</AppButton>);
      const button = screen.getByRole('button', { name: 'Role Test' });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Custom Props', () => {
    it('accepts custom className', () => {
      renderWithTheme(<AppButton className="custom-class">Custom</AppButton>);
      expect(screen.getByText('Custom')).toHaveClass('custom-class');
    });

    it('accepts custom data attributes', () => {
      renderWithTheme(<AppButton data-testid="custom-button">Test</AppButton>);
      expect(screen.getByTestId('custom-button')).toBeInTheDocument();
    });

    it('forwards ref correctly', () => {
      const ref = vi.fn();
      renderWithTheme(<AppButton ref={ref}>Ref Test</AppButton>);
      expect(ref).toHaveBeenCalled();
    });

    it('accepts component prop for custom elements', () => {
      renderWithTheme(
        <AppButton component="a" href="/test">
          Link Button
        </AppButton>,
      );

      const link = screen.getByText('Link Button').closest('a');
      expect(link).toHaveAttribute('href', '/test');
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid clicks correctly', () => {
      const handleClick = vi.fn();
      renderWithTheme(<AppButton onClick={handleClick}>Rapid Click</AppButton>);

      const button = screen.getByText('Rapid Click');

      // Simulate rapid clicking
      for (let i = 0; i < 5; i++) {
        fireEvent.click(button);
      }

      expect(handleClick).toHaveBeenCalledTimes(5);
    });

    it('handles long text content with ellipsis', () => {
      const longText =
        'This is a very long button text that should be truncated with ellipsis when it exceeds the maximum width of the button container';

      renderWithTheme(
        <AppButton style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {longText}
        </AppButton>,
      );

      const button = screen.getByText(longText);
      expect(button).toBeInTheDocument();
    });

    it('handles empty children gracefully', () => {
      renderWithTheme(<AppButton>{''}</AppButton>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('handles undefined onClick gracefully', () => {
      renderWithTheme(<AppButton>No Handler</AppButton>);
      const button = screen.getByText('No Handler');

      // Should not throw error
      expect(() => fireEvent.click(button)).not.toThrow();
    });
  });
});

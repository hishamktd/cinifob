import { SxProps, Theme } from '@mui/material';

export interface SearchSuggestion {
  id: string | number;
  label: string;
  subtitle?: string;
  category?: string;
  icon?: string;
}

export interface AppSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
  placeholder?: string;
  suggestions?: SearchSuggestion[];
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  variant?: 'outlined' | 'filled' | 'standard';
  size?: 'small' | 'medium';
  showClearButton?: boolean;
  showSearchButton?: boolean;
  debounceMs?: number;
  maxSuggestions?: number;
  recentSearches?: string[];
  onRecentSearchSelect?: (search: string) => void;
  filterOptions?: Array<{
    label: string;
    value: string;
    icon?: string;
  }>;
  activeFilters?: string[];
  onFilterChange?: (filters: string[]) => void;
  sx?: SxProps<Theme>;
}

'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Autocomplete,
  Paper,
  Typography,
  Chip,
  CircularProgress,
  Fade,
} from '@mui/material';
import { AppIcon } from '../app-icon';
import { useDebounce } from '@/hooks/useDebounce';
import { AppSearchBarProps } from './types';

export const AppSearchBar = ({
  value,
  onChange,
  onSearch,
  onSuggestionSelect,
  placeholder = 'Search...',
  suggestions = [],
  loading = false,
  disabled = false,
  fullWidth = true,
  variant = 'outlined',
  size = 'medium',
  showClearButton = true,
  showSearchButton = true,
  debounceMs = 300,
  maxSuggestions = 10,
  recentSearches = [],
  onRecentSearchSelect,
  filterOptions = [],
  activeFilters = [],
  onFilterChange,
  sx,
}: AppSearchBarProps) => {
  const [focused, setFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(value);
  const debouncedValue = useDebounce(internalValue, debounceMs);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, onChange, value]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(event.target.value);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && onSearch) {
      onSearch(internalValue);
    }
  };

  const handleClear = () => {
    setInternalValue('');
    onChange('');
  };

  const handleSearchClick = () => {
    if (onSearch) {
      onSearch(internalValue);
    }
  };

  const handleFilterToggle = (filterValue: string) => {
    if (!onFilterChange) return;

    const newFilters = activeFilters.includes(filterValue)
      ? activeFilters.filter((f) => f !== filterValue)
      : [...activeFilters, filterValue];

    onFilterChange(newFilters);
  };

  const visibleSuggestions = suggestions.slice(0, maxSuggestions);
  const showRecentSearches = recentSearches.length > 0 && !internalValue && focused;

  return (
    <Box sx={{ width: fullWidth ? '100%' : 'auto', ...sx }}>
      {/* Filters */}
      {filterOptions.length > 0 && (
        <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {filterOptions.map((filter) => (
            <Chip
              key={filter.value}
              label={filter.label}
              onClick={() => handleFilterToggle(filter.value)}
              variant={activeFilters.includes(filter.value) ? 'filled' : 'outlined'}
              color={activeFilters.includes(filter.value) ? 'primary' : 'default'}
              size="small"
              icon={filter.icon ? <AppIcon icon={filter.icon} size={16} /> : undefined}
            />
          ))}
        </Box>
      )}

      {/* Search Input */}
      <Autocomplete
        freeSolo
        options={visibleSuggestions}
        getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
        inputValue={internalValue}
        onInputChange={(_, newValue) => {
          setInternalValue(newValue);
        }}
        onChange={(_, newValue) => {
          if (newValue && typeof newValue !== 'string') {
            onSuggestionSelect?.(newValue);
          }
        }}
        loading={loading}
        disabled={disabled}
        PaperComponent={({ children, ...props }) => (
          <Paper {...props} elevation={8}>
            {showRecentSearches && (
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Recent Searches
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {recentSearches.slice(0, 5).map((search, index) => (
                    <Chip
                      key={index}
                      label={search}
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        onRecentSearchSelect?.(search);
                        setInternalValue(search);
                      }}
                      icon={<AppIcon icon="mdi:history" size={14} />}
                    />
                  ))}
                </Box>
              </Box>
            )}
            {children}
          </Paper>
        )}
        renderOption={(props, option) => (
          <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {option.icon && <AppIcon icon={option.icon} size={20} />}
            <Box sx={{ flex: 1 }}>
              <Typography variant="body1">{option.label}</Typography>
              {option.subtitle && (
                <Typography variant="caption" color="text.secondary">
                  {option.subtitle}
                </Typography>
              )}
            </Box>
            {option.category && <Chip label={option.category} size="small" variant="outlined" />}
          </Box>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={placeholder}
            variant={variant}
            size={size}
            fullWidth={fullWidth}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <AppIcon icon="mdi:magnify" size={20} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {loading && (
                      <Fade in>
                        <CircularProgress size={16} />
                      </Fade>
                    )}
                    {showClearButton && internalValue && (
                      <IconButton size="small" onClick={handleClear} disabled={disabled}>
                        <AppIcon icon="mdi:close" size={16} />
                      </IconButton>
                    )}
                    {showSearchButton && (
                      <IconButton size="small" onClick={handleSearchClick} disabled={disabled}>
                        <AppIcon icon="mdi:arrow-right" size={16} />
                      </IconButton>
                    )}
                  </Box>
                </InputAdornment>
              ),
            }}
          />
        )}
      />
    </Box>
  );
};

export type { AppSearchBarProps, SearchSuggestion } from './types';

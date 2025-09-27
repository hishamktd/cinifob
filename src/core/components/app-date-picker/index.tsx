'use client';

import React from 'react';
import ReactDatePicker from 'react-datepicker';

import { FormControl, FormHelperText, FormLabel, TextField, useTheme } from '@mui/material';

import 'react-datepicker/dist/react-datepicker.css';
import { DATE_FORMATS } from '@core/constants';

import { AppIcon } from '../app-icon';
import { DatePickerStyles } from './DatePickerStyles';
import { AppDatePickerProps } from './types';

export const AppDatePicker = ({
  label,
  error,
  helperText,
  required,
  value,
  onChange,
  fullWidth = true,
  placeholderText = 'Select date',
  dateFormat = DATE_FORMATS.DEFAULT,
  minDate,
  maxDate,
  disabled,
  readOnly,
  showTimeSelect,
  timeFormat,
  timeIntervals,
  className
}: AppDatePickerProps) => {
  const theme = useTheme();

  const CustomInput = React.forwardRef<HTMLInputElement, any>(
    ({ value, onClick, onChange: inputOnChange, placeholder }, ref) => (
      <TextField
        ref={ref}
        value={value}
        onClick={onClick}
        onChange={inputOnChange}
        placeholder={placeholder}
        fullWidth={fullWidth}
        error={error}
        InputProps={{
          endAdornment: (
            <AppIcon
              icon="solar:calendar-line-duotone"
              size={20}
              style={{ color: theme.palette.text.secondary, cursor: 'pointer' }}
            />
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: theme.palette.background.paper,
            '& fieldset': {
              borderColor: error ? theme.palette.error.main : theme.palette.divider,
            },
            '&:hover fieldset': {
              borderColor: theme.palette.text.primary,
            },
            '&.Mui-focused fieldset': {
              borderColor: theme.palette.primary.main,
              borderWidth: 2,
            },
          },
        }}
      />
    ),
  );

  CustomInput.displayName = 'CustomInput';

  return (
    <FormControl fullWidth={fullWidth} error={error}>
      {label && (
        <FormLabel
          sx={{
            mb: 1,
            color: error ? 'error.main' : 'text.primary',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          {label}
          {required && <span style={{ color: theme.palette.error.main }}> *</span>}
        </FormLabel>
      )}
      <ReactDatePicker
        selected={value}
        onChange={onChange || (() => {})}
        customInput={<CustomInput />}
        placeholderText={placeholderText}
        dateFormat={dateFormat}
        minDate={minDate}
        maxDate={maxDate}
        disabled={disabled}
        readOnly={readOnly}
        showTimeSelect={showTimeSelect}
        timeFormat={timeFormat}
        timeIntervals={timeIntervals}
        className={className}
        popperClassName="date-picker-popper"
        wrapperClassName={fullWidth ? 'date-picker-wrapper-full' : 'date-picker-wrapper'}
      />
      {helperText && (
        <FormHelperText sx={{ color: error ? 'error.main' : 'text.secondary' }}>
          {helperText}
        </FormHelperText>
      )}
      <DatePickerStyles />
    </FormControl>
  );
};

export type { AppDatePickerProps } from './types';
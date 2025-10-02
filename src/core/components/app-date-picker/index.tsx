'use client';

import React from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';

export interface AppDatePickerProps {
  value?: Dayjs | null;
  onChange?: (date: Dayjs | null) => void;
  label?: string;
  disabled?: boolean;
  readOnly?: boolean;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  error?: boolean;
  helperText?: string;
  slotProps?: {
    textField?: {
      fullWidth?: boolean;
      size?: 'small' | 'medium';
      error?: boolean;
      helperText?: string;
      sx?: Record<string, unknown>;
    };
  };
}

export const AppDatePicker: React.FC<AppDatePickerProps> = ({
  fullWidth = false,
  size = 'medium',
  error = false,
  helperText,
  slotProps,
  ...datePickerProps
}) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        {...datePickerProps}
        slotProps={{
          ...slotProps,
          textField: {
            fullWidth,
            size,
            error,
            helperText,
            ...slotProps?.textField,
          },
        }}
      />
    </LocalizationProvider>
  );
};

export default AppDatePicker;

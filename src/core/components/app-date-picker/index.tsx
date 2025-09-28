'use client';

import React from 'react';
import { DatePicker, DatePickerProps } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';

export interface AppDatePickerProps extends Omit<DatePickerProps<Dayjs>, 'renderInput'> {
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  error?: boolean;
  helperText?: string;
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

export type { AppDatePickerProps };
export default AppDatePicker;

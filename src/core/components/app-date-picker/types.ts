export interface AppDatePickerProps {
  label?: string;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  fullWidth?: boolean;
  placeholderText?: string;
  dateFormat?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  readOnly?: boolean;
  showTimeSelect?: boolean;
  timeFormat?: string;
  timeIntervals?: number;
  className?: string;
}

import { Props as ReactSelectProps } from 'react-select';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface AppSelectProps extends Omit<ReactSelectProps<SelectOption>, 'styles'> {
  label?: string;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  fullWidth?: boolean;
}

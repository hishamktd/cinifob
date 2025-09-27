import { StylesConfig } from 'react-select';

import { Theme } from '@mui/material';

import { SelectOption } from '../types';

export const getSelectStyles = (
  theme: Theme,
  error?: boolean,
): StylesConfig<SelectOption, boolean> => ({
  control: (provided, state) => ({
    ...provided,
    backgroundColor: theme.palette.background.paper,
    borderColor: error
      ? theme.palette.error.main
      : state.isFocused
        ? theme.palette.primary.main
        : theme.palette.divider,
    borderWidth: state.isFocused ? 2 : 1,
    borderRadius: theme.shape.borderRadius,
    minHeight: 56,
    boxShadow: 'none',
    '&:hover': {
      borderColor: state.isFocused ? theme.palette.primary.main : theme.palette.text.primary,
    },
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[8],
    marginTop: 4,
    zIndex: theme.zIndex.modal,
  }),
  menuList: (provided) => ({
    ...provided,
    padding: 4,
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? theme.palette.primary.main
      : state.isFocused
        ? theme.palette.action.hover
        : 'transparent',
    color: state.isSelected ? theme.palette.primary.contrastText : theme.palette.text.primary,
    padding: '8px 12px',
    borderRadius: Number(theme.shape.borderRadius) / 2,
    margin: '2px 0',
    cursor: 'pointer',
    '&:active': {
      backgroundColor: theme.palette.action.selected,
    },
  }),
  input: (provided) => ({
    ...provided,
    color: theme.palette.text.primary,
  }),
  placeholder: (provided) => ({
    ...provided,
    color: theme.palette.text.secondary,
  }),
  singleValue: (provided) => ({
    ...provided,
    color: theme.palette.text.primary,
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: theme.palette.primary.light,
    borderRadius: Number(theme.shape.borderRadius) / 2,
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: theme.palette.primary.contrastText,
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
      color: theme.palette.primary.contrastText,
    },
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: theme.palette.text.secondary,
    '&:hover': {
      color: theme.palette.text.primary,
    },
  }),
  clearIndicator: (provided) => ({
    ...provided,
    color: theme.palette.text.secondary,
    '&:hover': {
      color: theme.palette.error.main,
    },
  }),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getSelectTheme = (theme: Theme) => (selectTheme: any) => ({
  ...selectTheme,
  borderRadius: theme.shape.borderRadius,
  colors: {
    ...selectTheme.colors,
    primary: theme.palette.primary.main,
    primary75: theme.palette.primary.light,
    primary50: theme.palette.primary.light,
    primary25: theme.palette.action.hover,
    danger: theme.palette.error.main,
    dangerLight: theme.palette.error.light,
    neutral0: theme.palette.background.paper,
    neutral5: theme.palette.action.hover,
    neutral10: theme.palette.divider,
    neutral20: theme.palette.divider,
    neutral30: theme.palette.divider,
    neutral40: theme.palette.text.secondary,
    neutral50: theme.palette.text.secondary,
    neutral60: theme.palette.text.secondary,
    neutral70: theme.palette.text.primary,
    neutral80: theme.palette.text.primary,
    neutral90: theme.palette.text.primary,
  },
  spacing: {
    ...selectTheme.spacing,
    baseUnit: 4,
    controlHeight: 56,
    menuGutter: 8,
  },
});
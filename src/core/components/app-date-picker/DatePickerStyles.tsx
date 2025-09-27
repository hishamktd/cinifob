'use client';

import React from 'react';

import { useTheme } from '@mui/material';

export const DatePickerStyles = () => {
  const theme = useTheme();

  return (
    <style jsx global>{`
      .date-picker-wrapper-full {
        width: 100%;
      }
      .date-picker-popper {
        z-index: ${theme.zIndex.modal} !important;
      }
      .react-datepicker {
        font-family: ${theme.typography.fontFamily};
        background-color: ${theme.palette.background.paper};
        border: 1px solid ${theme.palette.divider};
        border-radius: ${theme.shape.borderRadius}px;
        box-shadow: ${theme.shadows[8]};
      }
      .react-datepicker__header {
        background-color: ${theme.palette.primary.main};
        border-bottom: none;
        border-radius: ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0;
        padding: 16px;
      }
      .react-datepicker__current-month,
      .react-datepicker__day-name {
        color: ${theme.palette.primary.contrastText};
      }
      .react-datepicker__day {
        color: ${theme.palette.text.primary};
        border-radius: ${Number(theme.shape.borderRadius) / 2}px;
        transition: all 0.2s;
      }
      .react-datepicker__day:hover {
        background-color: ${theme.palette.action.hover};
      }
      .react-datepicker__day--selected {
        background-color: ${theme.palette.primary.main};
        color: ${theme.palette.primary.contrastText};
      }
      .react-datepicker__day--selected:hover {
        background-color: ${theme.palette.primary.dark};
      }
      .react-datepicker__day--keyboard-selected {
        background-color: ${theme.palette.primary.light};
        color: ${theme.palette.primary.contrastText};
      }
      .react-datepicker__day--today {
        font-weight: bold;
        border: 2px solid ${theme.palette.primary.main};
      }
      .react-datepicker__navigation {
        top: 16px;
      }
      .react-datepicker__navigation-icon::before {
        border-color: ${theme.palette.primary.contrastText};
      }
      .react-datepicker__day--disabled {
        color: ${theme.palette.text.disabled};
        cursor: not-allowed;
      }
      .react-datepicker__month-container {
        background-color: ${theme.palette.background.paper};
      }
      .react-datepicker__time-container {
        background-color: ${theme.palette.background.paper};
        border-left: 1px solid ${theme.palette.divider};
      }
      .react-datepicker__time-list-item {
        color: ${theme.palette.text.primary};
        transition: all 0.2s;
      }
      .react-datepicker__time-list-item:hover {
        background-color: ${theme.palette.action.hover};
      }
      .react-datepicker__time-list-item--selected {
        background-color: ${theme.palette.primary.main};
        color: ${theme.palette.primary.contrastText};
      }
    `}</style>
  );
};
import React from 'react';

export interface MenuItem {
  name: string;
  link: string;
  icon?: React.ReactNode;
}

export interface MenuProps {
  list: Array<MenuItem>;
}
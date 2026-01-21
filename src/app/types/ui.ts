import { type JSX, FunctionComponent } from 'react';

export type TabItem = {
  id: string;
  label: JSX | string;
  Component: FunctionComponent;
}
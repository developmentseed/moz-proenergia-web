import { type JSX, FunctionComponent } from 'react';

export type TabItem = {
  id: string;
  label: string;
  Component: FunctionComponent;
}
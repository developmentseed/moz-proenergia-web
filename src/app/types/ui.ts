import { JSX, FunctionComponent } from 'react';

export type TabItem = {
  id: string;
  label: JSX.Element;
  Component: FunctionComponent;
}
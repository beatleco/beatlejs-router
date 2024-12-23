import { createElement, type ReactNode } from 'react';
import { RouteContext } from './context';

export function Group(props: {
  children?: ReactNode;
  name: string;
  default: string | (() => string) | undefined;
}) {
  return (
    createElement(RouteContext.Provider, {
      value: {
        group: props.name,
        default: props.default,
      },
      children: props.children,
    }) ?? null
  );
}

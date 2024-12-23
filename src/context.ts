import { createContext } from 'react';

export type BRouteContext = {
  group: string;
  default?: string | (() => string) | undefined;
};

export const RouteContext = createContext<Partial<BRouteContext>>({});

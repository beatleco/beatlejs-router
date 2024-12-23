import { useService } from 'beatlejs/react';
import { createElement, type PropsWithChildren } from 'react';
import { $Nav } from './$Nav';
import { Handler } from './Handler';

export function Router({
  default: def,
  children,
  skeleton,
}: PropsWithChildren<{
  skeleton?: any;
  forced?: boolean;
  default: string | ((current?: string) => string);
}>) {
  const [svc] = useService([$Nav]);
  svc.blueprints.clear();
  svc.defaults.clear();
  svc.default = typeof def === 'string' ? def : def(svc.head);
  return [children, createElement(Handler, { skeleton })];
}

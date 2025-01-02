import { useService } from 'beatlejs/integrations/react';
import { createElement, type PropsWithChildren } from 'react';
import { $Router } from './$Router';
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
  const [svc] = useService([$Router]);
  svc.blueprints.clear();
  svc.defaults.clear();
  svc.default = typeof def === 'string' ? def : def(svc.head);
  return [
    children,
    createElement(Handler, { key: 'beatlejs-router', skeleton }),
  ];
}

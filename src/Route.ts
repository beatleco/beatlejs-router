import { useService } from 'beatlejs/react';
import { lazy as ReactLazy, useContext } from 'react';
import { $Router } from './$Router';
import { RouteContext } from './context';

export function Route({
  name,
  prev,
  next,
  component,
  lazy,
  skeleton,
}: {
  name: string;
  prev?: string | 'exit';
  next?: string | 'exit';
  component?: any;
  lazy?: any;
  skeleton?: any;
}) {
  const context = useContext(RouteContext);
  const [svc] = useService([$Router]);

  if (context.group && context.default)
    svc.defaults.set(context.group, context.default);
  const key = name.indexOf('.') === -1 ? `${context.group}.${name}` : name;
  svc.blueprints.set(key, {
    group: context.group,
    key,
    skeleton,
    next:
      next === 'exit'
        ? next
        : next?.indexOf('.') === -1
          ? `${context.group}.${next}`
          : next,
    prev:
      prev === 'exit'
        ? prev
        : prev?.indexOf('.') === -1
          ? `${context.group}.${prev}`
          : prev,
    component: lazy ? ReactLazy(lazy) : component,
  });

  return null;
}

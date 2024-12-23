import { useSignal } from 'beatlejs/plugins/signal';
import React, { Suspense, createElement } from 'react';
import { $Router } from './$Router';

export function Handler({ skeleton }: { skeleton?: any }) {
  const [svc] = useSignal([$Router]);
  if (!svc || svc.blueprints.size == 0) return null;
  let el = svc.blueprints.get(svc.head);
  if (!el) {
    el = svc.resolve(svc.default);
    svc.head = el?.key ?? '';
  }
  if (!el?.component) return null;
  const skel = el.skeleton ?? skeleton ?? null;
  return createElement(Suspense, {
    key: svc.head,
    fallback: skel ? React.createElement(skel) : null,
    children: createElement(el.component, {
      params: svc?.props?.get?.(svc.head),
    }),
  });
}

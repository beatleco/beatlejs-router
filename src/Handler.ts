import { useSignal } from "beatlejs/integrations/react";
import React, { Suspense, createElement, useMemo, useRef } from "react";
import { $Router } from "./$Router";
import type { BCompositor } from "./types";

export function Handler({
  skeleton,
  compositor,
}: {
  skeleton?: any;
  compositor?: BCompositor;
}) {
  const [svc] = useSignal([$Router]);
  const current = useMemo(() => {
    if (!svc || svc.blueprints.size == 0) return null;
    let el = svc.blueprints.get(svc.head);
    if (!el) {
      el = svc.resolve(svc.default);
      svc.head = el?.key ?? "";
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [svc.signal]);
  const list = useRef<[any, any]>([null, null]);
  if (!compositor) return current;
  list.current[0] = list.current[1];
  list.current[1] = current;
  return compositor({
    head: svc.head,
    context: svc.context,
    prev: list.current[0],
    next: list.current[1],
  });
}

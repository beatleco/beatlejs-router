import { func, Service, val } from "beatlejs";
import { signal } from "beatlejs/integrations/react";
import { persist } from "beatlejs/plugins/persist";
import { deepEqual } from "./deepEqual";
import type { BRouteBlueprint, BRouteParams, BRouteState } from "./types";


const self = Service(
  {
    identifier: "Router",
    version: 2,
  },
  {
    signal: signal(val(0)),
    head: persist(val("")),
    context: val<any>(undefined),
    props: persist(val(new Map<string, BRouteParams>())),
    blueprints: val(new Map<string, BRouteBlueprint>()),
    defaults: val(new Map<string, string | (() => string)>()),
    flow: persist(val<[BRouteState, BRouteState][]>([])),
    default: val(""),
    gotoRoute: func(gotoRoute),
    goBack: func(goBack),
    goNext: func(goNext),
    startFlow: func(startFlow),
    finishFlow: func(finishFlow),
    IsFlowInProgress: func(IsFlowInProgress),
    invalidateProps: func(invalidateProps),
    bootstrap: func(bootstrap),
    resolve: func(resolve),
    using: func(using),
  }
);

function resetScroll() {
  window.scrollTo({ left: 0, top: 0, behavior: "instant" });
}

function bootstrap(this: typeof self) {
  handleHistoryChange.call(this);
}

function using(this: typeof self, value: any) {
  this.context = value;
  return this;
}

function resolveHead(this: typeof self) {
  let current = this.blueprints.get(this.head);
  if (!current) current = this.blueprints.get(this.default);
  return current;
}

function resolve(this: typeof self, key: string): BRouteBlueprint | undefined {
  const isRoute = key.indexOf(".") !== -1;
  // exact route
  if (isRoute) {
    let blueprint = this.blueprints.get(key);
    if (!blueprint) {
      blueprint = this.resolve(this.default);
    }
    return blueprint;
  }
  // fallback for defaults in root
  let def = this.defaults.get(key);
  if (def) {
    def = typeof def === "string" ? def : def();
    return this.resolve(`${key}.${def}`);
  }
  // look for neighbors
  const current = resolveHead.call(this);
  if (!current) return;
  return this.resolve(`${current.group}.${key}`);
}

function moveTo(
  this: typeof self,
  next: string,
  nextProps?: Record<string, unknown>
) {
  if (this.head === next) {
    const props = this.props.get(next);
    if (deepEqual(nextProps, props)) return;
  }
  if (nextProps) {
    this.props.set(next, {
      head: this.head,
      data: nextProps,
    });
  }
  resetScroll();
  this.head = next;
  this.signal++;
}
function cleanProps(this: typeof self, current: string) {
  const group = current.split(".")[0];
  this.props.forEach((_, key) => {
    if (key.indexOf(group) === 0) {
      this.props.delete(key);
    }
  });
}
function validateFlow(this: typeof self, key: string) {
  if (this.flow.length) {
    const [, next] = this.flow[this.flow.length - 1];
    const g1 = next.key.split(".")[0];
    const g2 = key.split(".")[0];
    if (g1 !== g2) {
      this.flow = [];
      cleanProps.call(this, this.head);
    }
  }
}

function gotoRoute(
  this: typeof self,
  key: string,
  props?: Record<string, unknown>
) {
  const blueprint = resolve.call(this, key);
  if (!blueprint) return;
  validateFlow.call(this, blueprint.key);
  moveTo.call(this, blueprint.key, props);
  addHistory.call(this, blueprint.key);
}

function goBack(this: typeof self, props?: Record<string, any>) {
  const blueprint = this.blueprints.get(this.head);
  if (!blueprint || !blueprint.prev) return false;
  if (blueprint.prev === "exit") {
    return this.finishFlow();
  }
  if (!this.blueprints.get(blueprint.prev)) return false;
  moveTo.call(this, blueprint.prev, props);
  return true;
}

function goNext(this: typeof self, props?: Record<string, any>) {
  const blueprint = this.blueprints.get(this.head);
  if (!blueprint || !blueprint.next) return;
  if (blueprint.next === "exit" && this.finishFlow()) return;
  if (!this.blueprints.get(blueprint.next)) return;
  moveTo.call(this, blueprint.next, props);
  addHistory.call(this, blueprint.next);
}

function startFlow(
  this: typeof self,
  key: string,
  props?: Record<string, any>
) {
  const blueprint = resolve.call(this, key);
  if (!blueprint) return;
  const currentProps = this.props.get(this.head)?.data;
  const routeState = this.flow[this.flow.length - 2];
  if (
    routeState &&
    routeState[0].key === blueprint.key &&
    deepEqual(routeState[0].props, currentProps)
  ) {
    console.log("looping not allowed");
    return;
  }
  if (blueprint.key === this.head && deepEqual(currentProps, props)) {
    console.log("already in flow");
    return;
  }
  this.flow.push([
    { key: this.head, props: currentProps },
    { key: blueprint.key, props: props },
  ]);
  moveTo.call(this, blueprint.key, props);
  addHistory.call(this, blueprint.key);
}

function finishFlow(this: typeof self, changedProps?: Record<string, any>) {
  if (this.flow.length === 0) return false;
  const [prev] = this.flow.pop()!;
  let newProps = prev.props;
  if (changedProps && newProps) {
    newProps = Object.assign(newProps, changedProps);
  } else if (changedProps && !newProps) {
    newProps = changedProps;
  } else if (!changedProps && newProps) {
    newProps = prev.props;
  } else {
    newProps = undefined;
  }
  cleanProps.call(this, this.head);
  moveTo.call(this, prev.key, newProps);
  return true;
}

function IsFlowInProgress(this: typeof self) {
  return this.flow.length !== 0;
}

function invalidateProps(this: typeof self) {
  this.props.delete(this.head);
}

function addHistory(this: typeof self, state: string) {
  const newState = `#${state}_${Math.random()}`;
  window.history.pushState(newState, "");
}

function handleHistoryChange(this: typeof self) {
  for (let i = 0; i < Math.max(0, 25 - window.history.length); i++) {
    const newState = `#${this.head}_${Math.random()}`;
    window.history.pushState(newState, "");
  }
  this.flow.forEach(() => {
    const newState = `#${this.head}_${Math.random()}`;
    window.history.pushState(newState, "");
  });
  window.addEventListener("popstate", () => {
    this.goBack();
  });
}

export const $Router = self;

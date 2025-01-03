export type BCompositor = (options: {
  head: string;
  context: any;
  prev: any;
  next: any;
}) => any;

export type BRouteParams<T = Record<string, unknown>> = {
  head?: string;
  data?: T;
};

export type WithRouteParams<T = Record<string, any>> = {
  params?: BRouteParams<T>;
} & T;

export type BRouteBlueprint = {
  group?: string;
  key: string;
  prev?: string;
  next?: string;
  component?: any;
  skeleton?: any;
};

export type BRouteState = {
  key: string;
  props?: Record<string, unknown>;
  prevKey?: string;
};
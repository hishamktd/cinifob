// Replace with proper typing - avoid using 'any' type
// This type should be replaced with specific types in actual usage
export type SafeAny = unknown;

// For cases where you need to type dynamic objects
export type DynamicObject = Record<string, unknown>;

// For event handlers that need flexible typing
export type EventHandler<T = Event> = (event: T) => void;

// For component props that accept any React node
export type ReactNodeProp = React.ReactNode;

// For API responses with unknown structure
export type CommonApiResponse<T = unknown> = {
  data?: T;
  error?: string;
  message?: string;
};

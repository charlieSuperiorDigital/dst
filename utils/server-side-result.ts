export type ServerSideResult<T> = {
  signout?: boolean;
  result: T | null;
};

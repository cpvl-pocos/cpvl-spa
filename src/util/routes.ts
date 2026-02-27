export const PRIVATE_PREFIXES = [
  '/dashboard',
  '/pilots',
  '/payment-monthly',
  '/status-list'
];

export function normalizePath(p: string) {
  // remove query/fragment e trailing slash (exceto rota root '/')
  const onlyPath = p.split('?')[0].split('#')[0];
  return onlyPath.endsWith('/') && onlyPath !== '/'
    ? onlyPath.slice(0, -1)
    : onlyPath;
}

export function isPrivatePath(pathname: string) {
  const path = normalizePath(pathname);
  return PRIVATE_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  );
}

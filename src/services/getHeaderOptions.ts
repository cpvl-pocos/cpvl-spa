const getHeaderOptions = (): any => ({
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  },
  credentials: 'include',
  cache: 'no-cache'
});

export default getHeaderOptions;

const getHeaderOptions = (): any => {
  const token = localStorage.getItem('CPVL_AUTH_TOKEN');

  return {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    credentials: 'include',
    cache: 'no-cache'
  };
};

export default getHeaderOptions;

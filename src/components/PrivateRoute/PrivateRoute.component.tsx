import { Outlet, Navigate } from 'react-router-dom';
import { useLocalStorage } from 'usehooks-ts';

export const PrivateRoutes = () => {
  const [isLogged] = useLocalStorage(
    import.meta.env.VITE_LOGGED_KEY || 'CPVL_USER_IS_LOGGED',
    false
  );
  return !Boolean(isLogged) ? <Navigate to="/login" /> : <Outlet />;
};


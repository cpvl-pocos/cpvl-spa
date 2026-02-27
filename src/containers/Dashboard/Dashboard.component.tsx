// src/containers/Dashboard/Dashboard.component.tsx
import { useCallback, useEffect, useState } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import MainNav from '../../components/MainNav';
import { API, getURI } from '../../services';
import type { IAllowedRoutes } from '../../types';
import { useFetch } from '../../hooks';
import { Outlet, useNavigate } from 'react-router-dom';
import { StatusList } from '../../pages/StatusList';
import { EmergencyContact } from '../../components/EmergencyContact';
import { EditProfile } from '../../components/EditProfile';
import { LicenseData } from '../../components/LicenseData';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AlertCircle } from 'lucide-react';

export const DashboardHome = () => {
  return <StatusList />;
};

export const Dashboard = () => {
  const [openEmergencyModal, setOpenEmergencyModal] = useState(false);
  const [openEditProfileModal, setOpenEditProfileModal] = useState(false);
  const [openLicenseModal, setOpenLicenseModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: profile } = useFetch<{
    routes: IAllowedRoutes[];
    warnings: string[];
  }>({
    url: getURI(API.profile)
  });
  const allowedRoutes = profile && profile.routes;
  const warnings = profile && profile.warnings;
  const { data: userData } = useFetch<any>({
    url: getURI(API.me)
  });

  const [, setIsLogged] = useLocalStorage(
    import.meta.env.VITE_LOGGED_KEY || 'CPVL_USER_IS_LOGGED',
    false
  );

  const { data: pilotInfo } = useFetch<any>({
    url:
      userData && userData.id
        ? getURI(`${API.pilots}/${userData.id}`)
        : undefined
  });

  const navigate = useNavigate();

  const doLogout = useCallback(() => {
    setIsLogged(false);
    navigate('/');
  }, [setIsLogged, navigate]);

  const navTo = useCallback(
    (link: IAllowedRoutes) => {
      if (link.route === 'emergency-contact') {
        setOpenEmergencyModal(true);
      } else if (link.route === 'edit-profile') {
        setOpenEditProfileModal(true);
      } else if (link.route === 'license-data') {
        setOpenLicenseModal(true);
      } else {
        navigate(`/dashboard/${link.route}`);
      }
    },
    [navigate]
  );

  const handleCloseEmergencyModal = useCallback(() => {
    setOpenEmergencyModal(false);
    setRefreshKey((prev) => prev + 1);
  }, []);

  const handleCloseEditProfileModal = useCallback(() => {
    setOpenEditProfileModal(false);
    setRefreshKey((prev) => prev + 1);
  }, []);

  const handleCloseLicenseModal = useCallback(() => {
    setOpenLicenseModal(false);
    setRefreshKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    // Se o usuário estiver na raiz do dashboard, redireciona para a primeira rota permitida
    if (
      window.location.pathname === '/dashboard' ||
      window.location.pathname === '/dashboard/'
    ) {
      if (allowedRoutes && allowedRoutes.length > 0) {
        navigate(`/dashboard/${allowedRoutes[0].route}`, { replace: true });
      }
    }
  }, [allowedRoutes, navigate]);

  if (!allowedRoutes) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <MainNav
        onLogout={doLogout}
        allowedRoutes={allowedRoutes}
        onNav={navTo}
        userData={pilotInfo || userData}
      />

      <main className="flex-1 pt-20 pb-12">
        <div key={refreshKey} className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          {warnings && warnings.length > 0 && (
            <div className="flex flex-col gap-3 mb-6 animate-in slide-in-from-top-4 duration-500">
              {warnings.map((warning, idx) => (
                <Alert key={idx} variant="destructive" className="border-amber-200 bg-amber-50 text-amber-900 border shadow-sm rounded-xl">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="font-bold">Atenção</AlertTitle>
                  <AlertDescription className="font-medium">
                    {warning}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Modals */}
      <Dialog open={openEmergencyModal} onOpenChange={setOpenEmergencyModal}>
        <DialogContent className="sm:max-w-md rounded-3xl border-none shadow-2xl bg-white/95 backdrop-blur-xl">
          {userData && (
            <EmergencyContact
              userId={userData.id}
              userName={userData.username}
              onClose={handleCloseEmergencyModal}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={openEditProfileModal} onOpenChange={setOpenEditProfileModal}>
        <DialogContent className="sm:max-w-md rounded-3xl border-none shadow-2xl bg-white/95 backdrop-blur-xl p-0 overflow-hidden">
          {userData && (
            <EditProfile
              userId={userData.id}
              onClose={handleCloseEditProfileModal}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={openLicenseModal} onOpenChange={setOpenLicenseModal}>
        <DialogContent className="sm:max-w-md rounded-3xl border-none shadow-2xl bg-white/95 backdrop-blur-xl">
          {userData && (
            <LicenseData
              userId={userData.id}
              userName={userData.username}
              onClose={handleCloseLicenseModal}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};


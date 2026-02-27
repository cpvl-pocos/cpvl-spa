// src/pages/PilotDetails/PilotDetails.component.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  CreditCard,
  Mail,
  Phone,
  ChevronRight,
  ShieldAlert,
  Settings
} from 'lucide-react';
import { useFetch } from '@/hooks';
import { API, getURI } from '@/services';
import { PaymentMonthly } from '@/components/PaymentMonthly';
import { StatusPilot } from '@/components/StatusPilot';
import type { IAllowedRoutes } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { EditProfile } from '@/components/EditProfile';
import { EmergencyContact } from '@/components/EmergencyContact';
import { LicenseData } from '@/components/LicenseData';

interface IPilotDetails {
  id?: number;
  userId: number;
  firstName: string;
  lastName: string;
  cpf: string;
  cellphone: string;
  email: string;
  status: string;
  photoUrl?: string;
}



export const PilotDetails = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [pilot, setPilot] = useState<IPilotDetails | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEmergencyContactOpen, setIsEmergencyContactOpen] = useState(false);
  const [isLicenseDataOpen, setIsLicenseDataOpen] = useState(false);

  const {
    data: pilotData,
    error: pilotError,
    loading: pilotLoading
  } = useFetch<IPilotDetails>({
    url: getURI(`${API.pilots}/${userId}`)
  });

  const { data: profile } = useFetch<{
    routes: IAllowedRoutes[];
    warnings: string[];
  }>({
    url: getURI(API.profile)
  });
  const allowedRoutes = profile && profile.routes;

  const isAdmin =
    allowedRoutes && allowedRoutes.some((r) => r.route === 'pilots');

  useEffect(() => {
    if (pilotData) {
      setPilot(pilotData);
    }
  }, [pilotData]);

  if (pilotLoading || (!pilot && !pilotError)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-400px gap-4">
        <Spinner className="w-12 h-12 text-primary" />
        <p className="text-slate-400 font-bold animate-pulse">Carregando perfil do piloto...</p>
      </div>
    );
  }

  if (pilotError || !pilot) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <Alert variant="destructive" className="rounded-2xl border-none shadow-xl">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle className="font-bold">Piloto não encontrado</AlertTitle>
          <AlertDescription className="font-medium">
            Ocorreu um erro ao carregar os detalhes do piloto. Verifique se o ID está correto.
          </AlertDescription>
          <Button variant="outline" onClick={() => navigate('/dashboard/pilots')} className="mt-4 border-red-200 text-red-700 bg-red-50 hover:bg-red-100 rounded-xl font-bold">
            Voltar para listagem
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 animate-in fade-in duration-700">
      {/* breadcrumbs & navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <nav className="flex items-center gap-2 text-sm font-medium text-muted-foreground/60">
            <button onClick={() => navigate('/dashboard')} className="hover:text-primary transition-colors">Dashboard</button>
            <ChevronRight className="w-3 h-3" />
            {isAdmin && (
              <>
                <button onClick={() => navigate('/dashboard/pilots')} className="hover:text-primary transition-colors">Pilotos</button>
                <ChevronRight className="w-3 h-3" />
              </>
            )}
            <span className="text-primary font-bold">Perfil</span>
          </nav>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            {isAdmin && (
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/pilots')} className="bg-white/50 border border-slate-100 rounded-xl hover:bg-white shadow-sm">
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </Button>
            )}
            {pilot.firstName} {pilot.lastName}
          </h1>
        </div>

        {isAdmin && (
          <div className="bg-white/50 backdrop-blur-sm p-4 rounded-3xl border border-white shadow-sm flex items-center gap-4">
            <div className="flex flex-col gap-0.5 mr-2">
              <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider text-right">Status do Sistema</span>
              <Badge className="bg-primary/10 text-primary border-none font-bold ml-auto">{pilot.status}</Badge>
            </div>
            <Separator orientation="vertical" className="h-10" />
            <StatusPilot
              currentStatus={pilot.status}
              onStatusChange={(newStatus) =>
                setPilot((prev) =>
                  prev ? { ...prev, status: newStatus } : null
                )
              }
              userId={pilot.userId}
            />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-8">
        {/* Profile Info Side */}
        <div className="w-full space-y-6">
          <Card className="rounded-[40px] border-none shadow-[0_20px_60px_rgba(0,0,0,0.05)] bg-white/70 backdrop-blur-xl overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-full h-24 bg-linear-to-br from-primary/10 to-primary/5 transition-all group-hover:h-28" />
            <CardContent className="pt-8 relative flex flex-col items-center text-center px-6 pb-10">
              <Avatar className="w-32 h-32 border-8 border-white shadow-2xl mb-6 ring-1 ring-slate-100">
                <AvatarImage src={pilot.photoUrl} alt={pilot.firstName} className="object-cover" />
                <AvatarFallback className="bg-slate-50 text-slate-300">
                  <User className="w-16 h-16" />
                </AvatarFallback>
              </Avatar>

              <h2 className="text-2xl font-black text-slate-900 mb-1 leading-tight">{pilot.firstName} {pilot.lastName}</h2>
              <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mb-6 border-b border-primary/5 pb-4 w-full">Pilot ID #{pilot.userId}</p>

              <div className="w-full space-y-4 text-left">
                <div className="flex items-center gap-4 bg-slate-50/50 p-3 rounded-2xl hover:bg-slate-50 transition-colors group/item">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary border border-slate-100 group-hover/item:scale-110 transition-all">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Documento CPF</p>
                    <p className="text-sm font-bold text-slate-700">{pilot.cpf}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-slate-50/50 p-3 rounded-2xl hover:bg-slate-50 transition-colors group/item">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary border border-slate-100 group-hover/item:scale-110 transition-all">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Contato Celular</p>
                    <p className="text-sm font-bold text-slate-700">{pilot.cellphone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-slate-50/50 p-3 rounded-2xl hover:bg-slate-50 transition-colors group/item overflow-hidden">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary border border-slate-100 group-hover/item:scale-110 transition-all flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Email Principal</p>
                    <p className="text-sm font-bold text-slate-700 truncate">{pilot.email}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setIsLicenseDataOpen(true)}
                  className="inline-flex items-center gap-2 rounded-2xl font-black border-slate-100 text-slate-400 hover:text-primary hover:border-primary/20 hover:bg-primary/5 h-12"
                >
                  <Settings className="w-4 h-4" /> Documentação
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setIsEmergencyContactOpen(true)}
                  className="inline-flex items-center gap-2 rounded-2xl font-black border-slate-100 text-slate-400 hover:text-primary hover:border-primary/20 hover:bg-primary/5 h-12"
                >
                  <Settings className="w-4 h-4" /> Emergência
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setIsEditModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-2xl font-black border-slate-100 text-slate-400 hover:text-primary hover:border-primary/20 hover:bg-primary/5 h-12"
                >
                  <Settings className="w-4 h-4" /> Perfil
                </Button>

              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payments Section */}
        <div className="w-full">
          <Card className="rounded-[40px] border-none shadow-[0_20px_60px_rgba(0,0,0,0.05)] bg-white/70 backdrop-blur-xl overflow-hidden min-h-[600px]">
            <CardHeader className="p-8 border-b border-white/50 bg-white/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-primary">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-black shadow-lg shadow-primary/20">
                    $
                  </div>
                  <CardTitle className="text-2xl font-black tracking-tight">Histórico de Mensalidades</CardTitle>
                </div>
                <Badge variant="secondary" className="rounded-full shadow-inner bg-slate-100/50 border-white px-4 font-bold">
                  Auto-updated
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-2 sm:p-4">
                <PaymentMonthly />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="flex flex-row items-center justify-center gap-4">
        <div>
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="sm:max-w-md rounded-3xl border-none shadow-2xl bg-white/95 backdrop-blur-xl p-0 overflow-hidden">
              {pilot && (
                <EditProfile
                  userId={pilot.userId}
                  onClose={() => setIsEditModalOpen(false)}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>

        <div>
          <Dialog open={isEmergencyContactOpen} onOpenChange={setIsEmergencyContactOpen}>
            <DialogContent className="sm:max-w-md rounded-3xl border-none shadow-2xl bg-white/95 backdrop-blur-xl p-0 overflow-hidden">
              {pilot && (
                <EmergencyContact
                  userId={pilot.userId}
                  onClose={() => setIsEmergencyContactOpen(false)}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>

        <div>
          <Dialog open={isLicenseDataOpen} onOpenChange={setIsLicenseDataOpen}>
            <DialogContent className="sm:max-w-md rounded-3xl border-none shadow-2xl bg-white/95 backdrop-blur-xl p-0 overflow-hidden">
              {pilot && (
                <LicenseData
                  userId={pilot.userId}
                  onClose={() => setIsLicenseDataOpen(false)}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>

      </div>
    </div>
  );
};

export default PilotDetails;  

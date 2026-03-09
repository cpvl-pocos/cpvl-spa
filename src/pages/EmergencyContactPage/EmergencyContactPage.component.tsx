// src/pages/EmergencyContactPage/EmergencyContactPage.component.tsx
import React from 'react';
import { ShieldAlert, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { EmergencyContact } from '@/components/EmergencyContact';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const EmergencyContactPage: React.FC = () => {
  const { profile, loading } = useAuth();
  const user = profile?.user;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Spinner className="w-12 h-12 text-primary" />
        <p className="text-slate-400 font-bold animate-pulse">Carregando informações de segurança...</p>
      </div>
    );
  }

  if (!user || !user.id) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <Alert variant="destructive" className="rounded-2xl border-none shadow-xl">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="font-bold">Erro de Acesso</AlertTitle>
          <AlertDescription className="font-medium">
            Não foi possível carregar as informações do usuário para atualizar o contato de emergência.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-3 sm:p-6 md:p-8 animate-in fade-in duration-700">
      <div className="sticky top-0 z-50 bg-slate-50/90 backdrop-blur-md px-4 py-3 -mx-4 border-b border-slate-100 sm:relative sm:top-auto sm:z-auto sm:mx-0 sm:px-0 sm:py-0 sm:bg-transparent sm:border-none flex items-center gap-3 sm:gap-4 transition-all duration-300">
        <div className="p-2 sm:p-3 bg-white/80 border border-slate-100 rounded-xl shadow-sm">
          <ShieldAlert className="text-primary w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-3xl font-black tracking-tight text-slate-900 truncate">
            Contato de Emergência
          </h1>
          <p className="text-slate-500 font-medium text-[10px] sm:text-base truncate">Informações vitais para sua segurança</p>
        </div>
      </div>

      <Card className="border-none shadow-[0_10px_40px_rgba(0,0,0,0.03)] bg-white/70 backdrop-blur-xl rounded-[2rem] sm:rounded-[32px] overflow-hidden">
        <CardContent className="p-0">
          <EmergencyContact userId={user.id} />
        </CardContent>
      </Card>
    </div>
  );
};

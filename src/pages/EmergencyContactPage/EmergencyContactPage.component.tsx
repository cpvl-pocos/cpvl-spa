// src/pages/EmergencyContactPage/EmergencyContactPage.component.tsx
import React from 'react';
import { ShieldAlert, AlertCircle } from 'lucide-react';
import { useFetch } from '@/hooks';
import { API, getURI } from '@/services';
import { EmergencyContact } from '@/components/EmergencyContact';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const EmergencyContactPage: React.FC = () => {
  const { data: user, loading } = useFetch<any>({
    url: getURI(API.me),
    method: 'GET'
  });

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
    <div className="flex flex-col gap-6 p-4 md:p-8 animate-in fade-in duration-700">
      <div className="space-y-1">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
          <ShieldAlert className="text-primary w-8 h-8" />
          Contato de Emergência
        </h1>
        <p className="text-slate-500 font-medium">Informações vitais para sua segurança durante as atividades</p>
      </div>

      <Card className="border-none shadow-[0_20px_60px_rgba(0,0,0,0.05)] bg-white/70 backdrop-blur-xl rounded-4x1 overflow-hidden">
        <CardContent className="p-0">
          <EmergencyContact userId={user.id} />
        </CardContent>
      </Card>
    </div>
  );
};

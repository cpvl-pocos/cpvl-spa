import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EditProfile } from '@/components/EditProfile';

export const EditProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(-1);
  };

  if (!userId) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive font-bold">Usuário não identificado.</p>
        <Button onClick={() => navigate('/dashboard')} className="mt-4">
          Voltar ao Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="bg-white/50 border border-slate-100 rounded-xl hover:bg-white shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Button>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            Configurações de Perfil
          </h1>
          <p className="text-slate-500 font-medium">Gerencie as informações básicas e foto do piloto</p>
        </div>
      </div>

      <Card className="rounded-[40px] border-none shadow-[0_20px_60px_rgba(0,0,0,0.05)] bg-white/70 backdrop-blur-xl overflow-hidden p-0">
        <CardContent className="p-0">
          <EditProfile
            userId={Number(userId)}
            onClose={handleClose}
          />
        </CardContent>
      </Card>
    </div>
  );
};

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
    <div className="flex flex-col gap-4 sm:gap-6 animate-in fade-in duration-700 pb-10">
      {/* Containerized Sticky Header for better mobile alignment */}
      <div className="sticky top-0 z-50 bg-slate-50/90 backdrop-blur-md px-4 py-3 -mx-4 border-b border-slate-100 sm:relative sm:top-auto sm:z-auto sm:mx-0 sm:px-0 sm:py-0 sm:bg-transparent sm:border-none flex items-center gap-3 sm:gap-4 transition-all duration-300">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="bg-white/80 border border-slate-100 rounded-xl hover:bg-white shadow-sm h-10 w-10 sm:h-12 sm:w-12 shrink-0"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-2xl md:text-3xl font-black tracking-tight text-slate-900 truncate">
            Perfil do Piloto
          </h1>
          <p className="text-slate-500 font-medium text-[10px] sm:text-sm md:text-base truncate">Gerencie informações e foto</p>
        </div>
      </div>

      <div className="w-full">
        <Card className="rounded-[2.5rem] border-none shadow-[0_15px_50px_rgba(0,0,0,0.04)] bg-white/70 backdrop-blur-xl overflow-hidden p-0">
          <CardContent className="p-0">
            <EditProfile
              userId={Number(userId)}
              onClose={handleClose}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// src/components/StatusPilot/StatusPilots.component.tsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useFetch } from '@/hooks';
import { API, getURI } from '@/services';

interface StatusPilotProps {
  userId: number;
  currentStatus: string;
  onStatusChange: (newStatus: string) => void;
}

export const StatusPilot = ({
  currentStatus,
  onStatusChange
}: StatusPilotProps) => {
  const { userId } = useParams<{ userId: string }>();
  const [status, setStatus] = useState(currentStatus);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Hook para fazer a requisição
  const { doFetch, loading, error } = useFetch({
    method: 'PATCH'
  });

  useEffect(() => {
    if (error) {
      setErrorMessage('Erro ao atualizar status');
    }
  }, [error]);

  const handleUpdateStatus = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const response = await doFetch({
        url: getURI(
          `${API.updateStatusPilot}?userId=${userId}&status=${status}`
        ),
        method: 'PATCH'
      });

      if (response) {
        setSuccessMessage('Status atualizado com sucesso!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
      onStatusChange(status);
    } catch (error) {
      setErrorMessage('Erro ao atualizar status');
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px] h-9 rounded-xl border-primary/20 bg-background/50 backdrop-blur-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-primary/10">
            <SelectItem value="filiado">Filiado</SelectItem>
            <SelectItem value="desfiliado">Desfiliado</SelectItem>
            <SelectItem value="expulso">Expulso</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="suspenso">Suspenso</SelectItem>
            <SelectItem value="trancado">Trancado</SelectItem>
          </SelectContent>
        </Select>

        <Button
          onClick={handleUpdateStatus}
          disabled={loading || status === currentStatus}
          size="sm"
          className="h-9 rounded-xl gap-2 font-bold px-4"
        >
          {loading ? (
            <Spinner className="h-4 w-4" />
          ) : (
            <>
              <Save size={16} />
              <span>Atualizar</span>
            </>
          )}
        </Button>
      </div>

      {errorMessage && (
        <Alert variant="destructive" className="py-2 px-3 rounded-xl animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">{errorMessage}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert variant="success" className="py-2 px-3 rounded-xl animate-in fade-in slide-in-from-top-1">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription className="text-xs">{successMessage}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

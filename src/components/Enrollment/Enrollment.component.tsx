import { useState } from 'react';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';
import { useFetch } from '@/hooks';
import { API, getURI } from '@/services';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { IPaymentMonthly } from '@/types';

interface EnrollmentProps {
  userId: number;
  currentStatus: string;
  paymentMonthlies?: IPaymentMonthly[];
  onStatusChange: (newStatus: string) => void;
  onClose: () => void;
}

export const Enrollment = ({
  userId,
  currentStatus,
  paymentMonthlies,
  onStatusChange,
  onClose,
}: EnrollmentProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { doFetch } = useFetch({ method: 'PATCH' });

  const isLocked = currentStatus?.toLowerCase() === 'trancado';

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const hasConfirmedPayment = paymentMonthlies?.some(
    (p) =>
      Number(p.ref_month) === currentMonth &&
      Number(p.ref_year) === currentYear &&
      p.status?.toLowerCase() === 'confirmado'
  ) ?? false;

  const canLock = currentStatus?.toLowerCase() === 'filiado' && hasConfirmedPayment;

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const newStatus = isLocked ? 'filiado' : 'trancado';
    setIsSubmitting(true);
    try {
      const response = await doFetch({
        url: getURI(`${API.updateStatusPilot}?userId=${userId}&status=${newStatus}`),
        method: 'PATCH',
      });

      if (response) {
        onStatusChange(newStatus);
        toast.success(
          isLocked ? 'Matrícula destrancada com sucesso!' : 'Matrícula trancada com sucesso!'
        );
        onClose();
      }
    } catch {
      toast.error('Erro ao atualizar status da matrícula.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isLocked ? 'Destrancar Matrícula' : 'Trancar Matrícula'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isLocked
              ? 'Ao destrancar, o piloto voltará a pagar as mensalidades normalmente.'
              : 'Ao trancar, o piloto não pagará mensalidades até que a matrícula seja destrancada. Referência: Artigo 18, item IX do Estatuto do Clube.'}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {!isLocked && !canLock && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Para trancar, o piloto precisa estar filiado e ter a mensalidade do mês atual
              confirmada.
            </AlertDescription>
          </Alert>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isSubmitting || (!isLocked && !canLock)}
            onClick={handleSubmit}
            variant={isLocked ? 'default' : 'destructive'}
          >
            {isSubmitting && <Spinner className="mr-2 h-4 w-4" />}
            {isLocked ? 'Destrancar' : 'Trancar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

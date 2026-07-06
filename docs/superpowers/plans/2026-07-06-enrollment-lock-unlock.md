# Plano: Trancamento / Destrancamento de Matrícula

**Branch:** `trancar_destrancar_matricula`
**Spec:** `docs/superpowers/specs/2026-07-06-enrollment-lock-unlock-design.md`
**Data:** 2026-07-06

---

## Resumo

Transformar o stub `Enrollment` num componente funcional de AlertDialog que permite trancar/destrancar matrícula. Ajustar `PilotDetails` (botão dinâmico) e `PaymentMonthly` (mensagem específica para trancado).

---

## Arquivos a modificar

| Arquivo | Mudança |
|---------|---------|
| `src/components/Enrollment/Enrollment.component.tsx` | Reescrever do stub → AlertDialog com lógica de lock/unlock |
| `src/pages/PilotDetails/PilotDetails.component.tsx` | Botão dinâmico, props para Enrollment, callback de status |
| `src/components/PaymentMonthly/PaymentMonthly.component.tsx` | Alert "Matrícula Trancada" antes do gate `isPilotFiliado` |

---

## Passo 1 — `Enrollment.component.tsx` (reescrever)

### Props

```
interface EnrollmentProps {
  userId: number;
  currentStatus: string;           // 'filiado' | 'trancado' | etc
  paymentMonthlies?: IPaymentMonthly[];
  onStatusChange: (newStatus: string) => void;
  onClose: () => void;
}
```

### Lógica

1. **`isLocked`** = `currentStatus.toLowerCase() === 'trancado'`
2. **`canLock`** = `currentStatus.toLowerCase() === 'filiado'` AND month payment confirmed:
   ```ts
   const now = new Date();
   const currentMonth = now.getMonth() + 1; // 1-12
   const currentYear = now.getFullYear();
   const hasConfirmedPayment = paymentMonthlies?.some(
     p => Number(p.ref_month) === currentMonth
       && Number(p.ref_year) === currentYear
       && p.status?.toLowerCase() === 'confirmado'
   ) ?? false;
   ```
3. **`canUnlock`** = `isLocked`
4. Botão principal:
   - Se `isLocked` → label "Destrancar Matrícula"
   - Se `canLock` → label "Trancar Matrícula"
   - Se nem `isLocked` nem `canLock` → botão desabilitado
5. **Loading state** `isSubmitting` para desabilitar botões durante PATCH
6. **API call** — seguir padrão do `StatusPilots.component.tsx`:
   ```ts
   const newStatus = isLocked ? 'filiado' : 'trancado';
   await doFetch({
     url: getURI(`${API.updateStatusPilot}?userId=${userId}&status=${newStatus}`),
     method: 'PATCH'
   });
   onStatusChange(newStatus);
   toast.success(isLocked ? 'Matrícula destrancada com sucesso!' : 'Matrícula trancada com sucesso!');
   onClose();
   ```
7. **Toast feedback** — importar `toast` de `sonner` (já instalado, componente Sonner existe em `src/components/ui/sonner.tsx`)

### UI (AlertDialog)

```tsx
<AlertDialog open={true} onOpenChange={(open) => !open && onClose()}>
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
          Para trancar, o piloto precisa estar filiado e ter a mensalidade do mês atual confirmada.
        </AlertDescription>
      </Alert>
    )}
    <AlertDialogFooter>
      <AlertDialogCancel onClick={onClose} disabled={isSubmitting}>Cancelar</AlertDialogCancel>
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
```

### Imports necessários

```ts
import { useState } from 'react';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';
import { useFetch } from '@/hooks';
import { API, getURI } from '@/services';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { IPaymentMonthly } from '@/types';
```

---

## Passo 2 — `PilotDetails.component.tsx` (editar)

### Mudanças

1. **Props dinâmicas para Enrollment** — substituir `<Enrollment />` vazio por:
   ```tsx
   <Enrollment
     userId={pilot.userId}
     currentStatus={pilot.status}
     paymentMonthlies={pilot.paymentMonthlies}
     onStatusChange={(newStatus) =>
       setPilot(prev => prev ? { ...prev, status: newStatus } : null)
     }
     onClose={() => setIsEnrollmentOpen(false)}
   />
   ```

2. **Botão dinâmico** (linhas 236-242) — label muda conforme status:
   ```tsx
   const isLocked = pilot.status?.toLowerCase() === 'trancado';
   // ...
   <Button
     variant="outline"
     onClick={() => setIsEnrollmentOpen(true)}
     className="items-center justify-start gap-2 rounded-2xl font-black border-slate-100 text-slate-500 hover:text-primary hover:border-primary/20 hover:bg-primary/5 h-12 w-full cursor-pointer"
   >
     {isLocked ? 'Destrancar Matrícula' : 'Trancar Matrícula'}
   </Button>
   ```

3. **Import de Enrollment** — já existe na linha 30, sem mudança necessária

4. **Remover comentário** `// onClose={() => setIsEnrollmentOpen(false)}` na linha 314

---

## Passo 3 — `PaymentMonthly.component.tsx` (editar)

### Mudanças

1. **Adicionar check `isPilotTrancado`** antes de `isPilotFiliado` (linha 214):
   ```ts
   const isPilotTrancado = pilot?.status?.toLowerCase() === 'trancado';
   const isPilotFiliado = pilot?.status?.toLowerCase() === 'filiado';
   ```

2. **Inserir alert específico para trancado** entre as linhas 214 e 215 (antes de `if (!isPilotFiliado)`):
   ```tsx
   if (isPilotTrancado) {
     return (
       <div className="mt-6 p-4">
         <Alert className="bg-amber-50 border-amber-200">
           <AlertCircle className="h-4 w-4 text-amber-600" />
           <AlertTitle>Matrícula Trancada</AlertTitle>
           <AlertDescription>
             Este piloto está com a matrícula <strong>trancada</strong> (Artigo 18, item IX do Estatuto do Clube). As mensalidades estão suspensas até o destrancamento.
           </AlertDescription>
        </Alert>
       </div>
     );
   }
   ```

3. **Manter o gate `isPilotFiliado` existente** como fallback para outros status

---

## Ordem de execução

1. `Enrollment.component.tsx` — componente principal
2. `PilotDetails.component.tsx` — conectar props e botão dinâmico
3. `PaymentMonthly.component.tsx` — mensagem de trancado
4. Build para verificar TS: `npm run build`

---

## Verificação

- [ ] `npm run build` passa sem erros TS
- [ ] Botão no PilotDetails mostra "Trancar Matrícula" para filiado, "Destrancar Matrícula" para trancado
- [ ] Clique no botão abre AlertDialog com título correto
- [ ] AlertDialog mostra aviso jurídico para trancamento
- [ ] Botão "Trancar" desabilitado se pagamento do mês não confirmado
- [ ] Após trancar, PaymentMonthly mostra "Matrícula Trancada" em vez da tabela
- [ ] Após destrancar, PaymentMonthly volta a mostrar tabela
- [ ] Toast de sucesso aparece após operação
- [ ] Admin e piloto próprio conseguem usar o fluxo

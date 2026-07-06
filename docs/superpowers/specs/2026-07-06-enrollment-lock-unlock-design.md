# Design: Trancamento e Destrancamento de Matrícula de Pilotos

**Data:** 2026-07-06
**Status:** Aprovado
**Escopo:** Frontend (cpvl-spa)

---

## 1. Visão Geral

Implementar o fluxo de trancamento e destrancamento da matrícula de pilotos no componente `PilotDetails`. Quando trancada, a matrícula suspende a cobrança de mensalidade. O piloto pode ter sua matrícula trancada ou destrancada pelo admin ou por ele próprio.

**Referência normativa:** Artigo 18, item IX do Estatuto do Clube.

---

## 2. Regras de Negócio

### 2.1 Trancamento (Lock)

- **Condição de permissão:** `pilot.status === 'filiado'` **E** o pagamento mensal do mês corrente (ref_month/ref_year) tenha `status === 'Confirmado'`
- **Ação:** Altera `pilot.status` para `'trancado'` via PATCH `API.updateStatusPilot`
- **Efeito na mensalidade:** Piloto trancado não paga mensalidade. A cobrança é suspensa durante o período de trancamento

### 2.2 Destrancamento (Unlock)

- **Condição de permissão:** `pilot.status === 'trancado'`
- **Ação:** Altera `pilot.status` para `'filiado'` via PATCH `API.updateStatusPilot`
- **Efeito na mensalidade:** Cobrança é retomada a partir do mês seguinte ao destrancamento

### 2.3 Quem pode executar

- Admin (qualquer perfil `'admin'`)
- Próprio piloto (quando visualiza seu próprio perfil)

---

## 3. Props do Componente Enrollment

```tsx
interface IEnrollmentProps {
  userId: number;
  currentStatus: string;
  paymentMonthlies?: IPaymentMonthly[];
  onStatusChange: (newStatus: string) => void;
  onClose: () => void;
}
```

- **userId:** ID do piloto (para a chamada API)
- **currentStatus:** Status atual do piloto (`pilot.status`)
- **paymentMonthlies:** Array de pagamentos mensais do piloto (`pilot.paymentMonthlies`)
- **onStatusChange:** Callback para atualizar o estado no PilotDetails após sucesso
- **onClose:** Fecha o dialog

---

## 4. Fluxo de Dados

```
PilotDetails
  |
  +-- pilot.status -----------------+
  +-- pilot.paymentMonthlies -------+
  +-- userId -----------------------+
  +-- onStatusChange callback ------+
                                        |
                                        v
                                  Enrollment
                                    |
                                    +-- Calcula internamente:
                                    |   +-- canLock = status === 'filiado'
                                    |   |              && currentMonthPayment?.status === 'Confirmado'
                                    |   +-- canUnlock = status === 'trancado'
                                    |
                                    +-- Exibe botao (Trancar/Destrancar)
                                    |
                                    +-- Ao clicar:
                                        +-- Abre AlertDialog de confirmacao
                                        +-- PATCH API.updateStatusPilot
                                        +-- Toast sucesso/erro
                                        +-- onStatusChange(novoStatus)
```

---

## 5. Implementacao do Enrollment

### 5.1 Logica Interna

```tsx
// Calculo do pagamento do mes atual
const now = new Date();
const currentMonthPayment = paymentMonthlies?.find(
  p => Number(p.ref_year) === now.getFullYear()
    && Number(p.ref_month) === (now.getMonth() + 1)
);

// Condicoes
const isFiliado = currentStatus === 'filiado';
const isTrancado = currentStatus === 'trancado';
const isPaymentConfirmed = currentMonthPayment?.status === 'Confirmado';

const canLock = isFiliado && isPaymentConfirmed;
const canUnlock = isTrancado;
```

### 5.2 Estados de Exibicao

| pilot.status | Pagamento mes atual | Botao exibido | Acao |
|---|---|---|---|
| `filiado` | Confirmado | "Trancar Matricula" | Habilitado |
| `filiado` | Pendente/Outro/Ausente | Nenhum | -- |
| `trancado` | Qualquer | "Destrancar Matricula" | Habilitado |
| `filiado` | Ausente | Nenhum | -- |
| Outro (`pendente`, `desfiliado`, etc.) | Qualquer | Nenhum | -- |

### 5.3 AlertDialog de Confirmacao

```
+----------------------------------------------------+
|  !  Trancar Matricula                               |
|                                                     |
|  Tem certeza que deseja trancar a matricula?        |
|                                                     |
|  Conforme Artigo 18, item IX do Estatuto do Clube.  |
|                                                     |
|  [CANCELAR]                           [CONFIRMAR]   |
+----------------------------------------------------+
```

- **Titulo:** Dinamico ("Trancar Matricula" ou "Destrancar Matricula")
- **Mensagem:** "Tem certeza que deseja [trancar/destrancar] a matricula?"
- **Referencia:** "Conforme Artigo 18, item IX do Estatuto do Clube."
- **Botao Confirmar:** Loading state durante chamada API
- **Feedback:** Toast de sucesso (fecha dialog) ou toast de erro (mantem dialog)

### 5.4 Chamada API

```tsx
const handleConfirm = async () => {
  const newStatus = isTrancado ? 'filiado' : 'trancado';
  await doFetch({
    url: getURI(`${API.updateStatusPilot}?userId=${userId}&status=${newStatus}`),
    method: 'PATCH',
  });
  // Em caso de sucesso:
  onStatusChange(newStatus);
  onClose();
};
```

---

## 6. Alteracoes no PilotDetails

### 6.1 Botao Dinamico

```tsx
const getEnrollmentButtonLabel = () => {
  switch (pilot?.status) {
    case 'filiado': return 'Trancar Matricula';
    case 'trancado': return 'Destrancar Matricula';
    default: return 'Matricula';
  }
};

const canShowEnrollmentButton = () => {
  if (!pilot) return false;
  return pilot.status === 'filiado' || pilot.status === 'trancado';
};
```

### 6.2 Dialog com Props

```tsx
<Enrollment
  userId={Number(userId)}
  currentStatus={pilot?.status ?? ''}
  paymentMonthlies={pilot?.paymentMonthlies}
  onStatusChange={handleStatusChange}
  onClose={() => setIsEnrollmentOpen(false)}
/>
```

### 6.3 Renderizacao Condicional

```tsx
{canShowEnrollmentButton() && (
  <Button onClick={() => setIsEnrollmentOpen(true)}>
    {getEnrollmentButtonLabel()}
  </Button>
)}
```

---

## 7. Alteracoes no PaymentMonthly

### 7.1 Deteccao de Status

```tsx
const pilotStatus = pilot?.status?.toLowerCase();
const isPilotFiliado = pilotStatus === 'filiado';
const isPilotTrancado = pilotStatus === 'trancado';
```

### 7.2 Mensagem para Trancado

```tsx
if (isPilotTrancado) {
  return (
    <Alert>
      <AlertTitle>Matricula Trancada</AlertTitle>
      <AlertDescription>
        A mensalidade esta suspensa durante o periodo de trancamento.
        A cobranca sera retomada a partir do mes em que a matricula for destrancada.
      </AlertDescription>
    </Alert>
  );
}
```

### 7.3 Fluxo de Renderizacao Atualizado

1. Se `isPilotTrancado` -> Mensagem "Matricula Trancada"
2. Se `isPilotFiliado` -> Fluxo normal de pagamentos
3. Se outro status -> "Acesso Restrito" (comportamento existente)

---

## 8. Arquivos a Modificar

| Arquivo | Alteracao |
|---|---|
| `src/components/Enrollment/Enrollment.component.tsx` | Reescrever do stub para AlertDialog funcional |
| `src/pages/PilotDetails/PilotDetails.component.tsx` | Atualizar botao dinamico e passar props ao Enrollment |
| `src/components/PaymentMonthly/PaymentMonthly.component.tsx` | Adicionar mensagem para status 'trancado' |

## 9. Arquivos que NAO Mudam

| Arquivo | Razao |
|---|---|
| `src/types/index.ts` | IPilot e IPaymentMonthly ja tem os campos necessarios |
| `src/services/getURI.ts` | API.updateStatusPilot ja existe |
| `src/components/StatusPilot/` | Nao e afetado por esta feature |

---

## 10. Historico de Alteracoes

O backend ja armazena o historico de mudancas de status via `API.updateStatusPilot`. Nao e necessario criar endpoints ou componentes adicionais de auditoria no frontend.

---

## 11. Edge Cases

| Caso | Comportamento |
|---|---|
| Piloto filiado sem pagamento confirmado no mes atual | Botao "Trancar" nao aparece |
| Piloto trancado + admin clica "Destrancar" | Funciona normalmente |
| Piloto trancado + piloto clica "Destrancar" | Funciona normalmente |
| Status e 'pendente', 'desfiliado', 'expulso', 'suspenso' | Botao nao aparece |
| Rede cai durante chamada API | Toast de erro, dialog permanece aberto |
| PilotDetails ainda carregando (pilot === null) | Botao nao renderiza |
| paymentMonthlies e undefined/null | Trata como array vazio, canLock = false |

---

## 12. Componentes UI Utilizados

- `AlertDialog` (shadcn/ui) -- para confirmacao
- `Button` -- para acoes
- `useFetch` -- para chamada API
- Toast (sistema existente) -- feedback de sucesso/erro

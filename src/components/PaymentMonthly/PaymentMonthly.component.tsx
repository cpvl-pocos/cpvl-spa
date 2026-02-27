// src/components/PaymentMonthly/PaymentMonthly.component.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Filter,
  DollarSign,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { useFetch } from '@/hooks';
import { API, getURI } from '@/services';
import { PaymentQRCode } from '../PaymentQRCode';
import type { IPaymentMonthly } from '@/types';
import { cn } from '@/lib/utils';

export const PaymentMonthly = () => {
  const { userId } = useParams<{ userId: string }>();
  const [payments, setPayments] = useState<IPaymentMonthly[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );
  const [confirmingLoading, setConfirmingLoading] = useState(false);
  const [confirmingError, setConfirmingError] = useState<string | null>(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState<
    Record<string, boolean>
  >({});
  const [confirmingMonth, setConfirmingMonth] = useState<{
    year: string;
    month: number;
  } | null>(null);
  const [actualConfirmingBatch, setActualConfirmingBatch] = useState<IPaymentMonthly[] | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [openBatchModal, setOpenBatchModal] = useState(false);

  const isUserIdValid = userId && !isNaN(parseInt(userId));

  const buildApiUrl = (): string => {
    if (!isUserIdValid) return '';
    const base = getURI(`${API.paymentMonthly}/${userId}`);
    if (selectedYear && selectedYear !== 'all')
      return `${base}?year=${selectedYear}`;
    return base;
  };

  const apiUrl = buildApiUrl();

  const { data: userData } = useFetch<any>({
    url: getURI(API.me)
  });
  const isAdmin = userData && userData.role === 'admin';

  const {
    data: paymentsData,
    error: paymentsError,
    loading: paymentsLoading,
    doFetch: reFetchPayments
  } = useFetch<IPaymentMonthly[]>({
    method: 'GET',
    url: apiUrl
  });

  const handlePaymentSuccess = () => {
    setOpenModal(false);
    reFetchPayments({ url: apiUrl });
  };

  const { data: pilotData, loading: loadingPilot } = useFetch<any>({
    method: 'GET',
    url: isUserIdValid ? getURI(`${API.pilots}/${userId}`) : ''
  });

  const { doFetch: doConfirm } = useFetch<IPaymentMonthly>({ method: 'PATCH' });

  useEffect(() => {
    setSelectedYear(new Date().getFullYear().toString());
  }, []);

  useEffect(() => {
    if (paymentsData) {
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
    } else if (paymentsError) {
      setPayments([]);
    }
  }, [paymentsData, paymentsError]);

  const handleSwitchClick = (year: string, month: number) => {
    setConfirmingMonth({ year, month });
    setOpenModal(true);
  };

  const handleBatchConfirmClick = (batch: IPaymentMonthly[]) => {
    setActualConfirmingBatch(batch);
    setOpenBatchModal(true);
  };

  const handlePaymentConfirm = async () => {
    if (!confirmingMonth || !isUserIdValid) {
      setConfirmingError('Dados inválidos para confirmação.');
      return;
    }

    const key = `${confirmingMonth.year}-${confirmingMonth.month}`;
    setConfirmingError(null);
    setConfirmingLoading(true);

    try {
      const response = await doConfirm({
        url: getURI(API.confirmPayment),
        method: 'PATCH',
        body: {
          userId: Number(userId),
          ref_year: Number(confirmingMonth.year),
          ref_month: Number(confirmingMonth.month)
        }
      });

      setPayments((prev) => {
        const isTarget = (p: IPaymentMonthly) =>
          Number(p.ref_year) === Number(confirmingMonth.year) &&
          p.ref_month === confirmingMonth.month;

        const exists = prev.some(isTarget);

        if (exists) {
          return prev.map((p) =>
            isTarget(p)
              ? {
                ...p,
                status: 'Confirmado',
                updatedAt: new Date().toISOString()
              }
              : p
          );
        } else {
          const resp = response as any;
          const newPayment: IPaymentMonthly = {
            id: resp && resp.payment ? resp.payment.id : undefined,
            userId: Number(userId),
            ref_year: confirmingMonth.year,
            ref_month: confirmingMonth.month,
            amount: 0,
            type: 'mensal',
            description: '',
            status: 'Confirmado',
            date: new Date(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          return [...prev, newPayment];
        }
      });

      setPaymentConfirmed((prev) => ({ ...prev, [key]: true }));
      setOpenModal(false);
      setConfirmingMonth(null);
    } catch (err: any) {
      setConfirmingError(err!.message || 'Erro ao confirmar pagamento.');
    } finally {
      setConfirmingLoading(false);
    }
  };

  const handleBatchPaymentConfirm = async () => {
    if (!actualConfirmingBatch || actualConfirmingBatch.length === 0 || !isUserIdValid) {
      setConfirmingError('Dados inválidos para confirmação em lote.');
      return;
    }

    setConfirmingError(null);
    setConfirmingLoading(true);

    try {
      const paymentsToConfirm = actualConfirmingBatch.map((p) => ({
        userId: Number(userId),
        ref_year: Number(p.ref_year),
        ref_month: Number(p.ref_month)
      }));

      await doConfirm({
        url: getURI(API.confirmPaymentBatch),
        method: 'PATCH',
        body: { payments: paymentsToConfirm }
      });

      setPayments((prev) =>
        prev.map((p) => {
          const isInBatch = actualConfirmingBatch.some(
            (bp) =>
              Number(bp.ref_year) === Number(p.ref_year) &&
              bp.ref_month === p.ref_month
          );
          if (isInBatch) {
            return {
              ...p,
              status: 'Confirmado',
              updatedAt: new Date().toISOString()
            };
          }
          return p;
        })
      );

      const newConfirmed: Record<string, boolean> = {};
      actualConfirmingBatch.forEach((p) => {
        const key = `${p.ref_year}-${p.ref_month}`;
        newConfirmed[key] = true;
      });
      setPaymentConfirmed((prev) => ({ ...prev, ...newConfirmed }));
      setOpenBatchModal(false);
      setActualConfirmingBatch(null);
    } catch (err: any) {
      setConfirmingError(
        err!.message || 'Erro ao confirmar pagamentos em lote.'
      );
    } finally {
      setConfirmingLoading(false);
    }
  };

  const formatMonth = (month: number) => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[month - 1] || `Mês ${month}`;
  };

  const parseAmount = (amount: any): number => {
    if (amount === null || amount === undefined || amount === '') return 0;
    if (typeof amount === 'number') return amount;
    const str = String(amount).replace(',', '.');
    const v = parseFloat(str);
    return Number.isNaN(v) ? 0 : v;
  };

  const getAvailableYears = (): string[] => {
    const yearsSet = new Set(payments.map((p) => String(p.ref_year)));
    const startYear = 2025;
    const currentYear = new Date().getFullYear();

    for (let y = startYear; y <= currentYear; y++) {
      yearsSet.add(String(y));
    }

    return Array.from(yearsSet).sort((a, b) => Number(b) - Number(a));
  };

  const groupPaymentsByBatch = (
    payments: IPaymentMonthly[]
  ): IPaymentMonthly[][] => {
    const groups: IPaymentMonthly[][] = [];
    const sorted = [...payments].sort((a, b) => {
      const yearDiff = Number(a.ref_year) - Number(b.ref_year);
      if (yearDiff !== 0) return yearDiff;
      return a.ref_month - b.ref_month;
    });

    let currentGroup: IPaymentMonthly[] = [];
    for (let i = 0; i < sorted.length; i++) {
      const payment = sorted[i];

      if (payment.status === 'Confirmado') {
        if (currentGroup.length > 0) {
          if (currentGroup.length >= 3) groups.push(currentGroup);
          currentGroup = [];
        }
        continue;
      }

      if (currentGroup.length === 0) {
        currentGroup.push(payment);
        continue;
      }

      const lastPayment = currentGroup[currentGroup.length - 1];
      const isSameYear = payment.ref_year === lastPayment.ref_year;
      const isConsecutiveMonth =
        payment.ref_month === lastPayment.ref_month + 1;
      const isSameType =
        payment.type === lastPayment.type && payment.type !== 'mensal';
      const isSameStatus = payment.status === lastPayment.status;

      let isSameCreation = false;
      if (payment.createdAt && lastPayment.createdAt) {
        const diff = Math.abs(
          new Date(payment.createdAt).getTime() -
          new Date(lastPayment.createdAt).getTime()
        );
        isSameCreation = diff < 10000;
      }

      if (
        isSameYear &&
        isConsecutiveMonth &&
        isSameType &&
        isSameStatus &&
        isSameCreation
      ) {
        currentGroup.push(payment);
      } else {
        if (currentGroup.length >= 3) {
          groups.push(currentGroup);
        }
        currentGroup = [payment];
      }
    }

    if (currentGroup.length >= 3) {
      groups.push(currentGroup);
    }

    return groups;
  };

  const getFilteredPayments = (): IPaymentMonthly[] => {
    let filtered: IPaymentMonthly[] = [];
    if (selectedYear === 'all') {
      filtered = payments;
    } else {
      filtered = payments.filter(
        (payment) => String(payment.ref_year) === selectedYear
      );

      const currentYearNum = Number(selectedYear);
      if (!isNaN(currentYearNum)) {
        const monthsPresent = new Set(filtered.map((p) => p.ref_month));
        const missingMonths: IPaymentMonthly[] = [];
        for (let m = 1; m <= 12; m++) {
          if (!monthsPresent.has(m)) {
            missingMonths.push({
              userId: Number(userId),
              ref_year: selectedYear,
              ref_month: m,
              amount: 0,
              type: '',
              description: '',
              status: 'Pendente',
              date: new Date()
            });
          }
        }
        filtered = [...filtered, ...missingMonths];
      }
    }
    return filtered;
  };

  const getFinancialSummary = () => {
    const filteredPayments = getFilteredPayments();
    const totalAmount = filteredPayments.reduce(
      (sum, p) => sum + parseAmount(p.amount),
      0
    );

    const monthlyTotals = filteredPayments.reduce(
      (acc: Record<string, number>, payment) => {
        const key = `${payment.ref_year}-${payment.ref_month}`;
        acc[key] = (acc[key] || 0) + parseAmount(payment.amount);
        return acc;
      },
      {}
    );

    const paidMonths = Object.values(monthlyTotals).filter((t) => t > 0).length;
    const totalMissing = 12 - paidMonths;

    return { total: filteredPayments.length, totalMissing, totalAmount };
  };

  const financialSummary = getFinancialSummary();
  const availableYears = getAvailableYears();
  const filteredPayments = getFilteredPayments();

  const paymentBatches = groupPaymentsByBatch(filteredPayments);
  const batchMap = new Map<
    string,
    { batch: IPaymentMonthly[]; isFirst: boolean }
  >();

  paymentBatches.forEach((batch) => {
    batch.forEach((p, idx) => {
      const batchKey = `${p.ref_year}-${p.ref_month}`;
      batchMap.set(batchKey, { batch, isFirst: idx === 0 });
    });
  });

  const yearCurrent = new Date().getFullYear();
  const monthCurrent = new Date().getMonth() + 1;

  if (!isUserIdValid) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>
            ID de usuário inválido. Por favor, forneça um ID válido.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loadingPilot || paymentsLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[400px] gap-4">
        <Spinner className="h-12 w-12 text-primary" />
        <p className="text-muted-foreground animate-pulse">
          Carregando dados do piloto e histórico...
        </p>
      </div>
    );
  }

  const isPilotFiliado =
    ((pilotData && pilotData.status) || '').toLowerCase() === 'filiado';

  if (!isPilotFiliado) {
    return (
      <div className="mt-6 p-4">
        <Alert className="border-primary/20 bg-primary/5">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertTitle className="font-bold">Acesso Restrito</AlertTitle>
          <AlertDescription>
            O histórico de pagamentos e a geração de QR Code só estão
            disponíveis para pilotos com o status <strong className="text-primary">filiado</strong>. O
            status atual deste piloto é:{' '}
            <Badge variant="outline" className="ml-1">
              {(pilotData && pilotData.status) || 'Não identificado'}
            </Badge>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (paymentsError) {
    let errorMessage = 'Não há histórico de pagamentos.';
    if (paymentsError.status === 401)
      errorMessage = 'Sessão expirada. Por favor, faça login novamente.';
    else if (paymentsError.status === 403)
      errorMessage = 'Acesso proibido. Você não tem permissão para visualizar esses dados.';
    else if (paymentsError.status === 404)
      errorMessage = 'Nenhum pagamento encontrado para este piloto.';
    else if (paymentsError.message) errorMessage = paymentsError.message;

    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{errorMessage}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <Dialog open={openModal} onOpenChange={(open) => !open && setOpenModal(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Pagamento</DialogTitle>
            <DialogDescription>
              {confirmingMonth && (
                <>
                  Deseja confirmar o pagamento do mês{' '}
                  <strong className="text-foreground">{formatMonth(confirmingMonth.month)}</strong> de{' '}
                  <strong className="text-foreground">{confirmingMonth.year}</strong>?
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setOpenModal(false)} disabled={confirmingLoading}>
              Cancelar
            </Button>
            <Button variant="success" onClick={handlePaymentConfirm} disabled={confirmingLoading}>
              {confirmingLoading ? <Spinner className="mr-2 h-4 w-4" /> : null}
              Confirmar
            </Button>
          </DialogFooter>
          {confirmingError && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{confirmingError}</AlertDescription>
            </Alert>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={openBatchModal} onOpenChange={(open) => !open && setOpenBatchModal(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Pagamentos em Lote</DialogTitle>
            <DialogDescription>
              {actualConfirmingBatch && (
                <>
                  Deseja confirmar {actualConfirmingBatch.length} pagamentos (
                  {actualConfirmingBatch[0].type})?
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {actualConfirmingBatch && (
            <div className="space-y-1 max-h-40 overflow-y-auto p-2 bg-muted/50 rounded-md">
              {actualConfirmingBatch.map((p, idx) => (
                <p key={idx} className="text-xs text-muted-foreground flex justify-between">
                  <span>• {formatMonth(p.ref_month)} ({p.ref_year})</span>
                  <span className="font-medium">R$ {parseAmount(p.amount).toFixed(2)}</span>
                </p>
              ))}
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setOpenBatchModal(false)} disabled={confirmingLoading}>
              Cancelar
            </Button>
            <Button variant="success" onClick={handleBatchPaymentConfirm} disabled={confirmingLoading}>
              {confirmingLoading ? <Spinner className="mr-2 h-4 w-4" /> : null}
              Confirmar Todos
            </Button>
          </DialogFooter>
          {confirmingError && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{confirmingError}</AlertDescription>
            </Alert>
          )}
        </DialogContent>
      </Dialog>

      <Card className="border-none shadow-sm bg-muted/30">
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Filter className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-0.5">
              <Label className="text-xs text-muted-foreground">Filtrar por Ano</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="h-8 w-[140px] border-none bg-transparent font-medium focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      Ano {year}
                    </SelectItem>
                  ))}
                  <SelectItem value="all">Ver Tudo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {`Mostrando ${filteredPayments.length} registro(s)`}
          </p>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-none shadow-md">
        <Accordion type="single" collapsible defaultValue="panel1">
          <AccordionItem value="panel1" className="border-none">
            <AccordionTrigger className="px-6 py-4 hover:no-underline bg-muted/10 group">
              <div className="flex items-center gap-4">
                <div className="bg-blue-500/10 p-2 rounded-xl text-blue-500 group-hover:bg-blue-500/20 transition-colors">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-primary">
                    Histórico Financeiro
                  </h3>
                  <p className="text-xs text-muted-foreground font-normal">
                    {selectedYear === 'all' ? 'Todos os anos' : `Exercício ${selectedYear}`}
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="text-center font-bold">Mês</TableHead>
                      <TableHead className="text-center font-bold">Tipo</TableHead>
                      <TableHead className="text-center font-bold">Valor</TableHead>
                      <TableHead className="text-center font-bold">Status</TableHead>
                      <TableHead className="text-center font-bold">Data Pagto</TableHead>
                      <TableHead className="text-center font-bold">Confirmação</TableHead>
                      {isAdmin && <TableHead className="text-center font-bold">Ações</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments
                      .sort(
                        (a, b) =>
                          Number(a.ref_year) - Number(b.ref_year) ||
                          a.ref_month - b.ref_month
                      )
                      .map((payment, index) => {
                        const key = `${payment.ref_year}-${payment.ref_month}`;
                        const isCurrentMonth =
                          payment.ref_month === monthCurrent &&
                          Number(payment.ref_year) === yearCurrent;
                        const isConfirmed =
                          payment.status === 'Confirmado' ||
                          paymentConfirmed[key];

                        const batchInfo = batchMap.get(key);
                        const isInBatch = !!batchInfo;
                        const isFirstInBatch = batchInfo?.isFirst;

                        return (
                          <TableRow key={payment.id || index} className={cn(isCurrentMonth && "bg-blue-500/5")}>
                            <TableCell className="text-center">
                              <Badge
                                variant={isCurrentMonth ? "default" : "secondary"}
                                className="w-24 justify-center"
                              >
                                {formatMonth(payment.ref_month)}
                              </Badge>
                              {selectedYear === 'all' && (
                                <p className="text-[10px] text-muted-foreground mt-0.5">{payment.ref_year}</p>
                              )}
                            </TableCell>

                            <TableCell className="text-center">
                              {payment.type ? (
                                <Badge variant="outline" className="text-[10px] capitalize">
                                  {payment.type}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>

                            <TableCell className="text-center font-mono">
                              {parseAmount(payment.amount) > 0 ? (
                                <span className="text-green-600 font-bold">
                                  R$ {parseAmount(payment.amount).toFixed(2)}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">R$ 0,00</span>
                              )}
                            </TableCell>

                            <TableCell className="text-center">
                              {isConfirmed ? (
                                <div className="flex justify-center" title="Confirmado">
                                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                                </div>
                              ) : (
                                <div className="flex justify-center" title="Pendente">
                                  <Clock className="h-5 w-5 text-amber-500" />
                                </div>
                              )}
                            </TableCell>

                            <TableCell className="text-center text-xs">
                              {payment.createdAt
                                ? new Date(String(payment.createdAt)).toLocaleDateString('pt-BR')
                                : '-'}
                            </TableCell>

                            <TableCell className="text-center text-xs">
                              {isConfirmed && payment.updatedAt
                                ? new Date(String(payment.updatedAt)).toLocaleDateString('pt-BR')
                                : '-'}
                            </TableCell>

                            {isAdmin && (
                              <TableCell className="text-center">
                                {!isConfirmed ? (
                                  isFirstInBatch ? (
                                    <Button
                                      variant="success"
                                      size="sm"
                                      className="h-7 text-[10px]"
                                      onClick={() => handleBatchConfirmClick(batchInfo.batch)}
                                    >
                                      Confirmar Lote ({batchInfo.batch.length})
                                    </Button>
                                  ) : isInBatch ? (
                                    <span className="text-[10px] text-muted-foreground">(lote)</span>
                                  ) : (
                                    <div className="flex items-center justify-center gap-2">
                                      <Switch
                                        checked={false}
                                        disabled={payment.status !== 'Confirmar'}
                                        onCheckedChange={() =>
                                          handleSwitchClick(
                                            String(payment.ref_year),
                                            payment.ref_month
                                          )
                                        }
                                      />
                                      <span className="text-[10px]">Aprovar</span>
                                    </div>
                                  )
                                ) : (
                                  <Badge variant="success" className="h-6 text-[10px]">
                                    ✓ Aprovado
                                  </Badge>
                                )}
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </div>

              <div className="p-6 bg-blue-500/5 flex flex-col sm:flex-row items-center justify-between gap-4 border-t">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500/10 p-2 rounded-full text-green-600">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total arrecadado {selectedYear === 'all' ? '' : `em ${selectedYear}`}</p>
                    <p className="text-2xl font-black text-green-600">
                      R$ {financialSummary.totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full sm:w-auto">
                  <div className="bg-background p-2 px-4 rounded-lg border text-center shadow-sm">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Lançamentos</p>
                    <p className="font-bold">{financialSummary.total}</p>
                  </div>
                  <div className="bg-background p-2 px-4 rounded-lg border text-center shadow-sm">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Abertos</p>
                    <p className="font-bold text-amber-600">{financialSummary.totalMissing}</p>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>

      {filteredPayments.length > 0 && (
        <Card className="border-none shadow-lg bg-gradient-to-br from-primary/5 to-primary/10 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 text-primary/5">
            <DollarSign size={120} />
          </div>
          <div className="relative z-10">
            <PaymentQRCode
              totalMissing={financialSummary.totalMissing}
              onSuccess={handlePaymentSuccess}
              selectedYear={selectedYear}
            />
          </div>
        </Card>
      )}
    </div>
  );
};
export default PaymentMonthly;

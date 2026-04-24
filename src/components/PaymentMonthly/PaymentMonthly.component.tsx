// src/components/PaymentMonthly/PaymentMonthly.component.tsx
import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import {
  Dialog,
  DialogContent,
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
import { useAuth } from '@/context/AuthContext';
import { API, getURI } from '@/services';
import { PaymentQRCode } from '../PaymentQRCode';
import type { IPaymentMonthly, IPilot } from '@/types';
import { formatDateTime, formatMonth } from '@/util/format';
import { parseAmount, calculateFinancialSummary, groupPaymentsByBatch } from '@/util/finance';

interface PaymentMonthlyProps {
  initialPayments?: IPaymentMonthly[];
  initialPilotData?: IPilot;
}

export const PaymentMonthly: React.FC<PaymentMonthlyProps> = ({
  initialPayments,
  initialPilotData
}) => {
  const { userId } = useParams<{ userId: string }>();
  const [payments, setPayments] = useState<IPaymentMonthly[]>(initialPayments || []);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [confirmingLoading, setConfirmingLoading] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState<Record<string, boolean>>({});
  const [confirmingMonth, setConfirmingMonth] = useState<{ year: string; month: number } | null>(null);
  const [actualConfirmingBatch, setActualConfirmingBatch] = useState<IPaymentMonthly[] | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [openBatchModal, setOpenBatchModal] = useState(false);

  const isUserIdValid = !!userId && !isNaN(parseInt(userId));
  const { profile } = useAuth();
  const isAdmin = profile?.user?.role === 'admin';

  const {
    data: paymentsData,
    loading: paymentsLoading,
    doFetch: reFetchPayments
  } = useFetch<IPaymentMonthly[]>({
    url: getURI(`${API.paymentMonthly}/${userId}?year=${selectedYear === 'all' ? '' : selectedYear}`),
    immediate: !initialPayments && isUserIdValid
  });

  const { data: pilotDataResult, loading: pilotLoading } = useFetch<IPilot>({
    url: getURI(`${API.pilots}/${userId}`),
    immediate: !initialPilotData && isUserIdValid
  });

  const pilot = initialPilotData || pilotDataResult;

  useEffect(() => {
    if (paymentsData) setPayments(Array.isArray(paymentsData) ? paymentsData : []);
  }, [paymentsData]);

  const handlePaymentSuccess = () => {
    setOpenModal(false);
    reFetchPayments({ url: getURI(`${API.paymentMonthly}/${userId}?year=${selectedYear === 'all' ? '' : selectedYear}`) });
  };

  const { doFetch: doConfirm } = useFetch<IPaymentMonthly>({ method: 'PATCH' });


  const availableYears = useMemo(() => {
    const yearsSet = new Set(payments.map(p => String(p.ref_year)));
    const startYear = 2025;
    const currentYear = new Date().getFullYear();
    for (let y = startYear; y <= currentYear; y++) yearsSet.add(String(y));
    return Array.from(yearsSet).sort((a, b) => Number(b) - Number(a));
  }, [payments]);

  const filteredPayments = useMemo(() => {
    let filtered = selectedYear === 'all' 
      ? payments 
      : payments.filter(p => String(p.ref_year) === selectedYear);

    if (selectedYear !== 'all') {
      const monthsPresent = new Set(filtered.map(p => p.ref_month));
      const missingMonths: IPaymentMonthly[] = [];
      for (let m = 1; m <= 12; m++) {
        if (!monthsPresent.has(m)) {
          missingMonths.push({
            userId: Number(userId),
            ref_year: selectedYear,
            ref_month: m,
            amount: 0,
            type: '',
            status: 'Pendente'
          } as IPaymentMonthly);
        }
      }
      filtered = [...filtered, ...missingMonths].sort((a, b) => a.ref_month - b.ref_month);
    }
    return filtered;
  }, [payments, selectedYear, userId]);

  const financialSummary = useMemo(() => calculateFinancialSummary(filteredPayments), [filteredPayments]);

  const paymentBatches = useMemo(() => groupPaymentsByBatch(filteredPayments), [filteredPayments]);

  const batchMap = useMemo(() => {
    const map = new Map<string, { batch: IPaymentMonthly[]; isFirst: boolean }>();
    paymentBatches.forEach(batch => {
      batch.forEach((p, idx) => map.set(`${p.ref_year}-${p.ref_month}`, { batch, isFirst: idx === 0 }));
    });
    return map;
  }, [paymentBatches]);

  const handlePaymentConfirm = async () => {
    if (!confirmingMonth || !isUserIdValid) return;
    setConfirmingLoading(true);
    try {
      await doConfirm({
        url: getURI(API.confirmPayment),
        body: { 
          userId: Number(userId), 
          ref_year: Number(confirmingMonth.year), 
          ref_month: Number(confirmingMonth.month) 
        }
      });
      setPayments(prev => prev.map(p => 
        (Number(p.ref_year) === Number(confirmingMonth.year) && p.ref_month === confirmingMonth.month)
          ? { ...p, status: 'Confirmado', updatedAt: new Date().toISOString() }
          : p
      ));
      setPaymentConfirmed(prev => ({ ...prev, [`${confirmingMonth.year}-${confirmingMonth.month}`]: true }));
      setOpenModal(false);
    } catch (err: any) {
      // Error handled by useFetch or toast logic if implemented
    } finally {
      setConfirmingLoading(false);
    }
  };

  const handleBatchPaymentConfirm = async () => {
    if (!actualConfirmingBatch || !isUserIdValid) return;
    setConfirmingLoading(true);
    try {
      await doConfirm({
        url: getURI(API.confirmPaymentBatch),
        body: { payments: actualConfirmingBatch.map(p => ({ userId: Number(userId), ref_year: Number(p.ref_year), ref_month: Number(p.ref_month) })) }
      });
      const batchKeys = new Set(actualConfirmingBatch.map(p => `${p.ref_year}-${p.ref_month}`));
      setPayments(prev => prev.map(p => batchKeys.has(`${p.ref_year}-${p.ref_month}`) ? { ...p, status: 'Confirmado', updatedAt: new Date().toISOString() } : p));
      setOpenBatchModal(false);
    } catch (err: any) {
      // Error handled by useFetch or toast logic if implemented
    } finally {
      setConfirmingLoading(false);
    }
  };

  if (!isUserIdValid) return <Alert variant="destructive"><AlertTitle>Erro</AlertTitle><AlertDescription>ID Inválido</AlertDescription></Alert>;
  if (pilotLoading || paymentsLoading) return <div className="flex justify-center p-20"><Spinner className="h-12 w-12" /></div>;

  const isPilotFiliado = pilot?.status?.toLowerCase() === 'filiado';
  if (!isPilotFiliado) {
    return (
      <div className="mt-6 p-4">
        <Alert className="bg-primary/5">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertTitle>Acesso Restrito</AlertTitle>
          <AlertDescription>Disponível apenas para pilotos <strong>filiados</strong>. Status atual: <Badge className="ml-1">{pilot?.status || 'N/A'}</Badge></AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Confirmation Dialogs */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirmar Pagamento</DialogTitle></DialogHeader>
          <p>Confirmar {confirmingMonth && formatMonth(confirmingMonth.month)}/{confirmingMonth?.year}?</p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpenModal(false)}>Cancelar</Button>
            <Button onClick={handlePaymentConfirm} disabled={confirmingLoading}>{confirmingLoading && <Spinner className="mr-2 h-4 w-4" />}Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openBatchModal} onOpenChange={setOpenBatchModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirmar Lote</DialogTitle></DialogHeader>
          <p>Confirmar {actualConfirmingBatch?.length} pagamentos?</p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpenBatchModal(false)}>Cancelar</Button>
            <Button onClick={handleBatchPaymentConfirm} disabled={confirmingLoading}>Confirmar Todos</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Year Filter */}
      <Card className="bg-muted/30 border-none">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-primary" />
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[140px] border-none bg-transparent font-bold"><SelectValue /></SelectTrigger>
              <SelectContent>
                {availableYears.map(y => <SelectItem key={y} value={y}>Ano {y}</SelectItem>)}
                <SelectItem value="all">Ver Tudo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <span className="text-xs text-muted-foreground">{filteredPayments.length} registros</span>
        </CardContent>
      </Card>

      {/* Main Table */}
      <Card className="overflow-hidden border-none shadow-md">
        <Accordion type="single" collapsible defaultValue="panel1">
          <AccordionItem value="panel1" className="border-none">
            <AccordionTrigger className="px-6 py-4 bg-muted/10">
              <div className="flex items-center gap-4 text-left">
                <CreditCard className="h-6 w-6 text-blue-500" />
                <div><h3 className="text-lg font-bold">Histórico Financeiro</h3><p className="text-xs text-muted-foreground">{selectedYear === 'all' ? 'Todos os anos' : `Exercício ${selectedYear}`}</p></div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="text-center font-bold">Mês</TableHead>
                    <TableHead className="text-center font-bold">Valor</TableHead>
                    <TableHead className="text-center font-bold">Status</TableHead>
                    <TableHead className="text-center font-bold">Data Pagto</TableHead>
                    {isAdmin && <TableHead className="text-center font-bold">Ações</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((p, i) => {
                    const key = `${p.ref_year}-${p.ref_month}`;
                    const isConfirmed = p.status === 'Confirmado' || paymentConfirmed[key];
                    const batchInfo = batchMap.get(key);

                    return (
                      <TableRow key={p.id || i}>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="w-24 justify-center">{formatMonth(p.ref_month)}</Badge>
                          {selectedYear === 'all' && <p className="text-[10px] mt-0.5">{p.ref_year}</p>}
                        </TableCell>
                        <TableCell className="text-center font-mono font-bold text-green-600">
                          {parseAmount(p.amount) > 0 ? `R$ ${parseAmount(p.amount).toFixed(2)}` : '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          {isConfirmed ? <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" /> : <Clock className="h-5 w-5 text-amber-500 mx-auto" />}
                        </TableCell>
                        <TableCell className="text-center text-xs">
                          {p.createdAt ? formatDateTime(p.createdAt) : '-'}
                        </TableCell>
                        {isAdmin && (
                          <TableCell className="text-center">
                            {isConfirmed ? <Badge variant="success">✓ Aprovado</Badge> : (
                              batchInfo?.isFirst ? (
                                <Button size="sm" onClick={() => { setActualConfirmingBatch(batchInfo.batch); setOpenBatchModal(true); }}>Lote ({batchInfo.batch.length})</Button>
                              ) : batchInfo ? <span className="text-[10px] text-muted-foreground">(lote)</span> : (
                                <div className="flex items-center justify-center gap-2">
                                  <Switch onCheckedChange={() => { setConfirmingMonth({ year: String(p.ref_year), month: p.ref_month }); setOpenModal(true); }} />
                                  <span className="text-[10px]">Aprovar</span>
                                </div>
                              )
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <div className="p-6 bg-blue-500/5 flex items-center justify-between border-t">
                <div className="flex items-center gap-3">
                  <TrendingUp className="text-green-600" />
                  <div><p className="text-xs text-muted-foreground">Total Arrecadado</p><p className="text-2xl font-black text-green-600">R$ {financialSummary.totalAmount.toFixed(2)}</p></div>
                </div>
                <div className="flex gap-4">
                  <div className="text-center"><p className="text-[10px] uppercase text-muted-foreground">Registros</p><p className="font-bold">{financialSummary.total}</p></div>
                  <div className="text-center"><p className="text-[10px] uppercase text-muted-foreground">Abertos</p><p className="font-bold text-amber-600">{financialSummary.totalMissing}</p></div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>

      {/* QR Code Section */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 overflow-hidden relative p-8 border-none">
        <DollarSign size={120} className="absolute top-0 right-0 text-primary/5" />
        <PaymentQRCode totalMissing={financialSummary.totalMissing} onSuccess={handlePaymentSuccess} selectedYear={selectedYear} />
      </Card>
    </div>
  );
};

export default PaymentMonthly;

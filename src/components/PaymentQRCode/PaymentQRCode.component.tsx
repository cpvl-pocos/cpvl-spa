// src/components/PaymentQRCode/PaymentQRCode.component.tsx
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import QRCodePix from 'react-qrcode-pix';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Copy,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Truck,
  QrCode,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { useFetch } from '@/hooks';
import { API, getURI } from '@/services';
import type { IPaymentMonthly } from '@/types';
import { cn } from '@/lib/utils';

interface PaymentProps {
  totalMissing: number;
  onSuccess?: () => void;
  selectedYear: string;
}

export const PaymentQRCode: React.FC<PaymentProps> = ({
  totalMissing,
  onSuccess,
  selectedYear
}) => {
  const { userId } = useParams<{ userId: string }>();
  const [selectedPaymentType, setSelectedPaymentType] = useState<string>('');
  const [pixCode, setPixCode] = useState<string>('');
  const [notice, setNotice] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);

  const amountMonthly = 50;

  const { doFetch: doNotice } = useFetch<IPaymentMonthly>({ method: 'POST' });

  const getPaymentValue = (paymentType: string): number => {
    switch (paymentType) {
      case 'mensal': return amountMonthly;
      case 'trimestral': return amountMonthly * 3;
      case 'semestral': return amountMonthly * 6;
      case 'anual': return amountMonthly * 12;
      default: return 0;
    }
  };

  const getDiscount = (paymentType: string): number => {
    switch (paymentType) {
      case 'anual':
        const today = new Date();
        const januaryLimit = new Date(today.getFullYear(), 0, 31, 23, 59, 59);
        return today <= januaryLimit ? 0.1 : 0.0;
      default: return 0;
    }
  };

  const calculateFinalValue = (paymentType: string): number => {
    const baseValue = getPaymentValue(paymentType);
    const discount = getDiscount(paymentType);
    return Math.round(baseValue * (1 - discount) * 100) / 100;
  };

  const handlePaymentNotice = async () => {
    if (!userId || !selectedPaymentType) return;

    setIsSubmitting(true);
    setNotice('');

    const baseValue = getPaymentValue(selectedPaymentType);
    const numMonths = Math.round(baseValue / amountMonthly);
    const ref_month_start = 12 - totalMissing;

    const yearToUse = selectedYear === 'all'
      ? new Date().getFullYear().toString()
      : selectedYear;

    try {
      // Loop sequencial para garantir que o backend processe um por um
      // Idealmente o backend teria um endpoint de batch, mas mantemos compatibilidade
      for (let i = 1; i <= numMonths; i++) {
        let currentMonth = ref_month_start + i;
        let currentYear = parseInt(yearToUse);

        // Se ultrapassar dezembro, vira para o próximo ano (opcional dependendo da lógica do negócio)
        if (currentMonth > 12) {
          currentMonth -= 12;
          currentYear += 1;
        }

        await doNotice({
          url: getURI(API.createPaymentMonthly),
          body: {
            userId,
            ref_year: currentYear.toString(),
            ref_month: currentMonth,
            type: selectedPaymentType,
            description: `Pagamento ${selectedPaymentType} via PIX`,
            status: 'Confirmar',
            date: new Date(),
            createdAt: new Date()
          }
        });
      }

      setNotice('Comprovante enviado com sucesso!');
      setIsModalOpen(true);

      setTimeout(() => {
        setIsModalOpen(false);
        if (onSuccess) onSuccess();
      }, 5000);
    } catch (err) {
      console.error('Erro ao avisar pagamento', err);
      setNotice('Erro ao enviar aviso. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleValueChange = (value: string) => {
    setSelectedPaymentType(value);
    setPixCode('');
    setCopied(false);
  };

  const copyToClipboard = async () => {
    if (pixCode) {
      try {
        await navigator.clipboard.writeText(pixCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch (err) {
        console.error('Erro ao copiar:', err);
      }
    }
  };

  const availableTypes = (tm: number): string[] => {
    if (tm === undefined || tm <= 0) return [];
    const types: string[] = [];
    if (tm > 0) types.push('mensal');
    if (tm >= 3) types.push('trimestral');
    if (tm >= 6) types.push('semestral');
    if (tm === 12) types.push('anual');
    return types;
  };

  const types = availableTypes(totalMissing);
  const currentValue = selectedPaymentType ? calculateFinalValue(selectedPaymentType) : 0;
  const currentDiscount = selectedPaymentType ? getDiscount(selectedPaymentType) : 0;

  return (
    <div className="w-full max-w-5xl mx-auto animate-in fade-in duration-700">
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-2xl border-none shadow-2xl rounded-3xl">
          <DialogHeader className="flex flex-col items-center">
            <div className="bg-green-100 p-4 rounded-full mb-4">
              <CheckCircle2 className="h-10 w-10 text-green-600 animate-in zoom-in duration-300" />
            </div>
            <DialogTitle className="text-2xl font-black text-slate-900">
              Aviso Enviado!
            </DialogTitle>
            <DialogDescription className="text-center text-slate-600 pt-2 pb-4">
              A administração foi notificada do seu pagamento. O status será atualizado após a conferência bancária.
            </DialogDescription>
            <Button onClick={() => setIsModalOpen(false)} className="w-full rounded-xl h-12 font-bold">
              Entendido
            </Button>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Card className="border-none shadow-none bg-transparent">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">

            {/* Payment Selection */}
            <div className="md:col-span-5 space-y-6">
              <div className="bg-white/40 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-primary/10 rounded-2xl text-primary">
                    <CreditCard size={22} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 leading-tight">Plano de Pagamento</h3>
                    <p className="text-xs text-muted-foreground">Escolha como deseja pagar</p>
                  </div>
                </div>

                {totalMissing > 0 ? (
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="paymentType" className="text-sm font-bold ml-1 text-slate-700">Selecione o período</Label>
                      <Select value={selectedPaymentType} onValueChange={handleValueChange}>
                        <SelectTrigger id="paymentType" className="h-14 bg-white/50 border-slate-200 rounded-2xl focus:ring-primary/20 transition-all font-medium">
                          <SelectValue placeholder="Toque para escolher..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                          {types.map((type) => {
                            const val = calculateFinalValue(type);
                            const disc = getDiscount(type);
                            return (
                              <SelectItem key={type} value={type} className="rounded-xl py-3 focus:bg-primary/5">
                                <div className="flex items-center justify-between w-full min-w-[200px] gap-4">
                                  <span className="capitalize font-bold">{type}</span>
                                  <div className="flex items-center gap-2">
                                    {disc > 0 && <Badge variant="success">-{disc * 100}%</Badge>}
                                    <span className="text-slate-900 font-black">R$ {val.toFixed(2)}</span>
                                  </div>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedPaymentType && (
                      <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 animate-in slide-in-from-left-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-primary/60 uppercase tracking-widest">Total à pagar</span>
                          <span className="text-xl font-black text-primary">R$ {currentValue.toFixed(2)}</span>
                        </div>
                        {currentDiscount > 0 && (
                          <p className="text-[10px] text-green-600 font-bold italic">
                            * Desconto de antecipação aplicado!
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
                      <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-amber-700 leading-tight">
                        Confira o nome <strong>CPVL</strong> e CNPJ <strong>02.507.679/0001-35</strong> antes de confirmar no seu banco.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
                      <ShieldCheck size={32} />
                    </div>
                    <h4 className="font-black text-slate-900">Anuidade em Dia!</h4>
                    <p className="text-sm text-muted-foreground mt-1 px-4">
                      Parabéns, suas mensalidades estão regularizadas. Obrigado por apoiar o clube!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* QR Code Column */}
            <div className="md:col-span-7">
              {selectedPaymentType ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in zoom-in-95 duration-500">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative p-5 bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-8 border-slate-50 ring-1 ring-slate-200 overflow-hidden group">
                      <QRCodePix
                        pixkey={import.meta.env.VITE_PIX_KEY_CPVL || ''}
                        merchant="CPVL"
                        city="POCOS CALDAS"
                        cep="37701000"
                        amount={currentValue}
                        size={200}
                        bgColor="#FFFFFF"
                        level="H"
                        onLoad={(payload: string) => setPixCode(payload)}
                      />
                      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </div>

                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Escaneie o QR Code</span>
                      <div className="text-2xl font-black text-slate-900 tracking-tighter">R$ {currentValue.toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1 px-2 bg-slate-900 text-white rounded-lg font-black text-[10px]">FIX</div>
                        <span className="text-xs font-bold text-slate-500 italic">Ou use Copia e Cola</span>
                      </div>

                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-14 rounded-2xl border-slate-200 text-slate-700 font-bold transition-all flex items-center justify-between px-5",
                          copied ? "border-green-500 bg-green-50 text-green-700" : "hover:border-primary hover:bg-primary/5 shadow-sm"
                        )}
                        onClick={copyToClipboard}
                        disabled={!pixCode}
                      >
                        <div className="flex items-center gap-3">
                          {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                          <span>{copied ? 'Copiado!' : 'Copiar Código PIX'}</span>
                        </div>
                        <ArrowRight size={16} className={cn("transition-transform", copied ? "translate-x-1" : "")} />
                      </Button>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-xs font-black text-primary uppercase tracking-widest">Passo Final</span>
                      </div>

                      <Button
                        variant="warning"
                        disabled={isSubmitting || !pixCode}
                        className="w-full h-20 rounded-3xl shadow-xl shadow-amber-500/10 flex flex-col items-center justify-center gap-1 transition-all hover:scale-[1.02] active:scale-[0.98] group relative overflow-hidden"
                        onClick={handlePaymentNotice}
                      >
                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <span className="font-black text-lg relative z-10 flex items-center gap-2">
                          {isSubmitting ? (
                            <>
                              <Truck className="animate-bounce" />
                              Enviando...
                            </>
                          ) : (
                            'Confirmar Pagamento'
                          )}
                        </span>
                        {!isSubmitting && (
                          <span className="text-[10px] uppercase font-bold tracking-widest opacity-70 relative z-10">
                            Avisar administração
                          </span>
                        )}
                      </Button>

                      {notice && !isModalOpen && (
                        <p className={cn(
                          "text-center text-xs font-bold animate-in fade-in slide-in-from-top-2",
                          notice.includes('Erro') ? "text-red-500" : "text-green-600"
                        )}>
                          {notice}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[300px] flex flex-col items-center justify-center bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[3rem] p-10 text-center">
                  <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-slate-300 mb-6 shadow-sm">
                    <QrCode size={40} />
                  </div>
                  <h4 className="text-slate-400 font-bold mb-2 uppercase tracking-widest text-sm">Aguardando Seleção</h4>
                  <p className="text-slate-400 text-xs px-10">
                    Escolha um plano ao lado para gerar seu QR Code de pagamento e as informações de PIX.
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

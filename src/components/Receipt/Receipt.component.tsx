// src/components/Receipt/Receipt.component.tsx
import React from 'react';
import type { IPaymentMonthly } from '@/types';
import { FileText, Award } from 'lucide-react';

interface ReceiptProps {
  payment: IPaymentMonthly;
  pilot: {
    firstName: string;
    lastName: string;
    cpf: string;
    email: string;
  };
}

/**
 * Component para exibir um recibo de pagamento em formato visual
 * Nota: Este component é apenas para referência/visualização
 * O recibo é enviado por email em formato HTML pela API
 */
export const Receipt: React.FC<ReceiptProps> = ({ payment, pilot }) => {
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatShortDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getPaymentTypeLabel = (type: string): string => {
    const typeMap: Record<string, string> = {
      mensal: 'mensalidade',
      trimestral: 'trimestre',
      semestral: 'semestre',
      anual: 'anuidade'
    };
    return typeMap[type] || type;
  };

  const dataHj = new Date();
  const pilotName = `${pilot.firstName} ${pilot.lastName}`;
  const amount =
    typeof payment.amount === 'string'
      ? parseFloat(payment.amount)
      : payment.amount || 0;

  return (
    <div className="w-full max-w-3xl mx-auto my-8 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.08)] rounded-2xl overflow-hidden border border-slate-100 flex flex-col items-center">
      {/* Receipt Header Decorations */}
      <div className="w-full h-2 bg-gradient-to-r from-primary/80 via-primary to-primary/80" />

      <div className="w-full px-8 py-12 md:px-16 flex flex-col">
        {/* Logo/Badge placeholder */}
        <div className="flex justify-center mb-8">
          <div className="bg-primary/5 p-4 rounded-full border border-primary/10">
            <Award className="h-10 w-10 text-primary" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-3xl font-black tracking-tighter text-slate-800 uppercase">
            Recibo de Pagamento
          </h2>
          <div className="h-1 w-12 bg-primary mx-auto rounded-full" />
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-[0.2em]">
            Digital Receipt Ref: {payment.id?.toString().slice(-8) || 'CPVL-PAY'}
          </p>
        </div>

        {/* Body */}
        <div className="space-y-8 font-serif text-slate-700 leading-relaxed md:text-lg">
          <p className="text-right italic text-slate-500 text-sm md:text-base">
            Poços de Caldas, {formatDate(dataHj)}
          </p>

          <div className="space-y-6">
            <p>
              Recebemos no dia{' '}
              <span className="font-bold border-b border-slate-200">
                {formatShortDate(payment.createdAt || new Date())}
              </span>{' '}
              do piloto{' '}
              <span className="font-bold text-slate-900">{pilotName}</span>,
              portador do CPF nº{' '}
              <span className="font-mono text-base">{pilot.cpf}</span>,
              o pagamento no valor total de:
            </p>

            <div className="bg-slate-50 border border-slate-100 p-6 rounded-xl flex items-center justify-center my-8">
              <span className="text-4xl font-black text-primary">
                R$ {amount.toFixed(2)}
              </span>
            </div>

            <p>
              Referente à{' '}
              <span className="font-bold lowercase">
                {getPaymentTypeLabel(payment.type || '')}
              </span>{' '}
              do ano de{' '}
              <span className="font-bold">{payment.ref_year}</span>,
              quitando as obrigações para com este clube no período especificado.
            </p>
          </div>
        </div>

        {/* Signature Area */}
        <div className="mt-20 flex flex-col items-center">
          <div className="w-full max-w-xs h-px bg-slate-200 mb-4" />
          <p className="text-sm font-medium text-slate-800">Talyson Bolleli</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">
            Tesouraria CPVL
          </p>

          <div className="mt-12 flex flex-col items-center">
            <p className="text-sm font-bold text-primary tracking-tight">
              CPVL - Clube Poçoscaldense de Vôo Livre
            </p>
            <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-tighter">
              CNPJ: 12.345.678/0001-90 • Poços de Caldas - MG
            </p>
          </div>
        </div>
      </div>

      {/* Decorative footer */}
      <div className="w-full bg-slate-50 py-4 px-8 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-slate-400" />
          <span className="text-[10px] text-slate-400 font-medium">CPVL OFFICIAL DOCUMENT</span>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-1.5 w-1.5 rounded-full bg-slate-200" />
          ))}
        </div>
      </div>
    </div>
  );
};

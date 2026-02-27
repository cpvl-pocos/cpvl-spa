import type { IPaymentMonthly } from '../types';
import { getURI } from '../services';

export interface IPilotData {
  firstName: string;
  lastName: string;
  cpf: string;
  email: string;
  userId: number;
}

export const sendReceiptEmail = async (
  payment: IPaymentMonthly,
  pilot: IPilotData,
  selectedYear: string
) => {
  try {
    const response = await fetch(getURI('paymentMonthly/sendReceiptEmail'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        paymentId: payment.id,
        userId: pilot.userId,
        email: pilot.email,
        pilotName: `${pilot.firstName} ${pilot.lastName}`,
        selectedYear
      })
    });

    if (!response.ok) {
      throw new Error(`Erro ao enviar recibo: ${response.statusText}`);
    }

    console.log('✅ Recibo enviado com sucesso por email');
    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar recibo:', error);
    throw error;
  }
};

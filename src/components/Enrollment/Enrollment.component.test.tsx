import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Enrollment } from './Enrollment.component';
import type { IPaymentMonthly } from '@/types';

// Mock the hooks
const mockDoFetch = vi.fn();
vi.mock('@/hooks', () => ({
  useFetch: vi.fn(() => ({
    doFetch: mockDoFetch,
    loading: false,
    error: null,
    data: null,
    clearError: vi.fn(),
  })),
  useLocalStorage: vi.fn(),
  useIdleTimeout: vi.fn(),
}));

// Mock sonner toast
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();
vi.mock('sonner', () => ({
  toast: {
    success: (...args: any[]) => mockToastSuccess(...args),
    error: (...args: any[]) => mockToastError(...args),
  },
}));

// Mock services
vi.mock('@/services', () => ({
  API: {
    updateStatusPilot: '/status-pilot',
  },
  getURI: (url: string) => `http://mockapi${url}`,
}));

describe('Enrollment Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('should render locked/unlock state correctly when status is "trancado"', () => {
    const onStatusChange = vi.fn();
    const onClose = vi.fn();

    render(
      <Enrollment
        userId={123}
        currentStatus="trancado"
        paymentMonthlies={[]}
        onStatusChange={onStatusChange}
        onClose={onClose}
      />
    );

    expect(screen.getByText('Destrancar Matrícula')).toBeDefined();
    expect(
      screen.getByText('Ao destrancar, o piloto voltará a pagar as mensalidades normalmente.')
    ).toBeDefined();
    expect(screen.getByRole('button', { name: 'Destrancar' })).toBeDefined();
  });

  it('should render canLock state correctly when status is "filiado" and current month payment is confirmed', () => {
    const onStatusChange = vi.fn();
    const onClose = vi.fn();
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const paymentMonthlies: IPaymentMonthly[] = [
      {
        id: 1,
        userId: 123,
        ref_month: currentMonth,
        ref_year: currentYear,
        status: 'Confirmado',
        amount: 100,
        createdAt: '2026-07-06T00:00:00Z',
        updatedAt: '2026-07-06T00:00:00Z',
      },
    ];

    render(
      <Enrollment
        userId={123}
        currentStatus="filiado"
        paymentMonthlies={paymentMonthlies}
        onStatusChange={onStatusChange}
        onClose={onClose}
      />
    );

    expect(screen.getByText('Trancar Matrícula')).toBeDefined();
    expect(
      screen.getByText(
        'Ao trancar, o piloto não pagará mensalidades até que a matrícula seja destrancada. Referência: Artigo 18, item IX do Estatuto do Clube.'
      )
    ).toBeDefined();
    const actionButton = screen.getByRole('button', { name: 'Trancar' });
    expect(actionButton).toBeDefined();
    expect(actionButton.hasAttribute('disabled')).toBe(false);
  });

  it('should disable lock action and show alert when status is "filiado" but current month payment is NOT confirmed', () => {
    const onStatusChange = vi.fn();
    const onClose = vi.fn();

    render(
      <Enrollment
        userId={123}
        currentStatus="filiado"
        paymentMonthlies={[]}
        onStatusChange={onStatusChange}
        onClose={onClose}
      />
    );

    expect(screen.getByText('Trancar Matrícula')).toBeDefined();
    expect(
      screen.getByText(
        'Para trancar, o piloto precisa estar filiado e ter a mensalidade do mês atual confirmada.'
      )
    ).toBeDefined();
    const actionButton = screen.getByRole('button', { name: 'Trancar' });
    expect(actionButton).toBeDefined();
    expect(actionButton.hasAttribute('disabled')).toBe(true);
  });

  it('should successfully update status to trancado and call callbacks', async () => {
    const onStatusChange = vi.fn();
    const onClose = vi.fn();
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const paymentMonthlies: IPaymentMonthly[] = [
      {
        id: 1,
        userId: 123,
        ref_month: currentMonth,
        ref_year: currentYear,
        status: 'Confirmado',
        amount: 100,
        createdAt: '2026-07-06T00:00:00Z',
        updatedAt: '2026-07-06T00:00:00Z',
      },
    ];

    mockDoFetch.mockResolvedValueOnce({ success: true });

    render(
      <Enrollment
        userId={123}
        currentStatus="filiado"
        paymentMonthlies={paymentMonthlies}
        onStatusChange={onStatusChange}
        onClose={onClose}
      />
    );

    const actionButton = screen.getByRole('button', { name: 'Trancar' });
    fireEvent.click(actionButton);

    await waitFor(() => {
      expect(mockDoFetch).toHaveBeenCalledWith({
        url: 'http://mockapi/status-pilot?userId=123&status=trancado',
        method: 'PATCH',
      });
      expect(onStatusChange).toHaveBeenCalledWith('trancado');
      expect(mockToastSuccess).toHaveBeenCalledWith('Matrícula trancada com sucesso!');
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('should successfully update status to filiado and call callbacks', async () => {
    const onStatusChange = vi.fn();
    const onClose = vi.fn();

    mockDoFetch.mockResolvedValueOnce({ success: true });

    render(
      <Enrollment
        userId={123}
        currentStatus="trancado"
        paymentMonthlies={[]}
        onStatusChange={onStatusChange}
        onClose={onClose}
      />
    );

    const actionButton = screen.getByRole('button', { name: 'Destrancar' });
    fireEvent.click(actionButton);

    await waitFor(() => {
      expect(mockDoFetch).toHaveBeenCalledWith({
        url: 'http://mockapi/status-pilot?userId=123&status=filiado',
        method: 'PATCH',
      });
      expect(onStatusChange).toHaveBeenCalledWith('filiado');
      expect(mockToastSuccess).toHaveBeenCalledWith('Matrícula destrancada com sucesso!');
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('should handle API errors gracefully', async () => {
    const onStatusChange = vi.fn();
    const onClose = vi.fn();

    mockDoFetch.mockRejectedValueOnce(new Error('Network Error'));

    render(
      <Enrollment
        userId={123}
        currentStatus="trancado"
        paymentMonthlies={[]}
        onStatusChange={onStatusChange}
        onClose={onClose}
      />
    );

    const actionButton = screen.getByRole('button', { name: 'Destrancar' });
    fireEvent.click(actionButton);

    await waitFor(() => {
      expect(mockDoFetch).toHaveBeenCalled();
      expect(mockToastError).toHaveBeenCalledWith('Erro ao atualizar status da matrícula.');
      expect(onStatusChange).not.toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
    });
  });
});

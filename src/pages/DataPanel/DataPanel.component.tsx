// src/pages/DataPanel/DataPanel.component.tsx
import { useEffect, useState } from 'react';
import { BarChart3, PieChart, Activity, TrendingUp } from 'lucide-react';
import { PieChartComponent } from '../../components/Charts/PieChart/PieChart.component';
import { useFetch } from '../../hooks';
import { API, getURI } from '../../services';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

interface IPilot {
  id?: number;
  userId: number;
  firstName: string;
  lastName: string;
  status: string;
}

export const DataPanel = () => {
  const { data: pilots, loading: loadingPilots } = useFetch<IPilot[]>({
    url: getURI(API.pilots)
  });

  const { data: statusList, loading: loadingStatus } = useFetch<IPilot[]>({
    url: getURI(API.status)
  });

  const [pilotStatusData, setPilotStatusData] = useState<any[]>([]);
  const [paymentStatusData, setPaymentStatusData] = useState<any[]>([]);

  useEffect(() => {
    if (pilots && Array.isArray(pilots)) {
      const statusCounts: Record<string, number> = {};
      pilots.forEach((p) => {
        const s = p.status || 'Desconhecido';
        statusCounts[s] = (statusCounts[s] || 0) + 1;
      });

      const data = Object.keys(statusCounts)
        .filter((key) => statusCounts[key] > 0)
        .map((key) => ({
          name: key.charAt(0).toUpperCase() + key.slice(1),
          value: statusCounts[key]
        }));

      setPilotStatusData(data);
    }
  }, [pilots]);

  useEffect(() => {
    if (pilots && statusList && Array.isArray(pilots) && Array.isArray(statusList)) {
      const filiados = pilots.filter((p) => (p.status || '').toLowerCase() === 'filiado');
      const totalFiliados = filiados.length;

      if (totalFiliados === 0) {
        setPaymentStatusData([]);
        return;
      }

      const statusListUserIds = new Set(statusList.map((s) => s.userId));
      let emDiaCount = 0;
      filiados.forEach((f) => {
        if (statusListUserIds.has(f.userId)) emDiaCount++;
      });

      const pendenteCount = totalFiliados - emDiaCount;

      const data = [
        { name: 'Em dia', value: emDiaCount },
        { name: 'Pendente', value: pendenteCount }
      ].filter((d) => d.value > 0);

      setPaymentStatusData(data);
    }
  }, [pilots, statusList]);

  const isLoading = loadingPilots || loadingStatus;

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 animate-in fade-in duration-700">
      <div className="space-y-1">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
          <BarChart3 className="text-primary w-8 h-8" />
          Painel de Dados
        </h1>
        <p className="text-slate-500 font-medium">Insights analíticos sobre a base de pilotos e situação financeira</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <Spinner className="w-12 h-12 text-primary" />
          <p className="text-slate-400 font-bold animate-pulse">Compilando estatísticas...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart 1: Status dos Pilotos */}
          <Card className="border-none shadow-[0_20px_60px_rgba(0,0,0,0.05)] bg-white/70 backdrop-blur-xl rounded-[40px] overflow-hidden group">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <PieChart className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black text-slate-900">Status dos Pilotos</CardTitle>
                  <CardDescription className="font-medium">Distribuição por situação cadastral</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full flex items-center justify-center">
                {pilotStatusData.length > 0 ? (
                  <PieChartComponent data={pilotStatusData} />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-300">
                    <Activity className="w-12 h-12 opacity-20" />
                    <p className="font-bold">Sem dados de pilotos</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Chart 2: Situação de Pagamento (Filiados) */}
          <Card className="border-none shadow-[0_20px_60px_rgba(0,0,0,0.05)] bg-white/70 backdrop-blur-xl rounded-[40px] overflow-hidden group">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black text-slate-900">Situação Financeira</CardTitle>
                  <CardDescription className="font-medium">Pagamentos mensais (apenas Filiados)</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full flex items-center justify-center">
                {paymentStatusData.length > 0 ? (
                  <PieChartComponent
                    data={paymentStatusData}
                    colors={['#10b981', '#f97316']} // Tailwind Emerald 500, Orange 500
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-300">
                    <TrendingUp className="w-12 h-12 opacity-20" />
                    <p className="font-bold">Sem dados de filiados</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

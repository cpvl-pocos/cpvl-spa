// src/pages/StatusList/StatusList.component.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Users, Calendar, MapPin } from 'lucide-react';
import { useFetch } from '@/hooks';
import { API, getURI } from '@/services';
import { SearchField } from '@/components/SearchField';
import type { IAllowedRoutes } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface IPilot {
  id?: number;
  userId: number;
  firstName: string;
  lastName: string;
  cpf: string;
  cellphone: string;
  email: string;
  status: string;
  photoUrl?: string;
  bloodType?: string;
  emergencyPhone?: string;
  emergencyContactName?: string;
  allergies?: string;
}

const TodayNow = (data: Date) => {
  const meses = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];

  const dia = String(data.getDate()).padStart(2, '0');
  const mes = meses[data.getMonth()];
  const ano = data.getFullYear();

  const horas = String(data.getHours()).padStart(2, '0');
  const minutos = String(data.getMinutes()).padStart(2, '0');

  return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
};

export const StatusList = () => {
  const navigate = useNavigate();
  const [pilots, setPilots] = useState<IPilot[]>([]);
  const [filteredPilots, setFilteredPilots] = useState<IPilot[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { data } = useFetch<IPilot[]>({ url: getURI(API.status) });

  const { data: profile } = useFetch<{
    routes: IAllowedRoutes[];
    warnings: string[];
  }>({
    url: getURI(API.profile)
  });
  const allowedRoutes = profile && profile.routes;

  const isAdmin =
    allowedRoutes && allowedRoutes.some((r) => r.route === 'pilots');

  useEffect(() => {
    if (data && data.length) {
      const sorted = [...data].sort((a, b) => {
        const nameA = `${a.firstName || ''} ${a.lastName || ''}`
          .trim()
          .toLowerCase();
        const nameB = `${b.firstName || ''} ${b.lastName || ''}`
          .trim()
          .toLowerCase();
        return nameA.localeCompare(nameB, 'pt-BR');
      });
      setPilots(sorted);
    }
  }, [data]);

  useEffect(() => {
    const norm = (v: any) =>
      v === null || v === undefined ? '' : String(v).trim().toLowerCase();

    let result = pilots || [];

    if (searchTerm && result.length > 0) {
      const searchNorm = norm(searchTerm);
      result = result.filter((p) => {
        const fullName = norm(`${p.firstName || ''} ${p.lastName || ''}`);
        return fullName.includes(searchNorm);
      });
    }

    setFilteredPilots(result);
  }, [searchTerm, pilots]);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 animate-in fade-in duration-500">
      {/* Header / Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <nav className="flex text-sm text-muted-foreground/60 transition-colors">
            <button
              onClick={() => navigate('/dashboard')}
              className="hover:text-primary transition-colors cursor-pointer"
            >
              Dashboard
            </button>
            {isAdmin && (
              <>
                <span className="mx-2">/</span>
                <span className="text-muted-foreground">Pilotos</span>
              </>
            )}
          </nav>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Users className="text-primary h-6 w-6" />
            Status de Decolagem
          </h1>
        </div>

        <div className="w-full md:w-[350px]">
          <SearchField
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por nome..."
            fullWidth
          />
        </div>
      </div>

      {filteredPilots && (
        <Card className="border-none shadow-[0_10px_40px_rgba(0,0,0,0.04)] bg-white/70 backdrop-blur-xl overflow-hidden rounded-2xl">
          <CardHeader className="bg-primary/5 py-4 border-b border-primary/10">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-lg font-bold text-primary flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Liberados para decolagem
              </CardTitle>
              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {TodayNow(new Date())}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="w-[300px] font-bold text-slate-700">Piloto</TableHead>
                    <TableHead className="hidden md:table-cell text-center font-bold text-slate-700">Sangue</TableHead>
                    <TableHead className="hidden md:table-cell text-center font-bold text-slate-700">Emergência</TableHead>
                    <TableHead className="hidden md:table-cell font-bold text-slate-700">Alergias</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPilots.length > 0 ? (
                    filteredPilots.map((pilot) => (
                      <TableRow key={pilot.userId} className="group hover:bg-primary/[0.02] border-slate-50 transition-colors">
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-primary/10 group-hover:border-primary/30 transition-all">
                              <AvatarImage src={pilot.photoUrl} alt={pilot.firstName} />
                              <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                                {pilot.firstName.charAt(0)}{pilot.lastName?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-900 leading-none mb-1">
                                {pilot.firstName} {pilot.lastName}
                              </span>
                              <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-slate-600 font-medium">
                                  {pilot.cellphone ? (
                                    `(${pilot.cellphone.slice(0, 2)}) ${pilot.cellphone.slice(2, 7)}-${pilot.cellphone.slice(7)}`
                                  ) : '---'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Mobile-only expanded info */}
                          <div className="mt-4 md:hidden flex flex-col gap-4 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50 animate-in fade-in slide-in-from-top-1">
                            <div className="flex items-start gap-6">
                              <div className="flex flex-col gap-1 shrink-0">
                                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Sangue</span>
                                {pilot.bloodType ? (
                                  <Badge variant="destructive" className="w-fit font-black text-[10px] px-2 h-5 rounded-md">
                                    {pilot.bloodType.toUpperCase()}
                                  </Badge>
                                ) : (
                                  <span className="text-slate-300 text-[10px]">---</span>
                                )}
                              </div>

                              <div className="flex flex-col gap-1 flex-1">
                                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Alergias</span>
                                {pilot.allergies ? (
                                  <div className="text-sm font-bold text-red-600 italic leading-tight" title={pilot.allergies}>
                                    {pilot.allergies}
                                  </div>
                                ) : (
                                  <span className="text-slate-300 text-xs">---</span>
                                )}
                              </div>
                            </div>

                            <div className="col-span-2 flex flex-col gap-1 border-t border-slate-100 pt-2">
                              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Emergência</span>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-slate-700 truncate">
                                  {pilot.emergencyContactName || '---'}
                                </span>
                                {pilot.emergencyPhone && (
                                  <div className="flex items-center gap-1 text-red-600 font-mono text-[11px] bg-red-50 px-2 py-0.5 rounded-full border border-red-100 shrink-0">
                                    <Phone className="h-2.5 w-2.5" />
                                    <span>
                                      {(() => {
                                        const clean = pilot.emergencyPhone.replace(/\D/g, '');
                                        return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
                                      })()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>



                        <TableCell className="hidden md:table-cell text-center">
                          {pilot.bloodType ? (
                            <Badge variant="destructive" className="font-black text-xs px-2 rounded-lg">
                              {pilot.bloodType.toUpperCase()}
                            </Badge>
                          ) : (
                            <span className="text-slate-300">---</span>
                          )}
                        </TableCell>

                        <TableCell className="hidden md:table-cell text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xs font-bold text-slate-700">
                              {pilot.emergencyContactName || ''}
                            </span>
                            {pilot.emergencyPhone && (
                              <div className="flex items-center gap-1 text-red-600 font-mono text-[12px]">
                                <Phone className="h-3 w-3" />
                                <span>
                                  {(() => {
                                    const clean = pilot.emergencyPhone.replace(/\D/g, '');
                                    return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
                                  })()}
                                </span>
                              </div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="hidden md:table-cell">
                          {pilot.allergies ? (
                            <div className="max-w-[auto] text-md font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-100 italic" title={pilot.allergies}>
                              {pilot.allergies}
                            </div>
                          ) : (
                            <span className="text-slate-300 text-xs">---</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center text-muted-foreground italic">
                        Nenhum piloto encontrado para esta busca.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="bg-slate-50/50 p-4 border-t border-slate-100">
              <div className="text-sm font-bold text-primary flex items-center gap-2">
                <Badge variant="secondary" className="rounded-full h-5 w-5 p-0 flex items-center justify-center font-black">
                  {filteredPilots.length}
                </Badge>
                Pilotos listados no momento
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StatusList;

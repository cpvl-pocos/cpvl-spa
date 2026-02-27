// src/components/MainNav/MainNav.component.tsx
import { useCallback } from 'react';
import {
  Menu as MenuIcon,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  LogOut as LogoutIcon,
  Sun,
  Moon,
  Coffee
} from 'lucide-react';
import type { IAllowedRoutes } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';


interface IProps {
  onLogout: () => void;
  onNav: (link: IAllowedRoutes) => void;
  allowedRoutes: IAllowedRoutes[];
  userData?: any;
}

const MainNav = ({ onLogout, onNav, allowedRoutes, userData }: IProps) => {

  const getGreetingMessage = useCallback(() => {
    const hour = new Date().getHours();
    const firstName =
      (userData && userData.pilot && userData.pilot.firstName) ||
      (userData && userData.firstName) ||
      '';
    const lastName =
      (userData && userData.pilot && userData.pilot.lastName) ||
      (userData && userData.lastName) ||
      '';

    if (!firstName && !lastName) return null;

    let greeting = '';
    let Icon = Coffee;

    if (hour >= 6 && hour < 12) {
      greeting = 'Bom dia';
      Icon = Sun;
    } else if (hour >= 12 && hour < 18) {
      greeting = 'Boa tarde';
      Icon = Sun;
    } else {
      greeting = 'Boa noite';
      Icon = Moon;
    }

    return { text: `${greeting}, ${firstName}!`, Icon };
  }, [userData]);

  const greeting = getGreetingMessage();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <div className="mx-auto px-4 py-3">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-[24px] px-6 h-16 flex items-center justify-between">

          {/* Logo & Navigation */}
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-black text-white tracking-widest font-['Flamenco'] select-none">
              CPVL
            </h1>

            <div className="hidden md:flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/10 gap-2 rounded-xl h-10 font-bold">
                    <LayoutDashboard className="w-4 h-4" />
                    Menu do Piloto
                    <ChevronDown className="w-3 h-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 rounded-2xl border-white/10 bg-slate-900 text-slate-300 shadow-2xl animate-in zoom-in-95">
                  <DropdownMenuLabel className="text-xs uppercase font-black text-slate-500 tracking-widest px-4 py-3">Navegação</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/5" />
                  {allowedRoutes.map((route, idx) => (
                    <DropdownMenuItem
                      key={idx}
                      onClick={() => onNav(route)}
                      className="px-4 py-3 cursor-pointer hover:bg-primary/20 hover:text-white focus:bg-primary/20 focus:text-white rounded-xl transition-colors mx-1 font-bold"
                    >
                      {route.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Central Greeting */}
          <div className="hidden lg:flex flex-1 items-center justify-center">
            {greeting && (
              <div className="bg-white/5 px-6 py-2 rounded-full border border-white/5 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-700">
                <greeting.Icon className="w-4 h-4 text-primary" />
                <span className="text-white font-['Flamenco'] text-lg font-medium tracking-wide">
                  {greeting.text}
                </span>
              </div>
            )}
          </div>

          {/* User & Logout */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Trigger */}
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-xl">
                    <MenuIcon className="w-6 h-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 mr-4 rounded-2xl border-white/10 bg-slate-900 text-slate-300 shadow-2xl">
                  {allowedRoutes.map((route, idx) => (
                    <DropdownMenuItem
                      key={idx}
                      onClick={() => onNav(route)}
                      className="px-4 py-3 font-bold"
                    >
                      {route.label}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem onClick={onLogout} className="px-4 py-3 text-red-400 focus:text-red-400 font-bold">
                    <LogoutIcon className="w-4 h-4 mr-2" /> Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <Button
              variant="outline"
              onClick={onLogout}
              className="hidden md:flex bg-transparent border-white/20 text-white hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400 rounded-xl h-10 px-6 font-black transition-all group"
            >
              <LogOut className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default MainNav;

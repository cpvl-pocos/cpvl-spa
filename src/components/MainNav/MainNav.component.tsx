import { useMemo } from 'react';
import {
  Menu as MenuIcon,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Sun,
  Moon,
  Coffee
} from 'lucide-react';
import type { IAllowedRoutes, IPilot, IUser } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';

interface IProps {
  onLogout: () => void;
  onNav: (link: IAllowedRoutes) => void;
  allowedRoutes: IAllowedRoutes[];
  userData?: IPilot | IUser;
}

const MainNav = ({ onLogout, onNav, allowedRoutes, userData }: IProps) => {
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    
    // Type-safe name extraction
    const pilot = (userData as any)?.pilot || userData;
    const firstName = pilot?.firstName || '';

    if (!firstName) return null;

    let text = '';
    let Icon = Coffee;

    if (hour >= 6 && hour < 12) {
      text = `Bom dia, ${firstName}!`;
      Icon = Sun;
    } else if (hour >= 12 && hour < 18) {
      text = `Boa tarde, ${firstName}!`;
      Icon = Sun;
    } else {
      text = `Boa noite, ${firstName}!`;
      Icon = Moon;
    }

    return { text, Icon };
  }, [userData]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <div className="mx-auto px-4 py-3">
        <div className="bg-background/80 backdrop-blur-xl border border-border shadow-elevated rounded-[2.5rem] px-6 h-16 flex items-center justify-between transition-colors">

          {/* Logo & Navigation */}
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-black text-primary tracking-widest font-display select-none">
              CPVL
            </h1>

            <div className="hidden md:flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-foreground/80 hover:text-primary hover:bg-primary/10 gap-2 rounded-xl h-10 font-bold transition-all">
                    <LayoutDashboard className="w-4 h-4" />
                    Menu do Piloto
                    <ChevronDown className="w-3 h-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 rounded-2xl border-border bg-card text-card-foreground shadow-2xl animate-in zoom-in-95">
                  <DropdownMenuLabel className="text-xs uppercase font-black text-muted-foreground tracking-widest px-4 py-3">Navegação</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border" />
                  {allowedRoutes.map((route, idx) => (
                    <DropdownMenuItem
                      key={idx}
                      onClick={() => onNav(route)}
                      className="px-4 py-3 cursor-pointer hover:bg-primary/20 hover:text-primary focus:bg-primary/20 focus:text-primary rounded-xl transition-colors mx-1 font-bold"
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
              <div className="bg-primary/5 px-6 py-2 rounded-full border border-primary/10 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-700">
                <greeting.Icon className="w-4 h-4 text-primary" />
                <span className="text-foreground font-display text-lg font-medium tracking-wide">
                  {greeting.text}
                </span>
              </div>
            )}
          </div>

          {/* User, Theme & Logout */}
          <div className="flex items-center gap-4">
            <ThemeToggle 
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft" 
            />

            {/* Mobile Menu Trigger */}
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-foreground hover:bg-primary/10 rounded-xl">
                    <MenuIcon className="w-6 h-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 mr-4 rounded-2xl border-border bg-card text-card-foreground shadow-2xl">
                  {allowedRoutes.map((route, idx) => (
                    <DropdownMenuItem
                      key={idx}
                      onClick={() => onNav(route)}
                      className="px-4 py-3 font-bold"
                    >
                      {route.label}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem onClick={onLogout} className="px-4 py-3 text-destructive focus:text-destructive font-bold">
                    <LogOut className="w-4 h-4 mr-2" /> Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <Button
              variant="outline"
              onClick={onLogout}
              className="hidden md:flex bg-transparent border-border text-foreground/80 hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive rounded-xl h-10 px-6 font-black transition-all group"
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

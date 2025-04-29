
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ChartBar, 
  Plus, 
  ShoppingCart, 
  FileText, 
  Bell, 
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  to: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem = ({ icon: Icon, label, to, isActive, onClick }: NavItemProps) => (
  <Link 
    to={to} 
    className="w-full" 
    onClick={onClick}
  >
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-3 px-3 py-5 rounded-md font-normal text-base",
        isActive 
          ? "bg-stockflow-primary text-white hover:bg-stockflow-primary/90 hover:text-white" 
          : "text-stockflow-text hover:bg-stockflow-background hover:text-stockflow-primary"
      )}
    >
      <Icon className={cn("h-5 w-5", isActive ? "text-white" : "text-stockflow-text")} />
      <span>{label}</span>
    </Button>
  </Link>
);

export function Sidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { icon: ChartBar, label: 'Dashboard', to: '/' },
    { icon: Plus, label: 'Add Stock', to: '/add-stock' },
    { icon: ShoppingCart, label: 'Sales', to: '/sales' },
    { icon: FileText, label: 'Cash Flow', to: '/cashflow' },
    { icon: Bell, label: 'Notifications', to: '/notifications' },
    { icon: FileText, label: 'Monthly Report', to: '/report' },
  ];

  return (
    <aside 
      className={cn(
        "bg-white shadow-sm border-r border-gray-200 h-screen flex flex-col transition-all duration-300 ease-in-out",
        isCollapsed ? "w-[80px]" : "w-[250px]"
      )}
    >
      <div className="p-4 flex items-center gap-3">
        <div className="bg-stockflow-primary text-white p-2 rounded-md">
          <ChartBar className="h-6 w-6" />
        </div>
        {!isCollapsed && (
          <span className="text-xl font-bold text-stockflow-primary">STOCKKFLOW</span>
        )}
      </div>

      <div className="mt-6 px-2 flex-1 space-y-1">
        {navItems.map((item) => (
          <NavItem 
            key={item.to}
            icon={item.icon}
            label={isCollapsed ? "" : item.label}
            to={item.to}
            isActive={location.pathname === item.to}
            onClick={() => {}}
          />
        ))}
      </div>

      <div className="mt-auto p-4 border-t">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full"
        >
          {isCollapsed ? "→" : "←"}
        </Button>
      </div>
    </aside>
  );
}

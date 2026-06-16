'use client';

import { useState, useRef, useEffect } from 'react';
import { LayoutDashboard, ShoppingCart, Package, Receipt, Settings, Users, MoreHorizontal } from 'lucide-react';
import type { TabName } from '../../types/enums';

interface MobileNavProps {
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
}

const mainTabs: { tab: TabName; icon: typeof LayoutDashboard; label: string }[] = [
  { tab: 'pos', icon: ShoppingCart, label: 'POS' },
  { tab: 'sales', icon: Receipt, label: 'Ventas' },
  { tab: 'inventory', icon: Package, label: 'Stock' },
  { tab: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { tab: 'settings', icon: Settings, label: 'Ajustes' },
];

const overflowTabs: { tab: TabName; icon: typeof Users; label: string }[] = [
  { tab: 'customers', icon: Users, label: 'Clientes' },
];

export function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  const [showOverflow, setShowOverflow] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showOverflow) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowOverflow(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showOverflow]);

  const handleTab = (tab: TabName) => {
    onTabChange(tab);
    setShowOverflow(false);
  };

  return (
    <nav className="tab-bar-ios">
      {mainTabs.map(item => {
        const Icon = item.icon;
        const isActive = activeTab === item.tab;
        return (
          <button
            key={item.tab}
            className={`tab-bar-item ${isActive ? 'active' : ''}`}
            onClick={() => onTabChange(item.tab)}
          >
            <Icon className="tab-bar-icon" size={22} />
            <span className="tab-bar-label">{item.label}</span>
          </button>
        );
      })}
      <div className="tab-bar-more-wrapper" ref={menuRef}>
        <button
          className={`tab-bar-item ${showOverflow ? 'active' : ''}`}
          onClick={() => setShowOverflow(!showOverflow)}
        >
          <MoreHorizontal className="tab-bar-icon" size={22} />
          <span className="tab-bar-label">Más</span>
        </button>
        {showOverflow && (
          <div className="tab-bar-overflow-menu">
            {overflowTabs.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.tab;
              return (
                <button
                  key={item.tab}
                  className={`tab-bar-overflow-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleTab(item.tab)}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}

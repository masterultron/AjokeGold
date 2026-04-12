import React, { useState } from 'react';
import { Link } from 'wouter';
import { Menu, ShoppingBag, ChevronDown } from 'lucide-react';
import { useCart, Currency } from '@/context/CartContext';
import { CartDrawer } from '@/components/CartDrawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Navbar: React.FC = () => {
  const { totalItems, currency, setCurrency } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/10 h-20 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/collections" className="text-white/80 hover:text-primary transition-colors flex items-center gap-2" data-testid="link-menu">
            <Menu className="w-6 h-6" />
            <span className="hidden md:inline text-sm uppercase tracking-widest">Collections</span>
          </Link>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2">
          <Link href="/" className="text-primary font-serif text-2xl tracking-[0.2em] hover:opacity-80 transition-opacity" data-testid="link-home">
            AJOKE GOLD
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-white/80 hover:text-primary text-sm uppercase tracking-wider outline-none" data-testid="btn-currency">
              {currency} <ChevronDown className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#0a0a0a] border-white/10 text-white min-w-[100px]">
              {(['AED', 'USD', 'NGN'] as Currency[]).map((c) => (
                <DropdownMenuItem key={c} onClick={() => setCurrency(c)} className="hover:bg-white/5 cursor-pointer uppercase tracking-wider text-sm">
                  {c}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <button 
            onClick={() => setIsCartOpen(true)} 
            className="relative text-white/80 hover:text-primary transition-colors"
            data-testid="btn-cart"
          >
            <ShoppingBag className="w-6 h-6" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-2 bg-primary text-[#0a0a0a] text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </nav>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

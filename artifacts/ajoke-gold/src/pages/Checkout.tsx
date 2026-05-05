import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { Loader2, CreditCard, ShieldCheck } from 'lucide-react';

export const Checkout = () => {
  const { subtotal, formatPrice, cart, currency } = useCart();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [method, setMethod] = useState<'card' | 'paypal' | 'paystack'>('card');

  // --- BUYER INFO STATE ---
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');

  // --- LOAD PAYSTACK SCRIPT ON MOUNT (in case it's not in index.html) ---
  useEffect(() => {
    // @ts-ignore
    if (window.PaystackPop) return; // already loaded
    if (document.querySelector('script[src*="js.paystack.co"]')) return; // already added

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => console.log('Paystack script loaded');
    script.onerror = () => console.error('Paystack script failed to load');
    document.head.appendChild(script);
  }, []);

  // --- UNIVERSAL PAYSTACK HANDLER (For Card & Paystack options) ---
  const handlePaystackPayment = () => {
    // Diagnostics — surface the real problem instead of spinning forever
    // @ts-ignore
    if (!window.PaystackPop) {
      alert(
        'Paystack is still loading or was blocked (ad blocker / network). Please wait a moment and try again, or disable your ad blocker.'
      );
      setIsProcessing(false);
      return;
    }

    const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    if (!publicKey) {
      alert(
        'Paystack public key is missing. Add VITE_PAYSTACK_PUBLIC_KEY to Netlify env vars and redeploy.'
      );
      setIsProcessing(false);
      return;
    }

    try {
      // @ts-ignore
      const handler = window.PaystackPop.setup({
        key: publicKey,
        email: buyerEmail,
        amount: Math.round(subtotal * 100),
        currency: 'NGN',
        metadata: {
          custom_fields: [
            { display_name: 'Payment Source', variable_name: 'payment_source', value: 'Ajoke Gold Web' },
            { display_name: 'Customer Name', variable_name: 'buyer_name', value: buyerName },
            { display_name: 'Customer Phone', variable_name: 'buyer_phone', value: buyerPhone },
            { display_name: 'Items Ordered', variable_name: 'items_ordered', value: cart.map((item) => `${item.product.name} x${item.quantity}`).join(', ') },
          ],
        },
        callback: function (response: any) {
          console.log('response', response);
          if (response.status === 'success') {
            fetch('/api/paystack-notify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                reference: response.reference,
                buyerName,
                buyerEmail,
                buyerPhone,
                currency,
                items: cart.map((item) => ({
                  name: item.product.name,
                  quantity: item.quantity,
                  price: formatPrice(item.product.basePrice),
                })),
              }),
            })
              .then(() => {
                setIsProcessing(false);
                setLocation('/success');
              })
              .catch((err) => {
                console.error('Failed to send notification:', err);
                setIsProcessing(false);
                setLocation('/success');
              });
          } else {
            alert('Payment failed or was cancelled. Please try again.');
            setIsProcessing(false);
          }
        },
        onClose: function () {
          setIsProcessing(false);
        },
      });

      handler.openIframe();
    } catch (err) {
      console.error('Paystack setup error:', err);
      alert('Paystack failed to open. Check the browser console for details.');
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    if (method === 'paypal') {
      const usdAmount = (subtotal / 1600).toFixed(2);
      window.location.href = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=ajbeautystore756@gmail.com&amount=${usdAmount}&currency_code=USD&item_name=Ajoke+Gold+Boutique+Order&no_shipping=1&return=https://ajoke-gold-international.netlify.app/success&cancel_return=https://ajoke-gold-international.netlify.app/checkout`;
    } else {
      handlePaystackPayment();
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12 px-4 flex items-center justify-center font-sans">
      <div className="w-full max-w-2xl border border-white/10 bg-[#0a0a0a] p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>

        <header className="mb-10 text-center">
          <h1 className="font-serif text-3xl text-white mb-2 tracking-tight">Checkout</h1>
          <p className="text-white/40 text-[10px] uppercase tracking-[0.3em]">Ajoke Gold International Security</p>
        </header>

        <div className="flex justify-between items-center border-b border-white/10 pb-6 mb-10">
          <span className="text-white/60 uppercase tracking-widest text-xs font-semibold">Total Amount</span>
          <span className="text-primary font-serif text-3xl">{formatPrice(subtotal)}</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* BUYER INFO FIELDS */}
          <div className="space-y-4">
            <div>
              <label className="text-white/40 text-[10px] uppercase tracking-[0.2em] block mb-2">Full Name</label>
              <input
                type="text"
                placeholder="e.g. Amara Johnson"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/20 px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            <div>
              <label className="text-white/40 text-[10px] uppercase tracking-[0.2em] block mb-2">Email Address</label>
              <input
                type="email"
                placeholder="e.g. amara@email.com"
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/20 px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            <div>
              <label className="text-white/40 text-[10px] uppercase tracking-[0.2em] block mb-2">Phone Number</label>
              <input
                type="tel"
                placeholder="e.g. 08012345678"
                value={buyerPhone}
                onChange={(e) => setBuyerPhone(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/20 px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          </div>

          {/* PAYMENT METHOD SELECTION */}
          <div className="grid grid-cols-3 gap-3">
            <button type="button" onClick={() => setMethod('card')} className={`flex flex-col items-center p-4 border transition-all ${method === 'card' ? 'border-primary bg-primary/5 shadow-[0_0_15px_rgba(212,175,55,0.1)]' : 'border-white/10 opacity-30 hover:opacity-100'}`}>
              <CreditCard className={`w-5 h-5 mb-2 ${method === 'card' ? 'text-primary' : 'text-white'}`} />
              <span className="text-[10px] uppercase tracking-widest text-white font-bold">Credit Card</span>
            </button>

            <button type="button" onClick={() => setMethod('paypal')} className={`flex flex-col items-center p-4 border transition-all ${method === 'paypal' ? 'border-primary bg-primary/5 shadow-[0_0_15px_rgba(212,175,55,0.1)]' : 'border-white/10 opacity-30 hover:opacity-100'}`}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-5 mb-2" />
              <span className="text-[10px] uppercase tracking-widest text-white font-bold">PayPal</span>
            </button>

            <button type="button" onClick={() => setMethod('paystack')} className={`flex flex-col items-center p-4 border transition-all ${method === 'paystack' ? 'border-primary bg-primary/5 shadow-[0_0_15px_rgba(212,175,55,0.1)]' : 'border-white/10 opacity-30 hover:opacity-100'}`}>
              <img src="https://paystack.com/assets/img/login/paystack-logo.png" alt="Paystack" className="h-3 mb-3 brightness-200" />
              <span className="text-[10px] uppercase tracking-widest text-white font-bold">Paystack</span>
            </button>
          </div>

          <div className="py-12 border border-dashed border-white/10 bg-white/5 text-center px-6">
            <p className="text-white/70 text-sm leading-relaxed">
              You will be redirected to the secure{' '}
              <span className="text-primary font-bold uppercase">
                {method === 'card' ? 'Paystack' : method}
              </span>{' '}
              portal to finalize your order.
            </p>
          </div>

          <Button
            type="submit"
            disabled={isProcessing}
            className="w-full bg-primary text-black hover:bg-primary/90 rounded-none h-14 uppercase tracking-[0.2em] font-bold transition-all"
          >
            {isProcessing ? <Loader2 className="animate-spin mr-2" /> : `Proceed to Payment`}
          </Button>
        </form>

        <footer className="mt-12 flex items-center justify-center gap-2 text-white/20 text-[9px] uppercase tracking-[0.3em]">
          <ShieldCheck className="w-3 h-3 text-primary/50" /> Secure SSL Encrypted Gateway
        </footer>
      </div>
    </div>
  );
};
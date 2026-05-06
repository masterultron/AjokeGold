import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { Loader2, CreditCard, ShieldCheck, AlertTriangle, Truck, Store, Mail, MapPin } from 'lucide-react';

// --- PICKUP ADDRESS (single source of truth, used in UI + email) ---
const PICKUP_ADDRESS = {
  name: 'Abdul Bari',
  line1: '5 Building, 92, 24 Street, 146',
  line2: 'Omar Bin Al Khattab Road',
  area: 'Al Murar, Deira',
  city: 'Dubai Municipality',
};

const formatPickupAddress = () =>
  `${PICKUP_ADDRESS.name}\n${PICKUP_ADDRESS.line1}\n${PICKUP_ADDRESS.line2}\n${PICKUP_ADDRESS.area}\n${PICKUP_ADDRESS.city}`;

export const Checkout = () => {
  const {
    subtotal,
    subtotalInNGN,
    subtotalInUSD,
    formatPrice,
    cart,
    currency,
  } = useCart();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [method, setMethod] = useState<'card' | 'paypal' | 'paystack'>('card');

  // --- FULFILLMENT (Pickup vs Delivery) ---
  const [fulfillment, setFulfillment] = useState<'pickup' | 'delivery'>('pickup');

  // --- BUYER INFO STATE ---
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');

  // Card and Paystack only support NGN in this setup
  const requiresNaira = method === 'card' || method === 'paystack';
  const currencyMismatch = requiresNaira && currency !== 'NGN';

  // --- LOAD PAYSTACK SCRIPT ON MOUNT ---
  useEffect(() => {
    // @ts-ignore
    if (window.PaystackPop) return;
    if (document.querySelector('script[src*="js.paystack.co"]')) return;

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    document.head.appendChild(script);
  }, []);

  // --- PAYSTACK HANDLER ---
  const handlePaystackPayment = () => {
    // @ts-ignore
    if (!window.PaystackPop) {
      alert('Paystack is still loading. Please try again in a moment.');
      setIsProcessing(false);
      return;
    }

    const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    if (!publicKey) {
      alert('Paystack public key is missing. Please contact support.');
      setIsProcessing(false);
      return;
    }

    try {
      // @ts-ignore
      const handler = window.PaystackPop.setup({
        key: publicKey,
        email: buyerEmail,
        amount: Math.round(subtotalInNGN * 100),
        currency: 'NGN',
        metadata: {
          custom_fields: [
            { display_name: 'Payment Source', variable_name: 'payment_source', value: 'Ajoke Gold Web' },
            { display_name: 'Customer Name', variable_name: 'buyer_name', value: buyerName },
            { display_name: 'Customer Phone', variable_name: 'buyer_phone', value: buyerPhone },
            { display_name: 'Fulfillment', variable_name: 'fulfillment', value: fulfillment },
            ...(fulfillment === 'pickup'
              ? [{ display_name: 'Pickup Address', variable_name: 'pickup_address', value: formatPickupAddress().replace(/\n/g, ', ') }]
              : []),
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
                fulfillment,
                pickupAddress: fulfillment === 'pickup' ? PICKUP_ADDRESS : null,
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
      alert('Paystack failed to open. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Block card/paystack if cart isn't in NGN
    if (currencyMismatch) {
      alert(
        `Card and Paystack only support payments in Naira (NGN). Your cart is currently in ${currency}. Please go back and switch your currency to NGN before continuing.`
      );
      return;
    }

    // Confirm extra delivery charge if delivery is selected
    if (fulfillment === 'delivery') {
      const ok = window.confirm(
        'Please note: An additional delivery fee will be communicated to you separately and paid later, after your order is confirmed. Do you want to continue?'
      );
      if (!ok) return;
    }

    setIsProcessing(true);

    if (method === 'paypal') {
      const usdAmount = subtotalInUSD.toFixed(2);
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

          {/* FULFILLMENT SELECTION */}
          <div>
            <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] mb-3">Fulfillment Method</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFulfillment('pickup')}
                className={`flex flex-col items-center p-4 border transition-all ${
                  fulfillment === 'pickup'
                    ? 'border-primary bg-primary/5 shadow-[0_0_15px_rgba(212,175,55,0.1)]'
                    : 'border-white/10 opacity-30 hover:opacity-100'
                }`}
              >
                <Store className={`w-5 h-5 mb-2 ${fulfillment === 'pickup' ? 'text-primary' : 'text-white'}`} />
                <span className="text-[10px] uppercase tracking-widest text-white font-bold">Pickup</span>
              </button>

              <button
                type="button"
                onClick={() => setFulfillment('delivery')}
                className={`flex flex-col items-center p-4 border transition-all ${
                  fulfillment === 'delivery'
                    ? 'border-primary bg-primary/5 shadow-[0_0_15px_rgba(212,175,55,0.1)]'
                    : 'border-white/10 opacity-30 hover:opacity-100'
                }`}
              >
                <Truck className={`w-5 h-5 mb-2 ${fulfillment === 'delivery' ? 'text-primary' : 'text-white'}`} />
                <span className="text-[10px] uppercase tracking-widest text-white font-bold">Delivery</span>
              </button>
            </div>

            {/* DYNAMIC INFO BANNER */}
            {fulfillment === 'pickup' ? (
              <div className="mt-3 border border-primary/20 bg-primary/5 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-primary text-[10px] uppercase tracking-[0.2em] font-bold mb-2">Pickup Location</p>
                    <p className="text-white text-sm leading-relaxed whitespace-pre-line">
                      {formatPickupAddress()}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 border-t border-white/5 pt-3">
                  <Mail className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-white/70 text-xs leading-relaxed">
                    A copy of this address will be sent to{' '}
                    <span className="text-primary font-bold">
                      {buyerEmail || 'your email address'}
                    </span>{' '}
                    once payment is confirmed.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-3 border border-yellow-500/30 bg-yellow-500/5 p-4 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                <p className="text-white/70 text-xs leading-relaxed">
                  An additional <span className="text-yellow-300 font-bold">delivery fee</span> will be
                  communicated to you separately and paid <span className="text-yellow-300 font-bold">later</span>,
                  after your order is confirmed.
                </p>
              </div>
            )}
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

          {/* CURRENCY MISMATCH WARNING */}
          {currencyMismatch && (
            <div className="border border-red-500/30 bg-red-500/5 p-5 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-300 text-sm font-semibold mb-1 uppercase tracking-wider">
                  Currency Not Supported
                </p>
                <p className="text-white/70 text-sm leading-relaxed mb-3">
                  Card and Paystack only accept payments in <span className="text-primary font-bold">Naira (NGN)</span>.
                  Your cart is currently in <span className="text-primary font-bold">{currency}</span>.
                  Please go back and switch your currency to NGN, or use PayPal instead.
                </p>
                <button
                  type="button"
                  onClick={() => setLocation('/cart')}
                  className="text-[11px] uppercase tracking-[0.2em] text-primary border border-primary/40 px-4 py-2 hover:bg-primary/10 transition-colors"
                >
                  ← Back to Cart
                </button>
              </div>
            </div>
          )}

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
            disabled={isProcessing || currencyMismatch}
            className="w-full bg-primary text-black hover:bg-primary/90 rounded-none h-14 uppercase tracking-[0.2em] font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <Loader2 className="animate-spin mr-2" />
            ) : currencyMismatch ? (
              `Switch to NGN to Continue`
            ) : (
              `Proceed to Payment`
            )}
          </Button>
        </form>

        <footer className="mt-12 flex items-center justify-center gap-2 text-white/20 text-[9px] uppercase tracking-[0.3em]">
          <ShieldCheck className="w-3 h-3 text-primary/50" /> Secure SSL Encrypted Gateway
        </footer>
      </div>
    </div>
  );
};
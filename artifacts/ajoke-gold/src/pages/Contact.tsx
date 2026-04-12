import React from 'react';
import { motion } from 'framer-motion';

export default function Contact() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-32 pb-24 px-6 md:px-12 flex items-center justify-center">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-16">
        
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl font-serif text-white mb-8">Private Viewing</h1>
          <p className="text-white/60 leading-relaxed mb-12">
            We welcome discerning clients to experience our collections in person at our Dubai Gold Souk showroom. Please reach out to schedule a private viewing or for any specialized inquiries.
          </p>

          <div className="space-y-8 text-sm tracking-wider uppercase">
            <div>
              <p className="text-primary mb-2">Boutique</p>
              <p className="text-white/80">Dubai Gold Souk<br/>Deira, Dubai, UAE</p>
            </div>
            <div>
              <p className="text-primary mb-2">Concierge</p>
              <p className="text-white/80">+971 50 123 4567<br/>concierge@ajokegold.com</p>
            </div>
            <div>
              <p className="text-primary mb-2">Hours</p>
              <p className="text-white/80">Mon - Sat: 10:00 - 22:00<br/>Sun: By Appointment</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white/5 p-8 md:p-12 border border-white/10"
        >
          <h2 className="font-serif text-2xl text-white mb-8">Send an Inquiry</h2>
          <form className="space-y-6" onSubmit={e => e.preventDefault()}>
            <div>
              <input type="text" placeholder="Full Name" className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:border-primary focus:outline-none transition-colors" data-testid="input-contact-name" />
            </div>
            <div>
              <input type="email" placeholder="Email Address" className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:border-primary focus:outline-none transition-colors" data-testid="input-contact-email" />
            </div>
            <div>
              <textarea placeholder="Your Message" rows={4} className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:border-primary focus:outline-none transition-colors resize-none" data-testid="input-contact-message"></textarea>
            </div>
            <button className="w-full bg-primary text-black hover:bg-white hover:text-black transition-colors py-4 uppercase tracking-widest text-sm font-medium mt-4" data-testid="btn-send-inquiry">
              Send Message
            </button>
          </form>
        </motion.div>

      </div>
    </div>
  );
}

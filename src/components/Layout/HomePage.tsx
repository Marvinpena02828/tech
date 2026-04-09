'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface PromotionalBar {
  message: string;
  background_color: string;
  text_color: string;
  is_active: boolean;
}

export default function HomePage({ children }: { children?: React.ReactNode }) {
  const [promoBar, setPromoBar] = useState<PromotionalBar | null>(null);
  const [show, setShow] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchPromo = async () => {
      try {
        const { data } = await supabase
          .from('promotional_bars')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (data) setPromoBar(data);
      } catch (err) {
        console.error('Error fetching promo:', err);
      }
    };

    fetchPromo();
  }, []);

  useEffect(() => {
    let lastScroll = 0;

    const handleScroll = () => {
      const current = window.scrollY;
      if (current > lastScroll && current > 100) {
        setShow(false);
      } else if (current < lastScroll || current < 10) {
        setShow(true);
      }
      lastScroll = current;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Promo Bar - STICKY, not fixed - renders BEFORE everything */}
      {promoBar?.is_active && (
        <div
          className="sticky top-0 left-0 right-0 w-full z-50 transition-all duration-300"
          style={{
            backgroundColor: promoBar.background_color,
            maxHeight: show ? '45px' : '0px',
            opacity: show ? 1 : 0,
            overflow: 'hidden',
            marginBottom: show ? '0px' : '-45px',
          }}
        >
          <div className="px-4 md:px-8 py-2 flex items-center justify-between">
            <p
              className="text-xs md:text-sm font-medium flex-1 text-center"
              style={{ color: promoBar.text_color }}
            >
              {promoBar.message}
            </p>
            <button
              onClick={() => setShow(false)}
              className="ml-4 p-0.5 hover:opacity-70 transition flex-shrink-0 text-sm"
              style={{ color: promoBar.text_color }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main content - Header, children, etc. render AFTER promo bar */}
      {children}
    </>
  );
}

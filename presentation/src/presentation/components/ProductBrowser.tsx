import { motion } from 'framer-motion';
import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

type Props = {
  src?: string;
  fallbackSrc?: string;
  alt?: string;
  url?: string;
  className?: string;
  children?: ReactNode;
  /** Camera focus */
  focus?: { x: number; y: number; scale: number };
  highlight?: { top: number; left: number; width: number; height: number; label: string };
  cursor?: { x: number; y: number; click?: boolean };
  dimOutside?: boolean;
};

export function ProductBrowser({
  src,
  fallbackSrc,
  alt = 'WorkNest',
  url = 'app.worknest.com',
  className = '',
  children,
  focus = { x: 50, y: 45, scale: 1 },
  highlight,
  cursor,
  dimOutside = true,
}: Props) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(src || '');

  useEffect(() => setCurrent(src || ''), [src]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <div
        className={`relative overflow-hidden rounded-[18px] border border-[#D4CBE0]/90 bg-white shadow-[0_28px_70px_rgba(50,20,64,0.14)] ${className}`}
      >
        <div className="relative z-20 flex items-center gap-3 border-b border-[#E8E0F0] bg-[#FAF7FC] px-4 py-2">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
          </div>
          <div className="flex-1 truncate rounded-full bg-white px-3 py-1 text-center text-[11px] font-medium text-[#8B8298] ring-1 ring-[#E8E0F0]">
            {url}
          </div>
          {src ? (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="rounded-full bg-[#49225B] px-2.5 py-1 text-[10px] font-bold text-white"
            >
              Expand
            </button>
          ) : null}
        </div>

        <div className="relative aspect-[16/10] overflow-hidden bg-[#EDE4F5]">
          <motion.div
            className="absolute inset-0 origin-center"
            animate={{
              scale: focus.scale,
              x: `${(50 - focus.x) * 0.35}%`,
              y: `${(45 - focus.y) * 0.35}%`,
            }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          >
            {src ? (
              <button type="button" className="block h-full w-full cursor-zoom-in" onClick={() => setOpen(true)}>
                <img
                  src={current}
                  alt={alt}
                  className="h-full w-full object-contain object-top"
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (fallbackSrc && img.dataset.tried !== '1') {
                      img.dataset.tried = '1';
                      setCurrent(fallbackSrc);
                    }
                  }}
                />
              </button>
            ) : (
              children
            )}
          </motion.div>

          {dimOutside && highlight ? (
            <div className="pointer-events-none absolute inset-0 bg-[#1A1224]/25 transition-opacity" />
          ) : null}

          {highlight ? (
            <motion.div
              className="pointer-events-none absolute z-10 rounded-xl border-2 border-[#F97316] shadow-[0_0_0_9999px_rgba(26,18,36,0.45)]"
              style={{
                top: `${highlight.top}%`,
                left: `${highlight.left}%`,
                width: `${highlight.width}%`,
                height: `${highlight.height}%`,
              }}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <span className="absolute -top-3 left-3 rounded-full bg-[#F97316] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                {highlight.label}
              </span>
            </motion.div>
          ) : null}

          {cursor ? (
            <motion.div
              className="pointer-events-none absolute z-20"
              initial={{ opacity: 0, left: `${cursor.x - 8}%`, top: `${cursor.y - 8}%` }}
              animate={{
                opacity: 1,
                left: `${cursor.x}%`,
                top: `${cursor.y}%`,
                scale: cursor.click ? [1, 0.88, 1] : 1,
              }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M5 3l14 8.5-6.2 1.6L10 21 5 3z" fill="#1A1224" stroke="#fff" strokeWidth="1.5" />
              </svg>
            </motion.div>
          ) : null}
        </div>
      </div>

      {open && src
        ? createPortal(
            <div
              className="fixed inset-0 z-[120] flex items-center justify-center bg-[#120E18]/9 p-4 backdrop-blur-sm"
              onClick={() => setOpen(false)}
              role="dialog"
              aria-modal="true"
            >
              <button
                type="button"
                className="absolute right-5 top-5 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white"
                onClick={() => setOpen(false)}
              >
                Close · Esc
              </button>
              <img
                src={current || src}
                alt={alt}
                className="max-h-[92vh] max-w-[96vw] rounded-xl object-contain shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

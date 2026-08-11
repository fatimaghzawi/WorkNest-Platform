import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

type Props = {
  children?: ReactNode;
  src?: string;
  fallbackSrc?: string;
  alt?: string;
  url?: string;
  className?: string;
  dim?: boolean;
  /** Max height of the preview image area */
  imgClassName?: string;
};

export function BrowserFrame({
  children,
  src,
  fallbackSrc,
  alt = 'WorkNest',
  url = 'app.worknest.com',
  className = '',
  dim = false,
  imgClassName = 'max-h-[min(52vh,480px)]',
}: Props) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(src || '');

  useEffect(() => {
    setCurrent(src || '');
  }, [src]);

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
        className={`overflow-hidden rounded-[16px] border border-[#D4CBE0]/80 bg-white shadow-[0_24px_60px_rgba(50,20,64,0.12)] ${
          dim ? 'opacity-55 saturate-75' : ''
        } ${className}`}
      >
        <div className="flex items-center gap-3 border-b border-[#E8E0F0] bg-[#FAF7FC] px-4 py-2">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
          </div>
          <div className="flex-1 truncate rounded-full bg-white px-3 py-1 text-center text-[11px] font-medium text-[#8B8298] shadow-sm ring-1 ring-[#E8E0F0]">
            {url}
          </div>
          {src ? (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="rounded-full bg-[#49225B] px-2.5 py-1 text-[10px] font-bold tracking-wide text-white"
            >
              Expand
            </button>
          ) : null}
        </div>
        <div className="relative bg-[#E8E0F0]/50">
          {src ? (
            <button
              type="button"
              className="block w-full cursor-zoom-in text-left"
              onClick={() => setOpen(true)}
              title="Click to view full screen"
            >
              <img
                src={current}
                alt={alt}
                className={`mx-auto block w-full object-contain object-top ${imgClassName}`}
                onError={(e) => {
                  const img = e.currentTarget;
                  if (fallbackSrc && img.dataset.tried !== '1') {
                    img.dataset.tried = '1';
                    setCurrent(fallbackSrc);
                    return;
                  }
                  img.style.display = 'none';
                }}
              />
              <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-[#1A1224]/75 px-3 py-1 text-[10px] font-semibold text-white backdrop-blur">
                Click to expand
              </span>
            </button>
          ) : (
            children
          )}
        </div>
      </div>

      {open && src
        ? createPortal(
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-[#120E18]/88 p-4 backdrop-blur-sm"
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

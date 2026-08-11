import { BrowserFrame } from './BrowserFrame';

type Props = {
  src: string;
  alt?: string;
  url?: string;
  className?: string;
  highlight?: string;
};

export function ProductMockup({
  src,
  alt,
  url = 'app.worknest.com',
  className = '',
  highlight,
}: Props) {
  return (
    <div className={`relative ${className}`}>
      <BrowserFrame src={src} alt={alt} url={url} className="h-full" />
      {highlight ? (
        <div className="pointer-events-none absolute inset-x-6 bottom-5 rounded-xl bg-wn-primary/90 px-4 py-2.5 text-sm font-medium text-white shadow-soft backdrop-blur">
          {highlight}
        </div>
      ) : null}
    </div>
  );
}

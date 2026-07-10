import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function scrollToHashTarget(hash: string) {
  const id = hash.replace('#', '');
  if (!id) return false;

  const element = document.getElementById(id);
  if (!element) return false;

  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return true;
}

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      if (scrollToHashTarget(hash)) return;

      const timer = window.setTimeout(() => {
        scrollToHashTarget(hash);
      }, 100);

      return () => window.clearTimeout(timer);
    }

    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollPageToTop } from '../lib/scrollPageToTop';

/** Recenter at the top on every route change in the funnel. */
export function ScrollToTop() {
  const { pathname, search, hash, key } = useLocation();

  useLayoutEffect(() => {
    if (pathname === '/scroll' || pathname === '/immersive') return;
    // ForcedStepper handoff owns scroll (package / add-ons hashes).
    if (
      /^\/event\/[^/]+$/.test(pathname) &&
      (hash === '#package' ||
        hash === '#session' ||
        hash === '#addons' ||
        search.includes('package_id='))
    ) {
      return;
    }
    return scrollPageToTop();
  }, [pathname, search, hash, key]);

  return null;
}

'use client';

import { createContext, useContext } from 'react';

const PortalNavContext = createContext({ hidden: false, show: () => {} });

export function PortalNavProvider({ hidden, show, children }) {
  return <PortalNavContext.Provider value={{ hidden, show }}>{children}</PortalNavContext.Provider>;
}

export function usePortalNav() {
  return useContext(PortalNavContext);
}

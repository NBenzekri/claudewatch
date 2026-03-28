'use client';

import { useEffect, useState } from 'react';

export default function MainContent({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // Read initial state
    setExpanded(localStorage.getItem('sidebar-expanded') === 'true');

    // Listen for sidebar changes via body class
    const observer = new MutationObserver(() => {
      setExpanded(document.body.classList.contains('sidebar-expanded'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return (
    <main
      className="min-h-screen p-8 transition-all duration-200"
      style={{ marginLeft: expanded ? 220 : 56 }}
    >
      {children}
    </main>
  );
}

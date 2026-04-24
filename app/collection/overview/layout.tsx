'use client';

import { CollectionToolbar } from '@/components/collection/CollectionToolbar';

export default function CollectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full p-5">
      <CollectionToolbar />
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}

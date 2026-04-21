import { Metadata } from 'next';
import { ShieldCheck } from 'lucide-react';

import ShareUnlockCard from './share-unlock-card';

export const metadata: Metadata = {
  title: 'Shared File',
  description: 'Secure shared file access.',
};

const SharePage = async ({
  params,
}: {
  params: Promise<{ token: string }>;
}) => {
  const { token } = await params;

  return (
    <main className='mx-auto flex min-h-screen w-full max-w-2xl items-center justify-center px-4 py-10 sm:px-6'>
      <section className='w-full rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card/95 to-card/90 p-6 shadow-lg shadow-black/20 sm:p-8'>
        <div className='mb-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 border border-blue-500/30'>
          <ShieldCheck className='h-3.5 w-3.5' />
          Secure share link
        </div>
        <ShareUnlockCard token={token} />
      </section>
    </main>
  );
};

export default SharePage;

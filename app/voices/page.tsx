import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import VoicesPageClient from '@/components/VoicesPageClient';
import VoicesPageHero from '@/components/VoicesPageHero';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getInitialVoices() {
  try {
    const [voices, total] = await Promise.all([
      prisma.comment.findMany({
        where: {
          status: 'APPROVED',
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 12,
      }),
      prisma.comment.count({
        where: {
          status: 'APPROVED',
        },
      }),
    ]);

    return {
      voices: voices.map((v) => ({
        id: v.id,
        message: v.content,
        createdAt: v.createdAt.toISOString(),
        topicTags: null, // Not in schema, but frontend expects it
      })),
      pagination: {
        page: 1,
        size: 12,
        total,
        totalPages: Math.ceil(total / 12),
        hasMore: total > 12,
      },
    };
  } catch (error) {
    console.error('[VoicesPage] Error fetching voices:', error);
    return {
      voices: [],
      pagination: {
        page: 1,
        size: 12,
        total: 0,
        totalPages: 0,
        hasMore: false,
      },
    };
  }
}

export default async function VoicesPage() {
  const initialData = await getInitialVoices();

  return (
    <main className="min-h-screen">
      <Navbar />
      <VoicesPageHero />

      <section className="py-12 sm:py-16 md:py-20 lg:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <VoicesPageClient initialData={initialData} />
        </div>
      </section>

      <Footer />
    </main>
  );
}

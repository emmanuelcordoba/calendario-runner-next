import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getEditionBySlugAndYear } from '@/lib/queries/editions';
import { formatDate, formatYear } from '@/lib/utils';
import type { Metadata } from 'next';

export const revalidate = 3600;

interface Props {
    params: Promise<{ slug: string; year: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug, year } = await params;
    const edition = await getEditionBySlugAndYear(slug, year);
    if (!edition) return { title: 'Carrera no encontrada' };
    return { title: `${edition.race.name} ${year}` };
}

export default async function EditionPage({ params }: Props) {
    const { slug, year } = await params;
    const edition = await getEditionBySlugAndYear(slug, year);

    if (!edition) notFound();

    const imageUrl = edition.image || edition.race.image || '/logo.png';
    const dateLabel =
        edition.startDate === edition.endDate
            ? `${formatDate(edition.startDate)} de ${formatYear(edition.startDate)}`
            : `${formatDate(edition.startDate)} al ${formatDate(edition.endDate)} de ${formatYear(edition.startDate)}`;

    return (
        <article className="mb-4 rounded-lg border bg-card p-5">
            <h2 className="text-2xl font-semibold tracking-tight">{edition.race.name}</h2>
            <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-12">
                <div className="md:col-span-8 lg:col-span-9">
                    {edition.race.description && (
                        <p className="text-sm leading-6 text-muted-foreground">
                            {edition.race.description}
                        </p>
                    )}
                    <dl className="mt-4 space-y-3">
                        <div>
                            <dt className="text-sm font-medium">Fecha</dt>
                            <dd className="mt-1 text-sm text-muted-foreground">{dateLabel}</dd>
                        </div>
                        {edition.race.finalPlace && (
                            <div>
                                <dt className="text-sm font-medium">Lugar</dt>
                                <dd className="mt-1 text-sm text-muted-foreground">
                                    {edition.race.finalPlace}
                                </dd>
                            </div>
                        )}
                        <div>
                            <dt className="text-sm font-medium">Disciplina</dt>
                            <dd className="mt-1 text-sm text-muted-foreground">
                                {edition.race.discipline.name}
                            </dd>
                        </div>
                        {edition.distances.length > 0 && (
                            <div>
                                <dt className="text-sm font-medium">Distancias</dt>
                                <dd className="mt-1 text-sm text-muted-foreground">
                                    {edition.distances.join(' - ')}
                                </dd>
                            </div>
                        )}
                        {edition.race.links && edition.race.links.length > 0 && (
                            <div>
                                <dt className="text-sm font-medium">Enlaces</dt>
                                <dd className="mt-2 flex flex-wrap gap-2">
                                    {edition.race.links.map((link) => (
                                        <a
                                            href={link.url ?? '#'}
                                            key={link.id}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex rounded-md border px-3 py-1 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                                        >
                                            {link.type}
                                        </a>
                                    ))}
                                </dd>
                            </div>
                        )}
                    </dl>
                </div>
                <div className="md:col-span-4 lg:col-span-3">
                    <div className="overflow-hidden rounded-lg border bg-background">
                        <img
                            src={imageUrl}
                            className="h-auto w-full object-cover"
                            alt={`Logo de ${edition.race.name}`}
                        />
                    </div>
                </div>
            </div>
            <Link
                href="/"
                className="mt-4 inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
                ← Volver
            </Link>
        </article>
    );
}

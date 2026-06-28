import Link from 'next/link';
import { formatDate, formatYear } from '@/lib/utils';
import { EditionWithRace } from '@/lib/queries/editions';

export default function RaceItem({ edition }: { edition: EditionWithRace }) {
    const year = formatYear(edition.startDate);
    const href = `/carreras/${edition.race.slug}/ediciones/${year}`;
    const imageUrl = edition.race.image ?? '/logo.png';

    const dateLabel =
        edition.startDate === edition.endDate
            ? formatDate(edition.startDate)
            : `${formatDate(edition.startDate)} - ${formatDate(edition.endDate)}`;

    return (
        <Link
            href={href}
            className="block rounded-lg border bg-card p-3 transition-colors hover:bg-accent/40"
        >
            <div className="flex gap-3">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-background">
                    <img
                        className="h-full w-full object-cover"
                        src={imageUrl}
                        alt=""
                    />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                        <h5 className="text-base font-semibold leading-tight">
                            {edition.race.name}
                        </h5>
                        <small className="text-muted-foreground">{dateLabel}</small>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {edition.distances.join(' - ')}
                    </p>
                    <small className="text-xs uppercase tracking-wide text-muted-foreground">
                        {edition.race.discipline.name}
                    </small>
                </div>
            </div>
        </Link>
    );
}

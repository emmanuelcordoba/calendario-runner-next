'use client';

import { useTransition } from 'react';
import { cn } from '@/lib/utils';

interface Props {
    id: number;
    published: boolean;
    action: (formData: FormData) => Promise<void>;
}

export default function PublishToggle({ id, published, action }: Props) {
    const [pending, startTransition] = useTransition();

    return (
        <form action={(fd) => startTransition(() => action(fd))} className="inline-flex">
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="published" value={published ? 'true' : 'false'} />
            <button
                type="submit"
                role="switch"
                aria-checked={published}
                aria-label={published ? 'Publicada' : 'No publicada'}
                title={published ? 'Publicada — click para ocultar' : 'No publicada — click para publicar'}
                disabled={pending}
                className={cn(
                    'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50',
                    published ? 'bg-primary' : 'bg-input',
                )}
            >
                <span
                    className={cn(
                        'inline-block h-4 w-4 transform rounded-full bg-background shadow transition-transform',
                        published ? 'translate-x-4' : 'translate-x-0.5',
                    )}
                />
            </button>
        </form>
    );
}

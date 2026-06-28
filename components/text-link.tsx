import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ComponentProps } from 'react';

export default function TextLink({
    className,
    ...props
}: ComponentProps<typeof Link>) {
    return (
        <Link
            className={cn('text-primary underline-offset-4 hover:underline', className)}
            {...props}
        />
    );
}

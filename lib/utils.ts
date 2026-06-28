import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'numeric' }).format(date);
}

export function formatYear(dateStr: string): string {
    return dateStr.split('-')[0];
}

export function formatFullDate(startDate: string, endDate: string): string {
    const year = formatYear(startDate);
    if (startDate === endDate) {
        return `${formatDate(startDate)} de ${year}`;
    }
    return `${formatDate(startDate)} al ${formatDate(endDate)} de ${year}`;
}

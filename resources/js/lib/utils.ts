import { InertiaLinkProps } from '@inertiajs/vue3';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function urlIsActive(
    urlToCheck: NonNullable<InertiaLinkProps['href']>,
    currentUrl: string,
) {
    return toUrl(urlToCheck) === currentUrl;
}

export function toUrl(href: NonNullable<InertiaLinkProps['href']>) {
    return typeof href === 'string' ? href : href?.url;
}

export async function fetchMetric<T>(
    url: string,
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
): Promise<T> {
    const response = await fetch(url, {
        method: method,
    });

    // given more time, i'd probably expand the error logging to include the failing url / status code as well.
    if (!response.ok) {
        throw new Error(response.statusText);
    }

    return await response.json();
}

export function currencyFormatter(locale: string, currency: string) {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 2,
    });
}

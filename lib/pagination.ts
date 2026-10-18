/**
 * Configuración del paginado de las listas del admin.
 *
 * Vive acá y no en cada página porque estaba repetida en las tres listas más
 * el componente, así que cambiar el valor por defecto obligaba a tocar cuatro
 * archivos y era fácil que quedaran distintos entre sí.
 */
export const PAGE_SIZES = [10, 20, 50, 100] as const;

export const DEFAULT_PAGE_SIZE = 10;

/** Devuelve el tamaño pedido si es uno de los permitidos, o el por defecto. */
export function resolvePageSize(valor: string | undefined): number {
    const n = Number(valor);
    return (PAGE_SIZES as readonly number[]).includes(n) ? n : DEFAULT_PAGE_SIZE;
}

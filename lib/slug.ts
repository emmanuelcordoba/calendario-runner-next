/**
 * Genera el slug de una carrera a partir de su nombre.
 *
 * El slug es la URL pública (/carreras/<slug>/ediciones/<year>) y la columna
 * `slug` es unique, así que esta tiene que ser la única implementación: la usan
 * tanto el alta desde el admin como el seed. Mientras estuvo duplicada en los
 * dos lugares, cualquier arreglo en uno los hacía producir slugs distintos para
 * el mismo nombre.
 */
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '') // saca los acentos
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-') // un " - " en el nombre dejaba "---"
        .replace(/^-|-$/g, '');
}

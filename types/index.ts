import { LucideIcon } from 'lucide-react';

export interface User {
    id: number;
    name: string;
    email: string;
    isAdmin: boolean;
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface Edition {
    id: number;
    start_date: string;
    end_date: string;
    distances: string[];
    image: string | null;
    race: Race;
}

export interface Race {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    final_place: string | null;
    place: string | null;
    discipline: Discipline;
    places?: Place[];
    links?: Link[];
}

export interface Discipline {
    id: number;
    name: string;
    description: string | null;
}

export interface Province {
    id: number;
    name: string;
}

export interface Locality {
    id: number;
    name: string;
    province_id: number;
}

export interface Place {
    id: number;
    province: Province;
    locality?: Locality | null;
    place?: string | null;
}

export interface Link {
    id: number;
    type: string;
    title: string | null;
    url: string | null;
}

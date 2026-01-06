export interface CategoryTypeResponse {
    category: Category;
    types: TypeItem[];
}

export interface Category {
    id: number;
    name: string;
    slug: string;
    category_id: number | null;
    image: string | null;
    title: string | null;
    heading_h2: string | null;
    visiting_inspection_cost: number | null;
    description: string | null;
    icon_image: string | null;
    seo_title: string | null;
    seo_keywords: string | null;
    seo_description: string | null;
    sort_order: number | null;
    status: number;
    created_at: string;
    updated_at: string;
    category_label: 'L1' | 'L2' | 'L3';
    children_categories: ChildCategory[];
}

export interface ChildCategory {
    id: number;
    name: string;
    slug: string;
    category_id: number;
    image: string | null;
    title: string | null;
    heading_h2: string | null;
    visiting_inspection_cost: number | null;
    description: string | null;
    icon_image: string | null;
    seo_title: string | null;
    seo_keywords: string | null;
    seo_description: string | null;
    sort_order: number | null;
    status: number;
    created_at: string;
    updated_at: string;
    category_label: 'L1' | 'L2' | 'L3';
    categories: ChildCategory[];
}

export interface TypeItem {
    id: number;
    name: string;
    has_capacity: boolean;
}

export interface CapacityItem {
    capacities: {
        id: number,
        name: string,
    }[];
}

export interface GetServicesPriceResponse {
    services: {
        id: number;
        name: string;
        price: number;
    }[];
}
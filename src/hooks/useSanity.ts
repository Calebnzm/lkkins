import { useState, useEffect } from 'react';
import { fetchSanity, queries, urlFor } from '@/lib/sanity';

// Type alias for Sanity image objects
type SanityImageSource = Record<string, unknown>;

// Types for Sanity data
export interface ProductVariant {
    _key: string;
    size: string;
    color: string;
    colorHex?: string;
    stock: number;
}

export interface SanityProduct {
    _id: string;
    name: string;
    slug: string;
    price: number;
    category: string;
    categorySlug: string;
    image: SanityImageSource;
    description: string;
    featured: boolean;
    variants: ProductVariant[];
}

export interface SanityCategory {
    _id: string;
    name: string;
    slug: string;
    order: number;
}

export interface SanityHeroImage {
    _id: string;
    image: SanityImageSource;
    alt: string;
    order: number;
}

export interface SanityService {
    _id: string;
    title: string;
    description: string;
    icon: string;
    features: string[];
    order: number;
}

export interface SanityMockup {
    _id: string;
    image: SanityImageSource;
    alt: string;
    startingPrice?: number;
    priceNote?: string;
    order: number;
}

// Generic hook for fetching data
function useSanityData<T>(query: string, fallback: T): { data: T; loading: boolean; error: Error | null } {
    const [data, setData] = useState<T>(fallback);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        console.log('[Sanity] Fetching with query:', query.substring(0, 50) + '...');
        fetchSanity<T>(query)
            .then((result) => {
                console.log('[Sanity] Fetch result:', result);
                setData(result);
                setLoading(false);
            })
            .catch((err) => {
                console.error('[Sanity] Fetch error:', err);
                setError(err);
                setLoading(false);
            });
    }, [query]);

    return { data, loading, error };
}

// Specific hooks for each content type
export function useProducts() {
    return useSanityData<SanityProduct[]>(queries.products, []);
}

export function useCategories() {
    return useSanityData<SanityCategory[]>(queries.categories, []);
}

export function useHeroImages() {
    return useSanityData<SanityHeroImage[]>(queries.heroImages, []);
}

export function useMockups() {
    return useSanityData<SanityMockup[]>(queries.mockups, []);
}

// Promotion types
export interface SanityPromotion {
    _id: string;
    title: string;
    code?: string;
    description: string;
    displayMessage?: string;
    discountType: 'percentage' | 'fixed' | 'freeGift' | 'bogo' | 'freeShipping' | 'bundle';
    discountValue?: number;
    minimumSpend?: number;
    giftDescription?: string;
    periodType: 'oneTime' | 'recurring';
    recurrencePattern?: 'daily' | 'weekly' | 'monthly';
    recurrenceDays?: number[];
    startDate: string;
    endDate: string;
    bannerColor: string;
    textColor: string;
    applicableProducts?: string[];
    applicableCategories?: string[];
}

export function usePromotions() {
    return useSanityData<SanityPromotion[]>(queries.promotions, []);
}

// Corporate/Bulk discount types
export interface SanityCorporateDiscount {
    _id: string;
    title: string;
    displayMessage: string;
    description?: string;
    minQuantity: number;
    maxQuantity?: number;
    discountPercentage: number;
    highlightColor: string;
    applicableProducts?: string[];
    applicableCategories?: string[];
}

export function useCorporateDiscounts() {
    return useSanityData<SanityCorporateDiscount[]>(queries.corporateDiscounts, []);
}

// Corporate pricing types
export interface SanityCorporatePricing {
    _id: string;
    productName: string;
    startingPrice: number;
    priceNote?: string;
    description?: string;
    image?: {
        asset: {
            _ref: string;
        };
    };
    isPopular: boolean;
}

export function useCorporatePricing() {
    return useSanityData<SanityCorporatePricing[]>(queries.corporatePricing, []);
}

// Re-export urlFor for convenience
export { urlFor };


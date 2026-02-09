import { createClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';

// Read-only client for fetching data
export const sanityClient = createClient({
  projectId: 'x7fgqy6f',
  dataset: 'production',
  useCdn: false, // Set to false for fresh data during development
  apiVersion: '2024-01-01',
});

// Write client for updating data (requires token)
const sanityWriteClient = createClient({
  projectId: 'x7fgqy6f',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: import.meta.env.VITE_SANITY_WRITE_TOKEN || '',
});

// Image URL builder
const builder = createImageUrlBuilder(sanityClient);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function urlFor(source: any) {
  return builder.image(source);
}

// Variant type for size/color stock
export interface ProductVariant {
  _key: string;
  size: string;
  color: string;
  colorHex?: string;
  stock: number;
}

// Update stock quantity for a specific variant
export async function updateVariantStock(
  productId: string,
  variantKey: string,
  quantityToDeduct: number
): Promise<boolean> {
  try {
    // Get current variants
    const product = await sanityClient.fetch<{ variants: ProductVariant[] }>(
      `*[_type == "product" && _id == $productId][0] { variants }`,
      { productId }
    );

    if (!product?.variants) {
      console.error(`Product ${productId} not found or has no variants`);
      return false;
    }

    // Find and update the specific variant
    const updatedVariants = product.variants.map((v) => {
      if (v._key === variantKey) {
        return { ...v, stock: Math.max(0, (v.stock || 0) - quantityToDeduct) };
      }
      return v;
    });

    // Update variants
    await sanityWriteClient
      .patch(productId)
      .set({ variants: updatedVariants })
      .commit();

    console.log(`[Sanity] Updated stock for variant ${variantKey} in product ${productId}`);
    return true;
  } catch (error) {
    console.error('[Sanity] Failed to update variant stock:', error);
    return false;
  }
}

// Get variant stock
export async function getVariantStock(productId: string, variantKey: string): Promise<number> {
  try {
    const product = await sanityClient.fetch<{ variants: ProductVariant[] }>(
      `*[_type == "product" && _id == $productId][0] { variants }`,
      { productId }
    );
    const variant = product?.variants?.find((v) => v._key === variantKey);
    return variant?.stock || 0;
  } catch (error) {
    console.error('[Sanity] Failed to get variant stock:', error);
    return 0;
  }
}

// GROQ Queries
export const queries = {
  // Products with category and variants
  products: `*[_type == "product"] | order(name asc) {
    _id,
    name,
    "slug": slug.current,
    price,
    "category": category->name,
    "categorySlug": category->slug.current,
    image,
    description,
    featured,
    variants[] {
      _key,
      size,
      color,
      colorHex,
      stock
    }
  }`,

  // Categories ordered
  categories: `*[_type == "category"] | order(order asc) {
    _id,
    name,
    "slug": slug.current,
    order
  }`,

  // Hero images ordered
  heroImages: `*[_type == "heroImage"] | order(order asc) {
    _id,
    image,
    alt,
    order
  }`,

  // Services ordered
  services: `*[_type == "service"] | order(order asc) {
    _id,
    title,
    description,
    icon,
    features,
    order
  }`,

  // Mockups ordered
  mockups: `*[_type == "mockup"] | order(order asc) {
    _id,
    image,
    alt,
    startingPrice,
    priceNote,
    order
  }`,

  // Core values ordered
  coreValues: `*[_type == "coreValue"] | order(order asc) {
    _id,
    title,
    description,
    order
  }`,

  // Site settings (singleton)
  siteSettings: `*[_type == "siteSettings"][0] {
    companyName,
    tagline,
    logo,
    mission,
    vision,
    contactEmail,
    secondaryEmail,
    contactPhone,
    address,
    socialLinks
  }`,

  // Active promotions (within date range and active)
  promotions: `*[_type == "promotion" && isActive == true && startDate <= now() && endDate >= now()] | order(endDate asc) {
    _id,
    title,
    code,
    description,
    displayMessage,
    discountType,
    discountValue,
    minimumSpend,
    giftDescription,
    periodType,
    recurrencePattern,
    recurrenceDays,
    startDate,
    endDate,
    bannerColor,
    textColor,
    "applicableProducts": applicableProducts[]->_id,
    "applicableCategories": applicableCategories[]->name
  }`,

  // Corporate/bulk discounts
  corporateDiscounts: `*[_type == "corporateDiscount" && isActive == true] | order(displayOrder asc, minQuantity asc) {
    _id,
    title,
    displayMessage,
    description,
    minQuantity,
    maxQuantity,
    discountPercentage,
    highlightColor,
    "applicableProducts": applicableProducts[]->_id,
    "applicableCategories": applicableCategories[]->name
  }`,

  // Corporate pricing
  corporatePricing: `*[_type == "corporatePricing" && isActive == true] | order(displayOrder asc) {
    _id,
    productName,
    startingPrice,
    priceNote,
    description,
    image,
    isPopular
  }`,
};

// Fetch helper
export async function fetchSanity<T>(query: string): Promise<T> {
  return sanityClient.fetch(query);
}

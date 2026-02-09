import { useState, useEffect } from "react";
import { ShoppingCart, Plus, ArrowLeft, ShoppingBag, Loader2, Mail, Phone, MapPin, Globe, CheckCircle2, Clock, Tag, Sparkles, Gift } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { CartDrawer } from "@/components/CartDrawer";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { useProducts, useCategories, usePromotions, urlFor, type SanityProduct, type SanityPromotion } from "@/hooks/useSanity";

// Check if promotion is active today based on recurrence pattern
function isPromotionActiveToday(promotion: SanityPromotion): boolean {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);

    // Check if within date range
    if (now < startDate || now > endDate) return false;

    // One-time promotions are always active within their date range
    if (promotion.periodType === 'oneTime' || !promotion.periodType) return true;

    // Check recurrence pattern
    if (promotion.periodType === 'recurring') {
        const today = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const dayOfMonth = now.getDate();

        switch (promotion.recurrencePattern) {
            case 'daily':
                return true;
            case 'weekly':
                // Check if today's day of week is in the recurrence days
                return promotion.recurrenceDays?.includes(today) ?? false;
            case 'monthly':
                // Check if today's day of month is in the recurrence days
                return promotion.recurrenceDays?.includes(dayOfMonth) ?? false;
            default:
                return true;
        }
    }

    return true;
}

// Countdown timer component
function CountdownTimer({ endDate }: { endDate: string }) {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = new Date(endDate).getTime() - new Date().getTime();
            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            }
        };
        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(timer);
    }, [endDate]);

    return (
        <div className="flex items-center gap-1 text-sm font-mono">
            <Clock className="h-4 w-4 mr-1" />
            {timeLeft.days > 0 && <span>{timeLeft.days}d</span>}
            <span>{String(timeLeft.hours).padStart(2, '0')}h</span>
            <span>{String(timeLeft.minutes).padStart(2, '0')}m</span>
            <span>{String(timeLeft.seconds).padStart(2, '0')}s</span>
        </div>
    );
}

// Promotion banner component
function PromotionBanner({ promotion }: { promotion: SanityPromotion }) {
    // Build discount text based on type
    let discountText = '';
    let IconComponent = Sparkles;

    switch (promotion.discountType) {
        case 'percentage':
            discountText = `${promotion.discountValue}% OFF`;
            break;
        case 'fixed':
            discountText = `KSh ${promotion.discountValue} OFF`;
            break;
        case 'freeGift':
            IconComponent = Gift;
            discountText = promotion.minimumSpend
                ? `Spend KSh ${promotion.minimumSpend.toLocaleString()}, Get ${promotion.giftDescription || 'Free Gift'}!`
                : `FREE GIFT: ${promotion.giftDescription || 'Special Offer'}`;
            break;
        case 'freeShipping':
            discountText = 'FREE SHIPPING';
            break;
        case 'bogo':
            discountText = 'BUY ONE GET ONE';
            break;
        default:
            discountText = 'BUNDLE DEAL';
    }

    // Use custom display message if provided
    const displayText = promotion.displayMessage || discountText;

    return (
        <div
            className="py-3 px-4 flex flex-wrap items-center justify-center gap-4 text-center"
            style={{ backgroundColor: promotion.bannerColor, color: promotion.textColor }}
        >
            <div className="flex items-center gap-2">
                <IconComponent className="h-5 w-5" />
                <span className="font-bold text-lg">{promotion.discountType === 'freeGift' ? displayText : discountText}</span>
            </div>
            {promotion.discountType !== 'freeGift' && promotion.displayMessage && (
                <>
                    <span className="hidden sm:inline">•</span>
                    <span className="font-medium">{promotion.displayMessage}</span>
                </>
            )}
            {!promotion.displayMessage && (
                <>
                    <span className="hidden sm:inline">•</span>
                    <span className="font-medium">{promotion.title}</span>
                </>
            )}
            {promotion.code && (
                <>
                    <span className="hidden sm:inline">•</span>
                    <span className="bg-white/20 px-3 py-1 rounded-full font-mono font-bold">
                        Code: {promotion.code}
                    </span>
                </>
            )}
            <span className="hidden sm:inline">•</span>
            <CountdownTimer endDate={promotion.endDate} />
        </div>
    );
}


function ProductCard({ product, promotions }: { product: SanityProduct; promotions: SanityPromotion[] }) {
    const { addToCart, getItemQuantity } = useCart();

    // Get unique sizes and colors from variants
    const sizes = [...new Set(product.variants?.map(v => v.size) || [])];
    const colors = [...new Set(product.variants?.map(v => v.color) || [])];

    const [selectedSize, setSelectedSize] = useState(sizes[0] || "");
    const [selectedColor, setSelectedColor] = useState(colors[0] || "");

    // Find the selected variant
    const selectedVariant = product.variants?.find(
        v => v.size === selectedSize && v.color === selectedColor
    );

    const variantStock = selectedVariant?.stock || 0;
    const isOutOfStock = !selectedVariant || variantStock === 0;
    const currentInCart = selectedVariant ? getItemQuantity(product._id, selectedVariant._key) : 0;
    const remainingStock = variantStock - currentInCart;
    const canAddMore = remainingStock > 0;

    // Get total stock across all variants
    const totalStock = product.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
    const allOutOfStock = totalStock === 0;

    // Check if product has applicable promotion
    const applicablePromo = promotions.find(p =>
        (!p.applicableProducts?.length && !p.applicableCategories?.length) ||
        p.applicableProducts?.includes(product._id) ||
        p.applicableCategories?.includes(product.category)
    );

    const handleAddToCart = () => {
        if (!selectedVariant) {
            toast.error("Please select a size and color");
            return;
        }
        if (isOutOfStock) {
            toast.error(`This variant is out of stock!`);
            return;
        }
        if (!canAddMore) {
            toast.error(`You've already added all available stock to your cart!`);
            return;
        }
        const success = addToCart(
            {
                id: `${product._id}-${selectedSize}-${selectedColor}`,
                productId: product._id,
                variantKey: selectedVariant._key,
                name: product.name,
                price: product.price,
                image: urlFor(product.image).width(400).url(),
                size: selectedSize,
                color: selectedColor,
                colorHex: selectedVariant.colorHex,
                maxStock: variantStock,
            },
            1,
            false
        );
        if (success) {
            toast.success(`${product.name} (${selectedSize}, ${selectedColor}) added to cart!`, {
                duration: 2000,
            });
        } else {
            toast.error(`Cannot add more - only ${variantStock} available!`);
        }
    };

    // Get color hex for selected color
    const getColorHex = (color: string): string => {
        const variant = product.variants?.find(v => v.color === color);
        return variant?.colorHex || "#cccccc";
    };

    return (
        <Card className={`group overflow-hidden border-2 transition-all duration-300 bg-white ${allOutOfStock ? 'opacity-70 border-gray-200' : 'hover:border-amber-500 hover:shadow-xl'}`}>
            {/* Image */}
            <div className="relative aspect-square overflow-hidden">
                <img
                    src={urlFor(product.image).width(400).height(400).url()}
                    alt={product.name}
                    className={`w-full h-full object-cover transition-transform duration-500 ${allOutOfStock ? 'grayscale' : 'group-hover:scale-105'}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {/* Category badge */}
                <span className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    {product.category}
                </span>
                {/* Promo badge */}
                {applicablePromo && !allOutOfStock && (
                    <span
                        className="absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1"
                        style={{ backgroundColor: applicablePromo.bannerColor, color: applicablePromo.textColor }}
                    >
                        <Tag className="h-3 w-3" />
                        {applicablePromo.discountType === 'percentage' ? `${applicablePromo.discountValue}% OFF` : 'PROMO'}
                    </span>
                )}
                {/* Out of stock overlay */}
                {allOutOfStock && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-full">
                            Out of Stock
                        </span>
                    </div>
                )}
                {/* Low stock for selected variant */}
                {!isOutOfStock && !allOutOfStock && variantStock <= 5 && !applicablePromo && (
                    <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                        Only {variantStock} left
                    </span>
                )}
            </div>
            <CardContent className="p-4">
                <h3 className="font-bold text-gray-900 text-base mb-1 truncate">{product.name}</h3>
                <p className="text-sm text-gray-500 mb-3 line-clamp-1">{product.description}</p>

                {/* Color Selector */}
                {colors.length > 0 && (
                    <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-1">Color: <span className="font-medium text-gray-700">{selectedColor}</span></p>
                        <div className="flex flex-wrap gap-2">
                            {colors.map((color) => (
                                <button
                                    key={color}
                                    onClick={() => setSelectedColor(color)}
                                    disabled={allOutOfStock}
                                    title={color}
                                    className={`w-6 h-6 rounded-full border-2 transition-all ${selectedColor === color
                                        ? "ring-2 ring-amber-500 ring-offset-1 border-amber-500"
                                        : "border-gray-300 hover:border-amber-400"
                                        } ${allOutOfStock ? 'cursor-not-allowed opacity-50' : ''}`}
                                    style={{ backgroundColor: getColorHex(color) }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Size Selector */}
                {sizes.length > 0 && (
                    <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-1">Size</p>
                        <div className="flex flex-wrap gap-1">
                            {sizes.map((size) => {
                                // Check if this size/color combo has stock
                                const variant = product.variants?.find(
                                    v => v.size === size && v.color === selectedColor
                                );
                                const hasStock = (variant?.stock || 0) > 0;
                                return (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        disabled={allOutOfStock}
                                        className={`px-2 py-1 text-xs rounded border transition-colors ${selectedSize === size
                                            ? "bg-amber-500 text-white border-amber-500"
                                            : hasStock
                                                ? "border-gray-200 text-gray-600 hover:border-amber-400"
                                                : "border-gray-200 text-gray-400 line-through"
                                            } ${allOutOfStock ? 'cursor-not-allowed opacity-50' : ''}`}
                                    >
                                        {size}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Stock info */}
                {selectedVariant && (
                    <p className="text-xs text-gray-400 mb-2">
                        {isOutOfStock ? 'Out of stock' : `${remainingStock} available`}
                    </p>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-xl font-bold text-amber-600">
                        KSh {product.price.toLocaleString()}
                    </span>
                    <Button
                        size="sm"
                        onClick={handleAddToCart}
                        disabled={isOutOfStock || !canAddMore}
                        className={`rounded-full shadow-md px-4 ${isOutOfStock || !canAddMore
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-amber-500 hover:bg-amber-600 text-white'
                            }`}
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        {isOutOfStock ? 'Sold' : 'Add'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export default function ShopPage() {
    const [activeCategory, setActiveCategory] = useState("All");
    const { totalItems, setIsCartOpen } = useCart();
    const navigate = useNavigate();

    // Fetch from Sanity
    const { data: products, loading: productsLoading } = useProducts();
    const { data: categories, loading: categoriesLoading } = useCategories();
    const { data: promotions } = usePromotions();

    const loading = productsLoading || categoriesLoading;

    // Build category list with "All" at the start
    const categoryNames = ["All", ...categories.map((c) => c.name)];

    // Filter promotions that are active today based on recurrence pattern
    // Only show one promotion per day (the first one)
    const activePromotions = promotions.filter(isPromotionActiveToday).slice(0, 1);

    const filteredProducts =
        activeCategory === "All"
            ? products
            : products.filter((p) => p.category === activeCategory);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Promotions Banner */}
            {activePromotions.length > 0 && (
                <div className="w-full">
                    {activePromotions.map((promo) => (
                        <PromotionBanner key={promo._id} promotion={promo} />
                    ))}
                </div>
            )}

            {/* Header - Single level, white background */}
            <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="flex items-center gap-3 md:gap-6 py-3">
                        {/* Back button - leftmost */}
                        <Link
                            to="/"
                            className="flex items-center gap-1 text-gray-600 hover:text-amber-600 transition-colors shrink-0"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            <span className="hidden sm:inline text-sm font-medium">Home</span>
                        </Link>

                        {/* Logo & Brand */}
                        <div className="flex items-center gap-3 shrink-0">
                            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md bg-white border border-gray-100">
                                <img
                                    src="/logo.png"
                                    alt="LKKINS Elegance Logo"
                                    className="w-full h-full object-contain p-1"
                                    loading="lazy"
                                />
                            </div>
                            <div className="hidden md:block">
                                <h1 className="text-lg font-bold text-gray-900 tracking-tight">
                                    LKKINS <span className="text-amber-500">Shop</span>
                                </h1>
                            </div>
                        </div>

                        {/* Category Filter - in the middle */}
                        <div className="flex-1 overflow-x-auto scrollbar-hide">
                            <div className="flex items-center gap-2">
                                {categoryNames.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => setActiveCategory(category)}
                                        className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeCategory === category
                                            ? "bg-amber-500 text-white shadow-sm"
                                            : "bg-gray-100 text-gray-700 hover:bg-amber-50 hover:text-amber-600"
                                            }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Cart Button */}
                        <Button
                            onClick={() => setIsCartOpen(true)}
                            className="relative bg-amber-500 hover:bg-amber-600 text-white rounded-full px-4 shadow-md font-semibold shrink-0"
                        >
                            <ShoppingCart className="h-5 w-5" />
                            <span className="hidden md:inline ml-2">Cart</span>
                            {totalItems > 0 && (
                                <span className="absolute -top-2 -right-2 bg-white text-amber-600 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md border border-gray-100">
                                    {totalItems}
                                </span>
                            )}
                        </Button>
                    </div>
                </div>
            </header>

            {/* Product Grid */}
            <section className="py-8 flex-grow">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-gray-600">
                            Showing <span className="font-semibold text-gray-900">{filteredProducts.length}</span> products
                        </p>
                        {totalItems > 0 && (
                            <Button
                                variant="outline"
                                onClick={() => navigate("/checkout")}
                                className="border-amber-500 text-amber-600 hover:bg-amber-50"
                            >
                                <ShoppingBag className="h-4 w-4 mr-2" />
                                Checkout ({totalItems} items)
                            </Button>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                            <span className="ml-3 text-gray-600">Loading products...</span>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-gray-500 text-lg">No products found in this category.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredProducts.map((product) => (
                                <ProductCard key={product._id} product={product} promotions={promotions} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Footer */}
            <footer className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden mt-auto">
                {/* Decorative Elements */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500 rounded-full blur-3xl"></div>
                </div>

                <div className="relative container mx-auto px-6 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        {/* Brand Section */}
                        <div>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-2xl bg-white/5 border border-white/10">
                                    <img
                                        src="/logo.png"
                                        alt="LKKINS Elegance Logo"
                                        className="w-full h-full object-contain p-2"
                                        loading="lazy"
                                    />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">
                                        LKKINS ELEGANCE
                                    </h3>
                                    <p className="text-sm text-gray-300">
                                        Premium Corporate Apparel
                                    </p>
                                </div>
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed">
                                Elevating corporate identity through premium branded apparel.
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="text-lg font-bold text-white mb-4">
                                Quick Links
                            </h4>
                            <ul className="space-y-2 text-gray-300 text-sm">
                                <li>
                                    <Link to="/" className="hover:text-amber-400 transition-colors duration-300">
                                        Home
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/shop" className="hover:text-amber-400 transition-colors duration-300">
                                        Shop
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div>
                            <h4 className="text-lg font-bold text-white mb-4">
                                Get In Touch
                            </h4>
                            <ul className="space-y-3 text-gray-300 text-sm">
                                <li className="flex items-start gap-3">
                                    <MapPin className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                                    <span>Baraka Court Mall off Ngong Road, shop FD1.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Mail className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                                    <a
                                        href="mailto:sales@lkkinselegance.com"
                                        className="hover:text-amber-400 transition-colors duration-300"
                                    >
                                        sales@lkkinselegance.com
                                    </a>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Phone className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                                    <span>0796 905661</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Globe className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                                    <span>Available Nationwide</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="pt-6 border-t border-white/20">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
                            <p>
                                © {new Date().getFullYear()} LKKINS Elegance Clothing. All rights reserved.
                            </p>
                            <p className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-amber-400" />
                                Quality Crafted, Professionally Branded
                            </p>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Cart Drawer */}
            <CartDrawer />

            {/* Toast Notifications */}
            <Toaster
                position="bottom-right"
                richColors
                closeButton
                toastOptions={{
                    classNames: {
                        toast:
                            "bg-gradient-to-r from-amber-500 to-orange-500 text-white border border-amber-200/40 shadow-2xl",
                        actionButton: "bg-white text-amber-600",
                        cancelButton: "bg-white/10 text-white",
                    },
                }}
            />
        </div>
    );
}

import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, CheckCircle2, ShoppingBag, Trash2, Minus, Plus, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { usePromotions } from "@/hooks/useSanity";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import emailjs from "@emailjs/browser";
import { updateVariantStock } from "@/lib/sanity";

type CheckoutFormData = {
    name: string;
    phone: string;
    address: string;
    addressDetails: string;
    notes: string;
};

export default function CheckoutPage() {
    const { items, totalPrice, totalItems, updateQuantity, removeFromCart, clearCart } = useCart();
    const { data: promotions } = usePromotions();
    const navigate = useNavigate();
    const [form, setForm] = useState<CheckoutFormData>({
        name: "",
        phone: "",
        address: "",
        addressDetails: "",
        notes: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [mapsLoaded, setMapsLoaded] = useState(false);
    const mapRef = useRef<HTMLDivElement>(null);
    const autocompleteInputRef = useRef<HTMLInputElement>(null);
    const mapInstanceRef = useRef<google.maps.Map | null>(null);
    const markerRef = useRef<google.maps.Marker | null>(null);

    const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || "";
    const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "";
    const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "";
    const RECIPIENT_EMAIL = import.meta.env.VITE_RECIPIENT_EMAIL || "LKKINSElegance@gmail.com";
    const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

    useEffect(() => {
        if (items.length === 0) {
            navigate("/shop");
            return;
        }

        // Load Google Maps script
        if (!window.google && GOOGLE_MAPS_API_KEY) {
            const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
            if (!existingScript) {
                const script = document.createElement("script");
                script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`;
                script.async = true;
                script.defer = true;

                (window as unknown as { initMap: () => void }).initMap = () => {
                    setMapsLoaded(true);
                };

                document.head.appendChild(script);
            }
        } else if (window.google) {
            setMapsLoaded(true);
        }
    }, [items.length, navigate, GOOGLE_MAPS_API_KEY]);

    useEffect(() => {
        if (mapsLoaded && mapRef.current) {
            initializeMap();
        }
    }, [mapsLoaded]);

    const initializeMap = () => {
        if (!mapRef.current || !window.google) return;

        const defaultCenter = { lat: -1.2921, lng: 36.8219 };

        const map = new window.google.maps.Map(mapRef.current, {
            center: defaultCenter,
            zoom: 13,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            zoomControl: true,
            styles: [
                { featureType: "poi", stylers: [{ visibility: "off" }] },
                { featureType: "transit", stylers: [{ visibility: "off" }] },
            ],
        });
        mapInstanceRef.current = map;

        const marker = new window.google.maps.Marker({
            map,
            draggable: true,
            animation: window.google.maps.Animation.DROP,
            position: defaultCenter,
        });
        markerRef.current = marker;

        if (autocompleteInputRef.current) {
            const autocomplete = new window.google.maps.places.Autocomplete(autocompleteInputRef.current, {
                componentRestrictions: { country: "ke" },
                fields: ["formatted_address", "geometry", "name"],
            });

            autocomplete.addListener("place_changed", () => {
                const place = autocomplete.getPlace();
                if (place.geometry?.location) {
                    const location = place.geometry.location;
                    map.setCenter(location);
                    map.setZoom(16);
                    marker.setPosition(location);
                    marker.setVisible(true);
                    setForm((prev) => ({
                        ...prev,
                        address: place.formatted_address || place.name || "",
                    }));
                }
            });
        }

        marker.addListener("dragend", () => {
            const position = marker.getPosition();
            if (position) {
                geocodePosition(position);
            }
        });

        map.addListener("click", (e: google.maps.MapMouseEvent) => {
            if (e.latLng) {
                marker.setPosition(e.latLng);
                marker.setVisible(true);
                geocodePosition(e.latLng);
            }
        });
    };

    const geocodePosition = (position: google.maps.LatLng) => {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode(
            { location: position },
            (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
                if (status === "OK" && results?.[0]) {
                    setForm((prev) => ({ ...prev, address: results[0].formatted_address }));
                    if (autocompleteInputRef.current) {
                        autocompleteInputRef.current.value = results[0].formatted_address;
                    }
                }
            }
        );
    };

    // Format promotions for order message
    const formatPromotions = (): string => {
        if (promotions.length === 0) return "None";
        return promotions.map(p => {
            let discount = '';
            switch (p.discountType) {
                case 'percentage':
                    discount = `${p.discountValue}% OFF`;
                    break;
                case 'fixed':
                    discount = `KSh ${p.discountValue} OFF`;
                    break;
                case 'freeGift':
                    discount = `Free Gift: ${p.giftDescription || 'Special item'}`;
                    if (p.minimumSpend) {
                        discount += ` (min spend: KSh ${p.minimumSpend.toLocaleString()})`;
                    }
                    break;
                default:
                    discount = p.discountType?.toUpperCase() || 'SPECIAL';
            }

            const message = p.displayMessage ? ` - ${p.displayMessage}` : '';
            return `🏷️ ${p.title} (${discount})${p.code ? ` - Code: ${p.code}` : ''}${message} - Ends: ${new Date(p.endDate).toLocaleDateString()}`;
        }).join("\n");
    };

    const formatOrderItems = () => {
        return items
            .map(
                (item) =>
                    `• ${item.name} (${item.size}, ${item.color}) x${item.quantity} - KSh ${(item.price * item.quantity).toLocaleString()}`
            )
            .join("\n");
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
            toast.error("Please fill in all required fields (Name, Phone, and Address).");
            return;
        }

        if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
            toast.error("Email service is not configured.");
            return;
        }

        setIsLoading(true);
        try {
            const orderMessage = `
📦 NEW INDIVIDUAL ORDER

Order Items:
${formatOrderItems()}

📊 Order Total: KSh ${totalPrice.toLocaleString()}

📍 Delivery Address:
${form.address}
${form.addressDetails ? `\nBuilding/Landmark: ${form.addressDetails}` : ""}

📞 Phone: ${form.phone}

🏷️ Active Promotions at Time of Order:
${formatPromotions()}

📝 Additional Notes:
${form.notes || "None"}
      `.trim();

            const templateParams = {
                from_name: form.name,
                from_email: "order@lkkinselegance.com",
                phone: form.phone,
                company: "Individual Order",
                message: orderMessage,
                to_email: RECIPIENT_EMAIL,
            };

            await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY);

            // Update stock in Sanity for each variant
            for (const item of items) {
                await updateVariantStock(item.productId, item.variantKey, item.quantity);
            }

            toast.success("Order placed successfully! We'll contact you shortly.");
            clearCart();
            navigate("/");
        } catch (err) {
            console.error("Order error:", err);
            toast.error("Failed to place order. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    const handleQuantityIncrement = (itemId: string, currentQuantity: number, maxStock: number) => {
        if (currentQuantity >= maxStock) {
            toast.error(`Cannot add more - only ${maxStock} available!`);
            return;
        }
        updateQuantity(itemId, currentQuantity + 1);
    };

    if (items.length === 0) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header - White background matching site theme */}
            <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-screen-2xl mx-auto px-4 md:px-6">
                    <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-4">
                            <Link
                                to="/shop"
                                className="flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5" />
                                <span className="hidden sm:inline text-sm font-medium">Back to Shop</span>
                            </Link>
                            <div className="h-6 w-px bg-gray-200" />
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md bg-white border border-gray-100">
                                    <img
                                        src="/logo.png"
                                        alt="LKKINS Elegance"
                                        className="w-full h-full object-contain p-1"
                                    />
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-gray-900">Checkout</h1>
                                    <p className="text-xs text-gray-500">{totalItems} items • KSh {totalPrice.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                        {/* Active Promotion Badge */}
                        {promotions.length > 0 && (
                            <div
                                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
                                style={{ backgroundColor: promotions[0].bannerColor, color: promotions[0].textColor }}
                            >
                                <Tag className="h-4 w-4" />
                                <span>{promotions[0].title}</span>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 max-w-screen-2xl mx-auto w-full px-4 md:px-6 py-6">
                <form onSubmit={handleSubmit} className="h-full">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">

                        {/* Left: Order Summary */}
                        <div className="lg:col-span-3">
                            <Card className="border border-gray-200 shadow-sm h-full">
                                <CardContent className="p-5">
                                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <ShoppingBag className="h-5 w-5 text-amber-500" />
                                        Order Summary
                                    </h2>
                                    <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                                        {items.map((item) => (
                                            <div key={item.id} className="flex gap-3 p-2 bg-gray-50 rounded-lg">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-14 h-14 object-cover rounded-lg"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-medium text-gray-900 text-sm truncate">{item.name}</h3>
                                                    <p className="text-xs text-gray-500">
                                                        {item.size} •
                                                        <span
                                                            className="inline-block w-2 h-2 rounded-full mx-1"
                                                            style={{ backgroundColor: item.colorHex || '#ccc' }}
                                                        />
                                                        {item.color}
                                                    </p>
                                                    <p className="text-amber-600 font-bold text-sm">KSh {item.price.toLocaleString()}</p>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            className="p-1 rounded bg-gray-200 hover:bg-gray-300"
                                                        >
                                                            <Minus className="h-3 w-3" />
                                                        </button>
                                                        <span className="text-sm font-medium w-5 text-center">{item.quantity}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleQuantityIncrement(item.id, item.quantity, item.maxStock)}
                                                            className="p-1 rounded bg-gray-200 hover:bg-gray-300"
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFromCart(item.id)}
                                                            className="p-1 ml-auto text-red-500 hover:bg-red-50 rounded"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-t pt-4 mt-4">
                                        <div className="flex justify-between text-lg font-bold">
                                            <span>Total</span>
                                            <span className="text-amber-600">KSh {totalPrice.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Center: Contact & Notes */}
                        <div className="lg:col-span-4 space-y-4">
                            {/* Contact Information */}
                            <Card className="border border-gray-200 shadow-sm">
                                <CardContent className="p-5">
                                    <h2 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h2>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-semibold mb-1 text-gray-900">
                                                Full Name <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                value={form.name}
                                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                                placeholder="John Doe"
                                                className="h-11 border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold mb-1 text-gray-900">
                                                Phone Number <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                type="tel"
                                                value={form.phone}
                                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                                placeholder="+254 712 345 678"
                                                className="h-11 border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Additional Notes */}
                            <Card className="border border-gray-200 shadow-sm">
                                <CardContent className="p-5">
                                    <h2 className="text-lg font-bold text-gray-900 mb-3">Additional Notes</h2>
                                    <Textarea
                                        value={form.notes}
                                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                        placeholder="Any special delivery instructions or requests..."
                                        rows={3}
                                        className="resize-none border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                                    />
                                </CardContent>
                            </Card>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-amber-500 hover:bg-amber-600 text-white h-14 text-lg font-bold rounded-full shadow-lg"
                            >
                                {isLoading ? (
                                    "Placing Order..."
                                ) : (
                                    <>
                                        <CheckCircle2 className="mr-2 h-5 w-5" />
                                        Place Order • KSh {totalPrice.toLocaleString()}
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Right: Delivery Address with Map */}
                        <div className="lg:col-span-5">
                            <Card className="border border-gray-200 shadow-sm h-full">
                                <CardContent className="p-5 h-full flex flex-col">
                                    <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-amber-500" />
                                        Delivery Address <span className="text-red-500">*</span>
                                    </h2>
                                    <p className="text-gray-500 text-sm mb-3">
                                        Search for your location or click on the map
                                    </p>

                                    {/* Address Search */}
                                    <div className="mb-3">
                                        <Input
                                            ref={autocompleteInputRef}
                                            placeholder="Start typing your address..."
                                            className="h-11 border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                                        />
                                    </div>

                                    {/* Map */}
                                    <div className="flex-1 min-h-[300px]">
                                        {GOOGLE_MAPS_API_KEY ? (
                                            <div
                                                ref={mapRef}
                                                className="w-full h-full rounded-xl border border-gray-200"
                                                style={{ minHeight: "300px" }}
                                            />
                                        ) : (
                                            <div className="w-full h-full rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                                                <div className="text-center text-gray-500">
                                                    <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                    <p className="text-sm">Google Maps not configured</p>
                                                    <p className="text-xs">Enter your address manually below</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Selected Address Display */}
                                    {form.address && (
                                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl mt-3">
                                            <p className="text-sm font-semibold text-amber-800">Selected Address:</p>
                                            <p className="text-amber-700 text-sm">{form.address}</p>
                                        </div>
                                    )}

                                    {/* Manual Address Input (fallback) */}
                                    {!GOOGLE_MAPS_API_KEY && (
                                        <div className="mt-3">
                                            <Textarea
                                                value={form.address}
                                                onChange={(e) => setForm({ ...form, address: e.target.value })}
                                                placeholder="Enter your complete delivery address..."
                                                rows={2}
                                                className="border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                                            />
                                        </div>
                                    )}

                                    {/* Additional Address Details */}
                                    <div className="mt-3">
                                        <label className="block text-sm font-semibold mb-1 text-gray-900">
                                            Building / Landmark (Optional)
                                        </label>
                                        <Input
                                            value={form.addressDetails}
                                            onChange={(e) => setForm({ ...form, addressDetails: e.target.value })}
                                            placeholder="e.g., Apartment 5B, Near Uchumi"
                                            className="h-11 border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>

            {/* Toast Notifications */}
            <Toaster
                position="top-center"
                richColors
                closeButton
            />
        </div>
    );
}

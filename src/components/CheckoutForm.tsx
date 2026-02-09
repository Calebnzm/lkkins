import { useState } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import emailjs from "@emailjs/browser";

type CheckoutFormData = {
    name: string;
    email: string;
    phone: string;
    address: string;
    notes: string;
};

export function CheckoutForm({ onBack }: { onBack: () => void }) {
    const { items, totalPrice, clearCart, setIsCartOpen } = useCart();
    const [form, setForm] = useState<CheckoutFormData>({
        name: "",
        email: "",
        phone: "",
        address: "",
        notes: "",
    });
    const [isLoading, setIsLoading] = useState(false);

    const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || "";
    const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "";
    const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "";
    const RECIPIENT_EMAIL = import.meta.env.VITE_RECIPIENT_EMAIL || "LKKINSElegance@gmail.com";

    const formatOrderItems = () => {
        return items
            .map(
                (item) =>
                    `• ${item.name}${item.size ? ` (Size: ${item.size})` : ""} x${item.quantity} - KSh ${(item.price * item.quantity).toLocaleString()}`
            )
            .join("\n");
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.address.trim()) {
            toast.error("Please fill in all required fields.");
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

📝 Additional Notes:
${form.notes || "None"}
      `.trim();

            const templateParams = {
                from_name: form.name,
                from_email: form.email,
                phone: form.phone,
                company: "Individual Order",
                message: orderMessage,
                to_email: RECIPIENT_EMAIL,
            };

            await emailjs.send(
                EMAILJS_SERVICE_ID,
                EMAILJS_TEMPLATE_ID,
                templateParams,
                EMAILJS_PUBLIC_KEY
            );

            toast.success("Order placed successfully! We'll contact you shortly.");
            clearCart();
            setIsCartOpen(false);
        } catch (err) {
            console.error("EmailJS error:", err);
            toast.error("Failed to place order. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
                >
                    <ArrowLeft className="h-5 w-5" />
                    Back to Cart
                </button>
                <h2 className="text-xl font-bold text-gray-900">Checkout</h2>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto p-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Order Summary */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                        <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
                        <div className="space-y-2 text-sm">
                            {items.map((item) => (
                                <div key={item.id} className="flex justify-between">
                                    <span className="text-gray-600">
                                        {item.name} {item.size && `(${item.size})`} x{item.quantity}
                                    </span>
                                    <span className="font-medium">KSh {(item.price * item.quantity).toLocaleString()}</span>
                                </div>
                            ))}
                            <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                                <span>Total</span>
                                <span className="text-amber-600">KSh {totalPrice.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-900">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="John Doe"
                            className="h-12 border-2 focus:border-amber-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-900">
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <Input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            placeholder="john@example.com"
                            className="h-12 border-2 focus:border-amber-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-900">
                            Phone Number <span className="text-red-500">*</span>
                        </label>
                        <Input
                            type="tel"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            placeholder="+254 712 345 678"
                            className="h-12 border-2 focus:border-amber-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-900">
                            Delivery Address <span className="text-red-500">*</span>
                        </label>
                        <Textarea
                            value={form.address}
                            onChange={(e) => setForm({ ...form, address: e.target.value })}
                            placeholder="Enter your full delivery address..."
                            rows={3}
                            className="resize-none border-2 focus:border-amber-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-900">
                            Additional Notes
                        </label>
                        <Textarea
                            value={form.notes}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            placeholder="Any special instructions..."
                            rows={2}
                            className="resize-none border-2 focus:border-amber-500"
                        />
                    </div>

                    <div className="pt-4">
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-amber-500 hover:bg-amber-600 text-white h-12 text-lg font-semibold rounded-full shadow-lg"
                        >
                            {isLoading ? (
                                "Placing Order..."
                            ) : (
                                <>
                                    <CheckCircle2 className="mr-2 h-5 w-5" />
                                    Place Order - KSh {totalPrice.toLocaleString()}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

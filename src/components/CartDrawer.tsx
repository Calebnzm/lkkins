import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

export function CartDrawer() {
    const { items, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, totalPrice, totalItems } = useCart();
    const navigate = useNavigate();

    if (!isCartOpen) return null;

    const handleCheckout = () => {
        setIsCartOpen(false);
        navigate("/checkout");
    };

    const handleIncrement = (itemId: string, currentQuantity: number, itemName: string, maxStock: number) => {
        if (currentQuantity >= maxStock) {
            toast.error(`Cannot add more ${itemName} - only ${maxStock} available!`);
            return;
        }
        const success = updateQuantity(itemId, currentQuantity + 1);
        if (!success) {
            toast.error(`Cannot add more ${itemName} - stock limit reached!`);
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 transition-opacity"
                onClick={() => setIsCartOpen(false)}
            />

            {/* Drawer */}
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
                {/* Header - White background matching site theme */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                            <ShoppingBag className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Your Cart</h2>
                            <p className="text-sm text-gray-500">{totalItems} items</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsCartOpen(false)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="h-6 w-6 text-gray-600" />
                    </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <ShoppingBag className="h-16 w-16 mb-4 opacity-50" />
                            <p className="text-lg font-medium">Your cart is empty</p>
                            <p className="text-sm">Add some items to get started!</p>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div
                                key={item.id}
                                className="flex gap-4 p-3 bg-white rounded-xl border border-gray-200 shadow-sm"
                            >
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-20 h-20 object-cover rounded-lg"
                                />
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                                        <span>{item.size}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            {item.colorHex && (
                                                <span
                                                    className="w-3 h-3 rounded-full inline-block border border-gray-300"
                                                    style={{ backgroundColor: item.colorHex }}
                                                />
                                            )}
                                            {item.color}
                                        </span>
                                    </div>
                                    <p className="text-amber-600 font-bold mt-1">KSh {item.price.toLocaleString()}</p>

                                    {/* Quantity Controls */}
                                    <div className="flex items-center gap-2 mt-2">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                                        >
                                            <Minus className="h-3 w-3 text-gray-600" />
                                        </button>
                                        <span className="w-8 text-center font-semibold text-gray-900">{item.quantity}</span>
                                        <button
                                            onClick={() => handleIncrement(item.id, item.quantity, item.name, item.maxStock)}
                                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                                        >
                                            <Plus className="h-3 w-3 text-gray-600" />
                                        </button>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="p-1.5 ml-auto rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="border-t border-gray-200 p-4 bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-gray-600 font-medium">Subtotal</span>
                            <span className="text-2xl font-bold text-gray-900">
                                KSh {totalPrice.toLocaleString()}
                            </span>
                        </div>
                        <Button
                            onClick={handleCheckout}
                            className="w-full bg-amber-500 hover:bg-amber-600 text-white h-12 text-lg font-semibold rounded-full shadow-lg"
                        >
                            Proceed to Checkout
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                )}
            </div>
        </>
    );
}

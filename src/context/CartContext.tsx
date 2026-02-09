import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type CartItem = {
    id: string;           // Unique: productId-size-color
    productId: string;    // The Sanity document _id
    variantKey: string;   // The _key of the variant in Sanity
    name: string;
    price: number;
    image: string;
    quantity: number;
    size: string;
    color: string;
    colorHex?: string;
    maxStock: number;     // Maximum available stock for this variant
};

type CartContextType = {
    items: CartItem[];
    addToCart: (item: Omit<CartItem, "quantity">, quantity?: number, openCart?: boolean) => boolean;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => boolean;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
    isCartOpen: boolean;
    setIsCartOpen: (open: boolean) => void;
    getItemQuantity: (productId: string, variantKey: string) => number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "lkkins-cart";

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem(CART_STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        }
        return [];
    });
    const [isCartOpen, setIsCartOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }, [items]);

    // Get quantity in cart for a specific variant
    const getItemQuantity = (productId: string, variantKey: string): number => {
        const item = items.find((i) => i.productId === productId && i.variantKey === variantKey);
        return item?.quantity || 0;
    };

    const addToCart = (item: Omit<CartItem, "quantity">, quantity = 1, openCart = true): boolean => {
        // Check if adding would exceed stock for this variant
        const currentQty = getItemQuantity(item.productId, item.variantKey);
        if (currentQty + quantity > item.maxStock) {
            return false; // Can't add - would exceed stock
        }

        setItems((prev) => {
            const existing = prev.find((i) => i.id === item.id);
            if (existing) {
                return prev.map((i) =>
                    i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
                );
            }
            return [...prev, { ...item, quantity }];
        });
        if (openCart) {
            setIsCartOpen(true);
        }
        return true; // Successfully added
    };

    const removeFromCart = (id: string) => {
        setItems((prev) => prev.filter((i) => i.id !== id));
    };

    const updateQuantity = (id: string, quantity: number): boolean => {
        if (quantity < 1) {
            removeFromCart(id);
            return true;
        }

        const item = items.find((i) => i.id === id);
        if (!item) return false;

        // Check if new quantity would exceed stock for this variant
        if (quantity > item.maxStock) {
            return false; // Can't update - would exceed stock
        }

        setItems((prev) =>
            prev.map((i) => (i.id === id ? { ...i, quantity } : i))
        );
        return true;
    };

    const clearCart = () => {
        setItems([]);
        setIsCartOpen(false);
    };

    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
    const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                totalItems,
                totalPrice,
                isCartOpen,
                setIsCartOpen,
                getItemQuantity,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}

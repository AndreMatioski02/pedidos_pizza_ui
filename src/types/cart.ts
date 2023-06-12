export interface ProductType {
    id: string;
    name: string;
    brand: string;
    price: number;
    expiration_date: string;
    description: string;
}

export interface CartType {
    id: string;
    userId: string;
    createdAt: string;
    updatedAt?: string;
    status: "P" | "B" | "E";
    total_value: number;
}

export interface CartProductType {
    product_id: string;
    product_value: number;
    quantity: number;
    created_at: string;
    shopping_cart_id: string;
    total_value: number;
}
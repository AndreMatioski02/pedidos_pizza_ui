export interface UserType {
    id: number;
    client_id: number;
    username: string;
    password: string;
    last_access_at: string | Date;
}

export interface OrderType {
    id: number;
    client_id: number;
    created_at: string | Date;
    updated_at: string | Date;
    total_value: number;
}

export interface ClientType {
    id: number;
    name: string;
    cpf: string;
    email: string;
    address_cep: string;
    address: string;
    address_number?: number;
    district: string;
    city: string;
    uf: string;
    phone_number: string;
}

export interface ProductType {
    id: number;
    name: string;
    description: string;
    price: number;
}

export interface OrderProductType {
    order_id: number;
    product_id: number;
    quantity: number;
    unit_price: number;
}
import { defineStore } from 'pinia'

// Interfaces based on aadab-app models (matching API JSON snake_case)
export interface Product {
    id: number;
    name: string;
    description?: string;
    small_description?: string;
    description_1?: string;
    description_2?: string;
    imagepath1?: string;
    imagepath2?: string;
    imagepath3?: string;
    imagepath4?: string;
    price?: number; // Sometimes on root level?
    offer_price?: number;
    rating?: string;
    total_reviews?: number;
    product_prices?: ProductPrice[];
    tags?: Tag[];
    category?: { name: string };
    product_images?: Array<{
        id: number;
        imagepath: string;
        imagepath2?: string;
        imagepath3?: string;
        imagepath4?: string;
        unit?: { name: string };
    }>;
    product_packs?: Array<{
        id: number;
        value: string;
        unit?: { name: string };
        price?: number;
        qty?: number;
    }>;
}

export interface ProductPrice {
    id: number;
    product_id: number;
    price: number;
    offer_price?: number;
    distributor_price?: number;
    distributor_offer_price?: number;
    pack?: string; // from product_pack?
    unit?: {
        name: string;
    };
    product_pack?: {
        value: string;
    };
}

export interface Category {
    id: number;
    name: string;
    imagepath?: string;
}

export interface Tag {
    id: number;
    name: string;
    products?: Product[];
}

interface ProductState {
    products: Product[];
    categories: Category[];
    banners: Record<string, string>;
    randomProducts: Product[];
    categoryWiseProducts: Product[];
    tags: Tag[];
    loading: boolean;
}

export const useProductStore = defineStore('product', {
    state: (): ProductState => ({
        products: [],
        categories: [],
        banners: {},
        randomProducts: [],
        categoryWiseProducts: [],
        tags: [],
        loading: false,
    }),

    getters: {
        newArrivals: (state) => state.products || [],
    },

    actions: {
        async fetchCategories() {
            const api = useApi();
            try {
                // Return type is Category[] because T maps to data field in useApi
                const response = await api.get<Category[]>('/categories?cityId=1');
                if (response.success && response.data) {
                    this.categories = response.data;
                }
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        },

        async fetchBanners() {
            const api = useApi();
            try {
                const response = await api.get<Record<string, string>>('/settings/1');
                if (response.success && response.data) {
                    this.banners = response.data;
                }
            } catch (error) {
                console.error('Failed to fetch banners:', error);
            }
        },

        async fetchNewArrivals() {
            const api = useApi();
            try {
                const response = await api.get<Product[]>('/products?newArrivals=true');
                if (response.success && response.data) {
                    this.products = response.data;
                }
            } catch (error) {
                console.error('Failed to fetch new arrivals:', error);
            }
        },
        
        async fetchRandomProducts() {
             const api = useApi();
            try {
                const response = await api.get<Product[]>('/random_products');
                if (response.success && response.data) {
                   this.randomProducts = response.data;
                }
            } catch (error) {
                console.error('Failed to fetch random products:', error);
            }
        },

        async fetchCategoryWiseProducts(categoryId: number, productId: number) {
            const api = useApi();
            try {
                // Determine endpoint based on mobile app analysis
                // Mobile uses: /category-wise-product
                const response = await api.post<Product[]>('/category-wise-product', {
                    category_id: categoryId,
                    product_id: productId
                });
                if (response.success && response.data) {
                    this.categoryWiseProducts = response.data;
                }
            } catch (error) {
                console.error('Failed to fetch related products:', error);
            }
        },

        async storeNotification(payload: { product_id: number, product_pack_id: number, qty: number }) {
             const api = useApi();
             try {
                 const response = await api.post('/product_notifications', payload);
                 return response.success;
             } catch (error) {
                 console.error('Failed to store notification:', error);
                 return false;
             }
        },

        // Helper to get product price based on role
        getPrice(product: Product, isDistributor: boolean): { price: number, originalPrice: number, discount: number } {
            if (!product.product_prices || product.product_prices.length === 0) {
                return { price: 0, originalPrice: 0, discount: 0 };
            }

            const priceObj = product.product_prices[0];
            if (!priceObj) {
                return { price: 0, originalPrice: 0, discount: 0 };
            }
            let price = priceObj.price;
            let offerPrice = priceObj.offer_price;

            if (isDistributor) {
                price = priceObj.distributor_price || price;
                offerPrice = priceObj.distributor_offer_price || offerPrice;
            }

            // If no offer price or offer price is higher (invalid), use normal price
            const activePrice = (offerPrice && offerPrice < price) ? offerPrice : price;
            const originalPrice = price; // The "crossed out" price

             // Calculate discount percentage
            let discount = 0;
            if (originalPrice > activePrice) {
                discount = Math.round(((originalPrice - activePrice) / originalPrice) * 100);
            }

            return {
                price: activePrice,
                originalPrice: originalPrice,
                discount
            };
        },

        async fetchProduct(id: number | string) {
            const api = useApi();
            this.loading = true;
            try {
                // Endpoint assumed to be /products/{id}
                const response = await api.get<Product>(`/products/${id}`);
                this.loading = false;
                if (response.success && response.data) {
                    return response.data;
                }
                return null;
            } catch (error) {
                console.error(`Failed to fetch product ${id}:`, error);
                this.loading = false;
                return null;
            }
        }
    }
})

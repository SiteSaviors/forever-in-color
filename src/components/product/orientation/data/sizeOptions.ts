
import { SizeOption } from "../types";

export const sizeOptions: Record<string, SizeOption[]> = {
  horizontal: [
    { size: '16" x 12"', category: 'XS', description: 'Great for desks or shelves', salePrice: 99.99, originalPrice: 149.99, popular: false },
    { size: '24" x 18"', category: 'S', description: 'Nice fit for entryways or nooks', salePrice: 149.99, originalPrice: 199.99, popular: true },
    { size: '36" x 24"', category: 'M', description: 'Perfect for bedrooms or offices', salePrice: 199.99, originalPrice: 249.99, popular: false },
    { size: '40" x 30"', category: 'L', description: 'Bold accent for any room', salePrice: 269.99, originalPrice: 319.99, popular: false },
    { size: '48" x 32"', category: 'XL', description: 'Ideal for living rooms or large walls', salePrice: 349.99, originalPrice: 399.99, popular: false },
    { size: '60" x 40"', category: 'XXL', description: 'Gallery-size showstopper', salePrice: 499.99, originalPrice: 549.99, popular: false }
  ],
  vertical: [
    { size: '12" x 16"', category: 'XS', description: 'Great for desks or shelves', salePrice: 99.99, originalPrice: 149.99, popular: false },
    { size: '18" x 24"', category: 'S', description: 'Nice fit for entryways or nooks', salePrice: 149.99, originalPrice: 199.99, popular: true },
    { size: '24" x 36"', category: 'M', description: 'Perfect for bedrooms or offices', salePrice: 199.99, originalPrice: 249.99, popular: false },
    { size: '30" x 40"', category: 'L', description: 'Bold accent for any room', salePrice: 269.99, originalPrice: 319.99, popular: false },
    { size: '32" x 48"', category: 'XL', description: 'Ideal for living rooms or large walls', salePrice: 349.99, originalPrice: 399.99, popular: false },
    { size: '40" x 60"', category: 'XXL', description: 'Gallery-size showstopper', salePrice: 499.99, originalPrice: 549.99, popular: false }
  ],
  square: [
    { size: '16" x 16"', category: 'XS', description: 'Great for desks or shelves', salePrice: 99.99, originalPrice: 149.99, popular: false },
    { size: '24" x 24"', category: 'S', description: 'Nice fit for entryways or nooks', salePrice: 149.99, originalPrice: 199.99, popular: true },
    { size: '32" x 32"', category: 'M', description: 'Perfect for bedrooms or offices', salePrice: 199.99, originalPrice: 249.99, popular: false },
    { size: '36" x 36"', category: 'L', description: 'Bold accent for any room', salePrice: 269.99, originalPrice: 319.99, popular: false }
  ]
};

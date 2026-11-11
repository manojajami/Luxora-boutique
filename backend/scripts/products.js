export const slug = n => n.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const S = ['XS', 'S', 'M', 'L', 'XL'];
const productImages = {
  'Linen Co-ord Set': ['/assets/products/co-ord-sets/javier-gonzalez-fotografo-htJdRN92BGU-unsplash.jpg'],
  'Satin Wrap Dress': ['/assets/products/dresses/egor-komarov-qn0qN-CwDsU-unsplash.jpg'],
  'Tailored Vest Set': ['/assets/products/co-ord-sets/alexander-mass-g0nkavDMF6g-unsplash.jpg'],
  'Elegant Midi Dress': ['/assets/products/dresses/istockphoto-993285908-1024x1024.jpg'],
  'Classic Cotton Shirt': ['/assets/products/shirts/lisanto-ve2dwNxZ5Rg-unsplash.jpg'],
  'Premium Wide-Leg Trousers': ['/assets/products/bottoms/laura-oliveira-moEtNGG8tM4-unsplash.jpg'],
  'Casual Summer Dress': ['/assets/products/outerwear/khaled-ghareeb-thv8xuumdm4-unsplash.jpg'],
  'Designer Handbag': ['/assets/products/bags/james-ree-ZmeFtu11Hpc-unsplash.jpg'],
  'Ribbed Knit Top': ['/assets/products/tops/murat-_k_uEf2xVF0-unsplash.jpg'],
  'Pleated Midi Skirt': ['/assets/products/dresses/vicky-cheng-4mLKBKMPoHo-unsplash.jpg'],
  'Silk Scarf': ['/assets/products/outerwear/kimiya-oveisi-9iUIZd-9SAA-unsplash.jpg'],
  'Leather Belt': ['/assets/products/bags/seeetz-eNEa7Gsfzzs-unsplash.jpg'],
  'Beige Blazer': ['/assets/products/tops/istockphoto-2169884151-1024x1024.jpg'],
  'Floral Maxi Dress': ['/assets/products/outerwear/podmatch-oVdik9GKHDI-unsplash.jpg'],
  'Gold Hoop Earrings': ['/assets/products/accessories/nataliya-melnychuk-5ngCICAXiH0-unsplash.jpg'],
  'Classic Tote Bag': ['/assets/products/bags/urban-minimals-z_iNMJYxCBs-unsplash.jpg'],
};

const P = (name, category, price, discountPrice, colors, f = 0, n = 0) => ({
  name, category, price, discountPrice, colors,
  sizes: category === 'Accessories' ? ['One Size'] : S,
  description: `${name}: timeless luxury, crafted from premium fabric for everyday elegance.`,
  stock: 25, featured: !!f, newArrival: !!n,
  sku: 'LX-' + slug(name).toUpperCase().slice(0, 12),
  images: productImages[name] || [`/assets/products/${slug(name)}.jpg`],
});

export default [
  P('Linen Co-ord Set', 'Sets', 2999, 2499, ['#d8c3a5', '#6b6b3a', '#222222'], 1, 1),
  P('Satin Wrap Dress', 'Dresses', 2599, 2199, ['#6b2d2d', '#d8c3a5', '#111111'], 1, 1),
  P('Tailored Vest Set', 'Sets', 1899, 0, ['#efe6d8', '#b89b7a', '#111111'], 1),
  P('Elegant Midi Dress', 'Dresses', 2799, 0, ['#111111', '#6b2d2d', '#b89b7a'], 1, 1),
  P('Classic Cotton Shirt', 'Clothing', 1299, 0, ['#ffffff', '#d8c3a5']),
  P('Premium Wide-Leg Trousers', 'Clothing', 1799, 0, ['#d8c3a5', '#111111']),
  P('Casual Summer Dress', 'Dresses', 1999, 1599, ['#e9d5b5', '#7a8f6b']),
  P('Designer Handbag', 'Accessories', 2999, 0, ['#6b3f2a', '#111111'], 0, 1),
  P('Ribbed Knit Top', 'Clothing', 999, 0, ['#efe6d8', '#6b3f2a', '#111111'], 0, 1),
  P('Pleated Midi Skirt', 'Clothing', 1499, 0, ['#b89b7a', '#111111']),
  P('Silk Scarf', 'Accessories', 799, 599, ['#6b2d2d', '#d8c3a5']),
  P('Leather Belt', 'Accessories', 899, 0, ['#6b3f2a', '#111111']),
  P('Beige Blazer', 'Clothing', 3499, 2999, ['#d8c3a5', '#efe6d8'], 1),
  P('Floral Maxi Dress', 'Dresses', 2399, 0, ['#c9a89a', '#7a8f6b']),
  P('Gold Hoop Earrings', 'Accessories', 699, 0, ['#c9a24a']),
  P('Classic Tote Bag', 'Accessories', 2599, 2199, ['#d8c3a5', '#111111'], 0, 1),
];

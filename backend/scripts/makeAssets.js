// Generates placeholder SVG images. Replace them with real photos (same filenames or update products.js).
import fs from 'fs';
import products, { slug } from './products.js';
const dir = '../frontend/public/assets/';
const svg = (t, c1, c2, w, h) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><text x="50%" y="50%" fill="#fff" fill-opacity=".85" font-family="Georgia,serif" font-size="${w / 14}" text-anchor="middle">${t}</text></svg>`;
products.forEach(p => fs.writeFileSync(`${dir}products/${slug(p.name)}.svg`, svg(p.name, p.colors[0], '#3b2a22', 600, 800)));
fs.writeFileSync(dir + 'hero/hero-fashion-banner.svg', svg('LUXORA', '#efe6d8', '#6b4a3a', 1400, 800));
fs.writeFileSync(dir + 'banners/collection-banner.svg', svg('YOUR STYLE. YOUR STORY.', '#1a1411', '#6b4a3a', 1400, 500));

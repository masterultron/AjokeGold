export interface Product {
  id: string;
  name: string;
  description: string;
  category: "Necklaces" | "Rings" | "Earrings" | "Bracelets" | "Sets";
  image: string;
  basePrice: number;
}

export const products: Product[] = [
  {
    id: "p1",
    name: "Gold Halo Ring",
    description: "An exquisite 18k gold halo ring designed to capture light from every angle. A testament to eternal beauty.",
    category: "Rings",
    image: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&q=80&w=800",
    basePrice: 4500,
  },
  {
    id: "p2",
    name: "Aura Diamond Necklace",
    description: "A cascade of brilliance featuring ethically sourced diamonds set in pure white gold. A breathtaking centerpiece for any evening gown.",
    category: "Necklaces",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800",
    basePrice: 12000,
  },
  {
    id: "p3",
    name: "Diamond Tennis Bracelet",
    description: "Classic elegance redefined. A seamless line of round brilliant diamonds perfectly matched for color and clarity.",
    category: "Bracelets",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800",
    basePrice: 8500,
  },
  {
    id: "p4",
    name: "Royal Chandelier Earrings",
    description: "Intricately woven gold drops accented with precious stones, drawing inspiration from royal palatial designs.",
    category: "Earrings",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800",
    basePrice: 6200,
  },
  {
    id: "p5",
    name: "Sovereign Gold Set",
    description: "A majestic collection featuring a matching necklace, bracelet, and earrings. The ultimate expression of luxury.",
    category: "Sets",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800",
    basePrice: 25000,
  },
  {
    id: "p6",
    name: "Celestial Band Ring",
    description: "A thick, textured gold band echoing the celestial bodies, crafted with precision for the modern collector.",
    category: "Rings",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b80419?auto=format&fit=crop&q=80&w=800",
    basePrice: 3800,
  },
  {
    id: "p7",
    name: "Empress Pearl Necklace",
    description: "Lustrous South Sea pearls alternated with delicate gold filigree accents. A timeless symbol of grace.",
    category: "Necklaces",
    image: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&q=80&w=800",
    basePrice: 9500,
  },
  {
    id: "p8",
    name: "Luna Drop Earrings",
    description: "Minimalist drop earrings that gently sway with movement, reflecting a soft golden glow.",
    category: "Earrings",
    image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=800",
    basePrice: 5100,
  }
];

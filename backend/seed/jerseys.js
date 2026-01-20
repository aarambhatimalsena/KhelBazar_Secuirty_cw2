// seed/jerseys.js
// Import in seed.js as: import { jerseyProducts } from "./seed/jerseys.js";

export const jerseyProducts = [
  // =========================
  // ⭐ NIKE Jerseys (3)
  // =========================
  {
    name: "Nike Swingman Jersey - LeBron James #23 (Lakers)",
    description:
      "Official Nike Swingman jersey inspired by LeBron James from the Los Angeles Lakers.",
    category: "Jerseys",
    brand: "Nike",
    gender: "Men",
    price: 9500,
    originalPrice: 11000,
    discountPercent: 14,
    stock: 20,

    // Main image (card)
    image:
      "https://res.cloudinary.com/dprenqgxs/image/upload/v1764780048/73d95edc-e5d0-4f99-988f-22c964a1d6c3.png",

    // Gallery images (same style as shoes)
    images: [
      {
        url: "https://res.cloudinary.com/dprenqgxs/image/upload/v1764780051/0dc2154f-e198-4d7f-bfe8-e0023dc1e1ff.png",
        alt: "LeBron Lakers Swingman Jersey front view",
        view: "front",
      },
    ],

    // Sizes as variants (S–XL)
    variants: [
      { size: "S", stock: 5 },
      { size: "M", stock: 6 },
      { size: "L", stock: 5 },
      { size: "XL", stock: 4 },
    ],

    isFeatured: true,
    isNewArrival: true,
    tags: ["nike", "lebron", "lakers", "jersey"],
  },

  {
    name: "Nike Statement Jersey - Stephen Curry #30 (Warriors)",
    description:
      "Golden State Warriors Statement Edition Stephen Curry jersey by Nike.",
    category: "Jerseys",
    brand: "Nike",
    gender: "Men",
    price: 9300,
    originalPrice: 10000,
    discountPercent: 7,
    stock: 18,

    image:
      "https://res.cloudinary.com/dprenqgxs/image/upload/v1764850769/a8b27c3a-5a69-4fcd-8a79-44d5082e40ee.png",

    images: [
      {
        url: "https://res.cloudinary.com/dprenqgxs/image/upload/v1764850771/c4236115-2cba-432f-8678-899783ee2dba.png",
        alt: "Curry Warriors Statement Jersey front view",
        view: "front",
      },
      {
        url: "https://res.cloudinary.com/dprenqgxs/image/upload/v1764850967/eba0b4a9-6c02-490c-9093-5ea01da5eb8e.png",
        alt: "Curry Warriors Statement Jersey back view",
        view: "back",
      },
    ],

    variants: [
      { size: "S", stock: 4 },
      { size: "M", stock: 5 },
      { size: "L", stock: 5 },
      { size: "XL", stock: 4 },
    ],

    isFeatured: true,
    isNewArrival: false,
    tags: ["nike", "curry", "warriors", "jersey"],
  },

  {
    name: "Nike City Edition Jersey - Jayson Tatum #0 (Celtics)",
    description:
      "Boston Celtics City Edition Jayson Tatum jersey with modern premium detailing.",
    category: "Jerseys",
    brand: "Nike",
    gender: "Men",
    price: 9200,
    originalPrice: 9800,
    discountPercent: 6,
    stock: 15,

    image:
      "https://res.cloudinary.com/dprenqgxs/image/upload/v1764851046/4d128477-ed7e-4d5e-9f2f-0fed9ad20a02.png",

    images: [
      {
        url: "https://res.cloudinary.com/dprenqgxs/image/upload/v1764851099/33d7be71-c00a-46c0-869c-74c3d230d4d0.png",
        alt: "Tatum Celtics City Edition Jersey front view",
        view: "front",
      },
      {
        url: "https://res.cloudinary.com/dprenqgxs/image/upload/v1764851115/e3be6907-2f02-4074-b23a-58a31e9e6936.png",
        alt: "Tatum Celtics City Edition Jersey back view",
        view: "back",
      },
    ],

    variants: [
      { size: "S", stock: 3 },
      { size: "M", stock: 4 },
      { size: "L", stock: 4 },
      { size: "XL", stock: 4 },
    ],

    isFeatured: false,
    isNewArrival: true,
    tags: ["nike", "tatum", "celtics", "jersey"],
  },

  // =========================
  // ⭐ JORDAN Brand Jerseys (3)
  // =========================
  {
    name: "Jordan Retro Jersey - Michael Jordan #23 (Bulls)",
    description:
      "Classic Chicago Bulls Michael Jordan #23 jersey in retro edition.",
    category: "Jerseys",
    brand: "Jordan",
    gender: "Men",
    price: 9800,
    originalPrice: 12000,
    discountPercent: 18,
    stock: 22,

    image:
      "https://res.cloudinary.com/dprenqgxs/image/upload/v1764851257/309d933f-dd4c-4937-87b5-f8f99eb59aee.png",

    images: [
      {
        url: "https://res.cloudinary.com/dprenqgxs/image/upload/v1764851260/b02d9a8e-3708-45e2-8458-628023441eae.png",
        alt: "MJ Bulls Retro Jersey front view",
        view: "front",
      },
    ],

    variants: [
      { size: "S", stock: 5 },
      { size: "M", stock: 6 },
      { size: "L", stock: 6 },
      { size: "XL", stock: 5 },
    ],

    isFeatured: true,
    isNewArrival: false,
    tags: ["jordan", "mj", "bulls", "retro"],
  },

  {
    name: "Jordan Statement Jersey - Luka Dončić #77 (Mavericks)",
    description:
      "Dallas Mavericks Jordan Brand Statement Edition Luka Dončić #77 jersey.",
    category: "Jerseys",
    brand: "Jordan",
    gender: "Men",
    price: 9400,
    originalPrice: 10200,
    discountPercent: 8,
    stock: 17,

    image:
      "https://res.cloudinary.com/dprenqgxs/image/upload/v1764851666/f8c999c9-db18-4c59-a5cd-2625ac885e30.png",

    images: [
      {
        url: "https://res.cloudinary.com/dprenqgxs/image/upload/v1764851669/f62dce07-0ef1-474c-9e38-e6973b56b956.png",
        alt: "Luka Mavericks Statement Jersey front view",
        view: "front",
      },
      {
        url: "https://res.cloudinary.com/dprenqgxs/image/upload/v1764851683/e626512c-af00-4a87-a712-9e89065e2a08.png",
        alt: "Luka Mavericks Statement Jersey back view",
        view: "back",
      },
    ],

    variants: [
      { size: "S", stock: 4 },
      { size: "M", stock: 4 },
      { size: "L", stock: 5 },
      { size: "XL", stock: 4 },
    ],

    isFeatured: false,
    isNewArrival: true,
    tags: ["jordan", "luka", "mavs", "jersey"],
  },

  {
    name: "Jordan City Edition Jersey - Zion Williamson #1 (Pelicans)",
    description:
      "New Orleans Pelicans City Edition Jordan Brand Zion Williamson jersey.",
    category: "Jerseys",
    brand: "Jordan",
    gender: "Men",
    price: 9100,
    originalPrice: 9500,
    discountPercent: 4,
    stock: 12,

    image:
      "https://res.cloudinary.com/dprenqgxs/image/upload/v1764851760/1689f153-7b1e-4823-9560-32993dfad757.png",

    images: [
      {
        url: "https://res.cloudinary.com/dprenqgxs/image/upload/v1764851757/2233e2db-43fc-4965-b584-b506cdb64996.png",
        alt: "Zion Pelicans City Edition Jersey front view",
        view: "front",
      },
    ],

    variants: [
      { size: "S", stock: 3 },
      { size: "M", stock: 3 },
      { size: "L", stock: 3 },
      { size: "XL", stock: 3 },
    ],

    isFeatured: false,
    isNewArrival: false,
    tags: ["jordan", "zion", "pelicans", "jersey"],
  },

  // =========================
  // ⭐ ADIDAS Jerseys (3)
  // =========================
  {
    name: "Adidas Swingman Jersey - James Harden #1 (Clippers)",
    description: "Adidas Swingman Clippers jersey of James Harden #1.",
    category: "Jerseys",
    brand: "Adidas",
    gender: "Men",
    price: 8800,
    originalPrice: 9400,
    discountPercent: 6,
    stock: 20,

    image:
      "https://res.cloudinary.com/dprenqgxs/image/upload/v1764851882/10e53255-c007-443f-9ea0-61d3c51ac6fc.png",

    images: [
      {
        url: "https://res.cloudinary.com/dprenqgxs/image/upload/v1764851887/51db194b-ac6a-4aae-a38a-7f882b244d30.png",
        alt: "Harden Clippers Swingman Jersey front view",
        view: "front",
      },
      {
        url: "https://res.cloudinary.com/dprenqgxs/image/upload/v1764851893/51741a51-00bb-437f-81ef-a351318e80c6.png",
        alt: "Harden Clippers Swingman Jersey back view",
        view: "back",
      },
      {
        url: "https://res.cloudinary.com/dprenqgxs/image/upload/v1764851896/e669a07e-82af-4cd0-ad05-4ac4003969c4.png",
        alt: "Harden Clippers Swingman Jersey side view",
        view: "side",
      },
    ],

    variants: [
      { size: "S", stock: 5 },
      { size: "M", stock: 6 },
      { size: "L", stock: 5 },
      { size: "XL", stock: 4 },
    ],

    isFeatured: true,
    isNewArrival: false,
    tags: ["adidas", "harden", "clippers", "jersey"],
  },

  {
    name: "Adidas Classic Jersey - Derrick Rose #1 (Bulls)",
    description: "Chicago Bulls Derrick Rose #1 classic jersey by Adidas.",
    category: "Jerseys",
    brand: "Adidas",
    gender: "Men",
    price: 8900,
    originalPrice: 9500,
    discountPercent: 7,
    stock: 14,

    image:
      "https://res.cloudinary.com/dprenqgxs/image/upload/v1764852014/0d4d6ec0-43e5-489e-813b-a738a42a8e61.png",

    images: [
      {
        url: "https://res.cloudinary.com/dprenqgxs/image/upload/v1764852018/39876ebf-53fe-4af7-868d-5cab1445f1fc.png",
        alt: "Derrick Rose Bulls Jersey front view",
        view: "front",
      },
    ],

    variants: [
      { size: "S", stock: 3 },
      { size: "M", stock: 4 },
      { size: "L", stock: 4 },
      { size: "XL", stock: 3 },
    ],

    isFeatured: false,
    isNewArrival: false,
    tags: ["adidas", "rose", "bulls", "jersey"],
  },

  {
    name: "Adidas Replica Jersey - Trae Young #11 (Hawks)",
    description: "Trae Young #11 Atlanta Hawks replica jersey by Adidas.",
    category: "Jerseys",
    brand: "Adidas",
    gender: "Men",
    price: 8400,
    originalPrice: 8800,
    discountPercent: 5,
    stock: 18,

    image:
      "https://res.cloudinary.com/dprenqgxs/image/upload/v1764852090/e7477511-71c8-4c18-ba3b-b6ddd10340c7.png",

    images: [
      {
        url: "https://res.cloudinary.com/dprenqgxs/image/upload/v1764852097/4e6c0b6e-5771-4891-a77a-a379390ba281.png",
        alt: "Trae Young Hawks Jersey front view",
        view: "front",
      },
    ],

    variants: [
      { size: "S", stock: 4 },
      { size: "M", stock: 5 },
      { size: "L", stock: 5 },
      { size: "XL", stock: 4 },
    ],

    isFeatured: false,
    isNewArrival: true,
    tags: ["adidas", "trae", "hawks", "jersey"],
  },

  // =========================
  // ⭐ PUMA Jerseys (3)
  // =========================
  {
    name: "Puma Team Jersey - LaMelo Ball #1 (Hornets)",
    description: "Charlotte Hornets LaMelo Ball #1 jersey by Puma.",
    category: "Jerseys",
    brand: "Puma",
    gender: "Men",
    price: 8600,
    originalPrice: 9200,
    discountPercent: 7,
    stock: 16,

    image:
      "https://res.cloudinary.com/dprenqgxs/image/upload/v1764852148/58709b5d-6fbb-47ad-bf4a-1384fa7b70ab.png",

    images: [
      {
        url: "https://res.cloudinary.com/dprenqgxs/image/upload/v1764852155/68e24042-7f9f-4d04-b81e-05194a4b9c68.png",
        alt: "LaMelo Hornets Puma Jersey front view",
        view: "front",
      },
      {
        url: "https://res.cloudinary.com/dprenqgxs/image/upload/v1764852159/c9f74ac7-aa1e-4ef0-8208-159e2f96db37.png",
        alt: "LaMelo Hornets Puma Jersey back view",
        view: "back",
      },
    ],

    variants: [
      { size: "S", stock: 4 },
      { size: "M", stock: 4 },
      { size: "L", stock: 4 },
      { size: "XL", stock: 4 },
    ],

    isFeatured: true,
    isNewArrival: false,
    tags: ["puma", "lamelo", "hornets", "jersey"],
  },

  {
    name: "Puma Court Jersey - Devin Booker #1 (Suns)",
    description: "Phoenix Suns Devin Booker-inspired Puma court jersey.",
    category: "Jerseys",
    brand: "Puma",
    gender: "Men",
    price: 8700,
    originalPrice: 9300,
    discountPercent: 6,
    stock: 12,

    image:
      "https://res.cloudinary.com/dprenqgxs/image/upload/v1764852354/659505b1-a321-481a-a394-126283636cd5.png",

    images: [
      {
        url: "https://res.cloudinary.com/dprenqgxs/image/upload/v1764852358/3b9db7a4-198c-4cbd-b252-c79cd89f43be.png",
        alt: "Booker Suns Puma Jersey front view",
        view: "front",
      },
      {
        url: "https://res.cloudinary.com/dprenqgxs/image/upload/v1764852491/00c90df2-d5b5-421a-8e0e-bedf61cac373.png",
        alt: "Booker Suns Puma Jersey back view",
        view: "back",
      },
    ],

    variants: [
      { size: "S", stock: 3 },
      { size: "M", stock: 3 },
      { size: "L", stock: 3 },
      { size: "XL", stock: 3 },
    ],

    isFeatured: false,
    isNewArrival: true,
    tags: ["puma", "booker", "suns", "jersey"],
  },

  {
    name: "Puma Streetball Jersey - Pro Hooper Edition",
    description:
      "Puma streetball jersey for hoopers who prefer lightweight design.",
    category: "Jerseys",
    brand: "Puma",
    gender: "Unisex",
    price: 8100,
    originalPrice: 8500,
    discountPercent: 5,
    stock: 20,

    image:
      "https://res.cloudinary.com/dprenqgxs/image/upload/v1764852550/4beb765d-e61e-41a6-836e-e16ed375b309.png",

    images: [
      {
        url: "https://res.cloudinary.com/dprenqgxs/image/upload/v1764852559/aac27ea6-c7a2-4301-a297-4566ad23015b.png",
        alt: "Puma Streetball Jersey front view",
        view: "front",
      },
      {
        url: "https://res.cloudinary.com/dprenqgxs/image/upload/v1764852563/2e04980b-75e5-4000-a6ce-2cda0b803912.png",
        alt: "Puma Streetball Jersey back view",
        view: "back",
      },
      {
        url: "https://res.cloudinary.com/dprenqgxs/image/upload/v1764852794/f0ab5778-4fc4-4f4f-9138-2dca8938a75a.png",
        alt: "Puma Streetball Jersey side view",
        view: "side",
      },
    ],

    variants: [
      { size: "S", stock: 4 },
      { size: "M", stock: 4 },
      { size: "L", stock: 4 },
      { size: "XL", stock: 4 },
      { size: "2XL", stock: 4 },
    ],

    isFeatured: false,
    isNewArrival: false,
    tags: ["puma", "streetball", "jersey"],
  },
];

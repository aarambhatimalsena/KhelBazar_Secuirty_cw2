// seed/shoes.js
// All basketball shoe products for the "Shoes" category
// Import this in seed.js as: import { shoesProducts } from "./seed/shoes.js";

export const shoesProducts = [
  // ========== Brand: Nike ==========

  {
    name: 'Nike LeBron 20',
    description: 'Latest LeBron James signature basketball shoe by Nike.',
    category: 'Shoes',
    brand: 'Nike',
    gender: 'Men',
    price: 22500,
    originalPrice: 25000,
    discountPercent: 10,
    stock: 25,

    // ---- Main default image (shown on product cards) ----
    image:
      'https://res.cloudinary.com/dprenqgxs/image/upload/v1763272877/0871563d-88ac-4a3a-bdc0-5fa7e8ba3096.png',

    // ---- Default color views ----
    images: [
      {
        url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763272778/ec2f38e2-2e53-4969-bd05-2fdbfb681eea.png',
        alt: 'Nike LeBron 20 front view',
        view: 'front',
      },
      {
        url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763272806/05987d2e-e056-46fc-ae1d-9fbc2bb783ac.png',
        alt: 'Nike LeBron 20 back view',
        view: 'back',
      },
      {
        url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763272692/71ZwXFcqVeL._AC_SY575__wvcnbl.jpg',
        alt: 'Nike LeBron 20 left view',
        view: 'left',
      },
      {
        url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763272745/71P9oTkjDFL._AC_SY575__zo2jcy.jpg',
        alt: 'Nike LeBron 20 right view',
        view: 'right',
      },
    ],

    // ---- Extra Colors + All 4 Views Each ----
    colorImages: {
      // -------- WHITE COLOR --------
      White: [
        {
          url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763273512/0b6851e4-6c25-4fdd-a25a-7c43d005c218.png',
          alt: 'Nike LeBron 20 White front view',
          view: 'front',
        },
        {
          url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763273478/55ae081a-14d4-4347-9f1c-878b1ccfdc8a.png',
          alt: 'Nike LeBron 20 White back view',
          view: 'back',
        },
        {
          url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763273427/f2ffe083-1d7b-4666-9365-eadafcd60460.png',
          alt: 'Nike LeBron 20 White left view',
          view: 'left',
        },
        {
          url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763273540/1eff7d92-80b3-476c-9cd9-7bf73dfa3cf2.png',
          alt: 'Nike LeBron 20 White right view',
          view: 'right',
        },
      ],

      // -------- GREEN COLOR --------
      Green: [
        {
          url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763273601/e2c4237c-11a7-442b-a4e2-41195f930eae.png',
          alt: 'Nike LeBron 20 Green front view',
          view: 'front',
        },
        {
          url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763273624/a37d24e2-d2d9-4a9f-880f-a8cb07c23326.png',
          alt: 'Nike LeBron 20 Green back view',
          view: 'back',
        },
        {
          url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763273647/b6e129f6-02c7-4baf-8fb3-009558769e65.png',
          alt: 'Nike LeBron 20 Green left view',
          view: 'left',
        },
        {
          url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763273692/ec07e623-05ea-4cd6-8b71-c03ee8803611.png',
          alt: 'Nike LeBron 20 Green right view',
          view: 'right',
        },
      ],
    },

    // ---- Sizes (variants kept simple — one stock per size) ----
    variants: [
      { size: 'US 8', stock: 10 },
      { size: 'US 9', stock: 14 },
      { size: 'US 10', stock: 9 },
      { size: 'US 11', stock: 6 },
    ],

    isFeatured: true,
    isNewArrival: true,
    tags: ['nike', 'lebron', 'signature'],
  },

  {
    name: 'Nike KD 17',
    description:
      'Kevin Durant signature basketball shoe from Nike, elite performance.',
    category: 'Shoes',
    brand: 'Nike',
    gender: 'Men',
    price: 20000,
    originalPrice: 23000,
    discountPercent: 13,
    stock: 20,

    // ---- Main image ----
    image:
      'https://res.cloudinary.com/dprenqgxs/image/upload/v1763274104/0ff52720-a773-4394-9139-eacf74152c2f.png',

    // ---- Default color views ----
    images: [
      {
        url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763274082/ce045934-a784-4800-bd71-2d954d7c2127.png',
        alt: 'Nike KD 17 front view',
        view: 'front',
      },
      {
        url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763274055/e42005cc-c8cb-4590-937a-974698900fb7.png',
        alt: 'Nike KD 17 back view',
        view: 'back',
      },
      {
        url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763274001/5518430f-f9d2-4b1e-9d4d-b2b69421be40.png',
        alt: 'Nike KD 17 left view',
        view: 'left',
      },
      {
        url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763274027/5518da98-642a-4400-9a4b-a8094e5c74c7.png',
        alt: 'Nike KD 17 right view',
        view: 'right',
      },
    ],

    // ---- Sizes ----
    variants: [
      { size: 'US 8', stock: 8 },
      { size: 'US 9', stock: 10 },
      { size: 'US 10', stock: 7 },
      { size: 'US 11', stock: 5 },
    ],

    isFeatured: true,
    isNewArrival: false,
    tags: ['nike', 'kd', 'guard'],
  },
  
  {
  name: 'Nike PG 6',
  description: 'Paul George signature low-top basketball shoe from Nike.',
  category: 'Shoes',
  brand: 'Nike',
  gender: 'Men',
  price: 15000,
  originalPrice: 17500,
  discountPercent: 14,
  stock: 30,

  // Main image
  image: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763274590/0961de43-8285-4570-b439-be9bfdb2bf79.png',

  // 4 views (auto-generated)
  images: [
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763274583/d0ef9ec3-edb9-4c1f-a73e-f3f05d313607.png',
      alt: 'Nike PG 6 front view',
      view: 'front',
    },
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763274636/75a79d29-d787-4fb3-870f-1c8d50256cc5.png',
      alt: 'Nike PG 6 back view',
      view: 'back',
    },
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763274640/bebb3572-46c6-4e23-8348-abda61821a5d.png',
      alt: 'Nike PG 6 left view',
      view: 'left',
    },
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763274511/b44079af-e701-4712-88e0-f539afbba449.png',
      alt: 'Nike PG 6 right view',
      view: 'right',
    },
  ],

  // Sizes
  variants: [
    { size: "US 8", stock: 12 },
    { size: "US 9", stock: 10 },
    { size: "US 10", stock: 5 },
    { size: "US 11", stock: 3 },
  ],

  isFeatured: false,
  isNewArrival: true,
  tags: ['nike', 'pg', 'low top'],
},

  {
  name: 'Nike Zoom Freak 4',
  description: 'Giannis Antetokounmpo signature basketball shoe from Nike.',
  category: 'Shoes',
  brand: 'Nike',
  gender: 'Men',
  price: 16000,
  originalPrice: 18500,
  discountPercent: 13,
  stock: 22,

  image: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763275029/707a71b7-1d0a-43a8-a6a1-cd108466c8f4.png',

  images: [
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763275035/b6e1cd86-2751-452b-9bb5-08f087838053.png',
      alt: 'Nike Zoom Freak 4 front view',
      view: 'front',
    },
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763275044/3d088288-b909-49a9-a96b-2469710c33ba.png',
      alt: 'Nike Zoom Freak 4 back view',
      view: 'back',
    },
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763275017/3e83d25f-5c33-478f-972c-5f8e7d67a174.png',
      alt: 'Nike Zoom Freak 4 left view',
      view: 'left',
    },
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763275008/d42053fe-03d6-4607-8643-099d0ede78ae.png',
      alt: 'Nike Zoom Freak 4 right view',
      view: 'right',
    },
  ],

  variants: [
    { size: 'US 8', stock: 6 },
    { size: 'US 9', stock: 6 },
    { size: 'US 10', stock: 5 },
    { size: 'US 11', stock: 5 },
  ],

  isFeatured: false,
  isNewArrival: true,
  tags: ['nike', 'giannis', 'signature'],
},

  {
  name: 'Nike Kyrie 8',
  description: 'Kyrie Irving signature basketball shoe by Nike, for sharp guards.',
  category: 'Shoes',
  brand: 'Nike',
  gender: 'Men',
  price: 14000,
  originalPrice: 16500,
  discountPercent: 15,
  stock: 28,

  image: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763275367/2e6632ad-5edf-48a5-8d39-7c51be3f6843.png',

  images: [
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763275372/3a853cdd-0377-4c8a-9001-b587f594a928.png',
      alt: 'Nike Kyrie 8 front view',
      view: 'front',
    },
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763275376/5c641231-155a-434d-a409-4e65a1e8f3d6.png',
      alt: 'Nike Kyrie 8 back view',
      view: 'back',
    },
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763275347/a4595bb6-f901-45e9-bf70-b8779aaa6e7e.png',
      alt: 'Nike Kyrie 8 left view',
      view: 'left',
    },
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763275356/a1f3765b-7055-46ab-b27b-3652766fb51a.png',
      alt: 'Nike Kyrie 8 right view',
      view: 'right',
    },
  ],

  variants: [
    { size: 'US 8', stock: 7 },
    { size: 'US 9', stock: 7 },
    { size: 'US 10', stock: 7 },
    { size: 'US 11', stock: 7 },
  ],

  isFeatured: false,
  isNewArrival: false,
  tags: ['nike', 'kyrie', 'guard'],
},

  {
  name: 'Nike Hyperdunk X Low',
  description: 'Low-top version of Nike Hyperdunk for court agility.',
  category: 'Shoes',
  brand: 'Nike',
  gender: 'Unisex',
  price: 12000,
  originalPrice: 13800,
  discountPercent: 13,
  stock: 30,

  image: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763275697/65552512-6638-4350-8c7b-49464d2211e2.png',

  images: [
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763275690/f919e9f1-857b-4e76-b36d-0142677a7ffa.png',
      alt: 'Nike Hyperdunk X Low front view',
      view: 'front',
    },
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763275703/9f4c17bc-33f9-4d84-8442-9927ae9f8431.png',
      alt: 'Nike Hyperdunk X Low back view',
      view: 'back',
    },
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763275679/b8036881-6353-4f8c-978b-3438ffa6936c.png',
      alt: 'Nike Hyperdunk X Low left view',
      view: 'left',
    },
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763275708/d4aea723-29d5-40d7-b538-b0d691c103c7.png',
      alt: 'Nike Hyperdunk X Low right view',
      view: 'right',
    },
  ],

  variants: [
    { size: 'US 6', stock: 6 },
    { size: 'US 7', stock: 6 },
    { size: 'US 8', stock: 6 },
    { size: 'US 9', stock: 6 },
    { size: 'US 10', stock: 6 },
  ],

  isFeatured: false,
  isNewArrival: false,
  tags: ['nike', 'hyperdunk', 'low top'],
},
  {
  name: 'Nike React Hyperdunk Infinity',
  description: 'Nike React cushioning for high-end performance basketball shoe.',
  category: 'Shoes',
  brand: 'Nike',
  gender: 'Men',
  price: 14500,
  originalPrice: 17000,
  discountPercent: 14,
  stock: 24,

  image: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763276046/83f2a68f-aa6f-46df-9c9d-0daa001c46b9.png',

  images: [
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763276053/a34a864a-654a-406b-8761-058b09203889.png',
      alt: 'Nike React Hyperdunk Infinity front view',
      view: 'front',
    },
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763276041/2f59a5ce-be4a-4bd7-ae94-74f3bea70971.png',
      alt: 'Nike React Hyperdunk Infinity back view',
      view: 'back',
    },
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763276037/28125c0e-d1d8-4d86-a27b-c282b738a79e.png',
      alt: 'Nike React Hyperdunk Infinity left view',
      view: 'left',
    },
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763276026/ea16844b-3925-480a-acfa-f1fd12a76e47.png',
      alt: 'Nike React Hyperdunk Infinity right view',
      view: 'right',
    },
  ],

  variants: [
    { size: 'US 8', stock: 6 },
    { size: 'US 9', stock: 6 },
    { size: 'US 10', stock: 6 },
    { size: 'US 11', stock: 6 },
  ],

  isFeatured: false,
  isNewArrival: false,
  tags: ['nike', 'react', 'performance'],
},
{
  name: 'Nike Zoom GT Cut 2',
  description: 'Nike speed basketball shoe built for fast breaks and guards.',
  category: 'Shoes',
  brand: 'Nike',
  gender: 'Men',
  price: 15500,
  originalPrice: 18000,
  discountPercent: 14,
  stock: 27,

  image: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763276344/aba91b14-87c0-4165-ae41-eeffc6181e6f.png',

  images: [
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763276340/95028b22-723c-4650-83d9-1b5b76732508.png',
      alt: 'Nike Zoom GT Cut 2 front view',
      view: 'front',
    },
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763276282/01652278-7802-40cb-b760-8e5949e75256.png',
      alt: 'Nike Zoom GT Cut 2 back view',
      view: 'back',
    },
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763276204/69004632-f17c-46a0-bd35-7f554270fed4.png',
      alt: 'Nike Zoom GT Cut 2 left view',
      view: 'left',
    },
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763276311/36f689e3-4efc-4ab5-a498-8951b68c054e.png',
      alt: 'Nike Zoom GT Cut 2 right view',
      view: 'right',
    },
  ],

  variants: [
    { size: 'US 8', stock: 7 },
    { size: 'US 9', stock: 7 },
    { size: 'US 10', stock: 7 },
    { size: 'US 11', stock: 6 },
  ],

  isFeatured: false,
  isNewArrival: false,
  tags: ['nike', 'zoom', 'fastbreak'],
},
  {
  name: 'Nike Precision 6',
  description: 'Budget-friendly basketball shoe from Nike for club players.',
  category: 'Shoes',
  brand: 'Nike',
  gender: 'Unisex',
  price: 9000,
  originalPrice: 10500,
  discountPercent: 14,
  stock: 40,

  image: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763276458/1a793e30-c2e7-4043-a618-2048068c23a6.png',

  images: [
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763276464/bd6d525d-06c5-424f-ab61-0396c8385196.png',
      alt: 'Nike Precision 6 front view',
      view: 'front',
    },
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763276467/336d2457-5933-4d37-a7ac-3c435bbbea8b.png',
      alt: 'Nike Precision 6 back view',
      view: 'back',
    },
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763276446/715740f8-6f0c-41d0-b49d-20419288d038.png',
      alt: 'Nike Precision 6 left view',
      view: 'left',
    },
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763276451/b6705562-9732-4556-98b0-e4d98adf1686.png',
      alt: 'Nike Precision 6 right view',
      view: 'right',
    },
  ],

  variants: [
    { size: 'US 6', stock: 8 },
    { size: 'US 7', stock: 8 },
    { size: 'US 8', stock: 8 },
    { size: 'US 9', stock: 8 },
    { size: 'US 10', stock: 8 },
  ],

  isFeatured: false,
  isNewArrival: false,
  tags: ['nike', 'budget', 'club'],
},
  // ========== Brand: Adidas ==========
{
  name: 'Adidas Harden Vol. 8',
  description: 'James Harden signature basketball shoe from Adidas.',
  category: 'Shoes',
  brand: 'Adidas',
  gender: 'Men',
  price: 22000,
  originalPrice: 24500,
  discountPercent: 10,
  stock: 20,

  image: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763276982/3b78b79a-49cb-4b6f-ad6f-973f723cdbfd.png',

  images: [
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763277008/5f05ccbc-114f-4356-a7ab-5035186f1c72.png',
      alt: 'Adidas Harden Vol. 8 front view',
      view: 'front',
    },
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763277020/45b60df2-a3c1-459b-a92d-9193a2755861.png',
      alt: 'Adidas Harden Vol. 8 back view',
      view: 'back',
    },
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763277025/1fa7ab8a-caed-454b-829d-4948f4a6d00c.png',
      alt: 'Adidas Harden Vol. 8 left view',
      view: 'left',
    },
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763276948/7785555a-1270-4c15-833d-eb703558364a.png',
      alt: 'Adidas Harden Vol. 8 right view',
      view: 'right',
    },
  ],

  variants: [
    { size: 'US 8', stock: 5 },
    { size: 'US 9', stock: 5 },
    { size: 'US 10', stock: 5 },
    { size: 'US 11', stock: 5 },
  ],

  isFeatured: true,
  isNewArrival: true,
  tags: ['adidas', 'harden', 'signature'],
},

{
  name: 'Adidas Dame 9',
  description: 'Damian Lillard signature basketball shoe from Adidas.',
  category: 'Shoes',
  brand: 'Adidas',
  gender: 'Men',
  price: 19000,
  originalPrice: 21500,
  discountPercent: 12,
  stock: 22,

  image: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763277118/73d96512-23c7-4ab4-a4a9-5008234ca260.png',

  images: [
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763277124/444cf51d-c389-4ed8-bb81-eda8cbd66374.png',
      alt: 'Adidas Dame 9 front view',
      view: 'front',
    },
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763277137/cb70e9c9-32ff-4c6a-a07d-73b417f2172f.png',
      alt: 'Adidas Dame 9 back view',
      view: 'back',
    },
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763277133/dff4c98a-d351-472c-ad8d-ce7a573849cb.png',
      alt: 'Adidas Dame 9 left view',
      view: 'left',
    },
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763277111/56584b46-8ca8-4abc-9c9e-0efed4473edb.png',
      alt: 'Adidas Dame 9 right view',
      view: 'right',
    },
  ],

  variants: [
    { size: 'US 8', stock: 6 },
    { size: 'US 9', stock: 6 },
    { size: 'US 10', stock: 5 },
    { size: 'US 11', stock: 5 },
  ],

  isFeatured: true,
  isNewArrival: false,
  tags: ['adidas', 'dame', 'guard'],
},

{
  name: 'Adidas Trae Young 3',
  description: 'Trae Young signature basketball shoe from Adidas.',
  category: 'Shoes',
  brand: 'Adidas',
  gender: 'Men',
  price: 17000,
  originalPrice: 19500,
  discountPercent: 13,
  stock: 26,

  image: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763277265/b99a031f-34ac-4144-9f11-d41e37bf06a6.png',

  images: [
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763277375/474ef7bf-cd92-4215-8e65-1c14d98f4445.png',
      alt: 'Adidas Trae Young 3 front view',
      view: 'front',
    },
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763277275/1ff3f4aa-922b-45ed-9dba-0c3fda82ac55.png',
      alt: 'Adidas Trae Young 3 back view',
      view: 'back',
    },
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763277282/6049a709-4b90-4845-a6b4-b637680cddd2.png',
      alt: 'Adidas Trae Young 3 left view',
      view: 'left',
    },
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763277256/c2894559-4643-486e-ae5d-1b5ceb76ddc9.png',
      alt: 'Adidas Trae Young 3 right view',
      view: 'right',
    },
  ],

  variants: [
    { size: 'US 8', stock: 7 },
    { size: 'US 9', stock: 7 },
    { size: 'US 10', stock: 6 },
    { size: 'US 11', stock: 6 },
  ],

  isFeatured: false,
  isNewArrival: true,
  tags: ['adidas', 'trae', 'guard'],
},

{
  name: 'Adidas Marquee Boost 4',
  description: 'Adidas performance basketball shoe with Boost cushioning.',
  category: 'Shoes',
  brand: 'Adidas',
  gender: 'Unisex',
  price: 16000,
  originalPrice: 18500,
  discountPercent: 14,
  stock: 30,

  image: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763277480/0ad486c2-7d6f-401d-918d-c603cc3baacc.png',

  images: [
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763277462/a141d6e5-7d31-45f8-8bcd-b23b63818fe4.png',
      alt: 'Adidas Marquee Boost 4 front view',
      view: 'front',
    },
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763277476/495030ea-1f95-4f4b-a1f0-23c9a430b69c.png',
      alt: 'Adidas Marquee Boost 4 back view',
      view: 'back',
    },
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763277469/326a444f-f33b-46df-9048-43cecc3118c4.png',
      alt: 'Adidas Marquee Boost 4 left view',
      view: 'left',
    },
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763277450/f586809f-027e-4195-a324-d6d8c1621dce.png',
      alt: 'Adidas Marquee Boost 4 right view',
      view: 'right',
    },
  ],

  variants: [
    { size: 'US 6', stock: 6 },
    { size: 'US 7', stock: 6 },
    { size: 'US 8', stock: 6 },
    { size: 'US 9', stock: 6 },
    { size: 'US 10', stock: 6 },
  ],

  isFeatured: true,          // ✅ now featured
  isNewArrival: false,
  tags: ['adidas', 'marquee', 'boost'],
},

{
  name: 'Adidas D.O.N. Issue 5',
  description: 'Donovan Mitchell signature basketball shoe from Adidas.',
  category: 'Shoes',
  brand: 'Adidas',
  gender: 'Men',
  price: 15500,
  originalPrice: 18000,
  discountPercent: 14,
  stock: 28,

  image: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763277611/570966f9-6098-47cc-ad1c-885d418e86f6.png',

  images: [
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763277605/afcb24ce-adcf-4bc7-be79-db7aa9ef70ca.png',
      alt: 'Adidas D.O.N. Issue 5 front view',
      view: 'front',
    },
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763277623/8b5700de-35d5-4f80-a220-1ce0c56970ad.png',
      alt: 'Adidas D.O.N. Issue 5 back view',
      view: 'back',
    },
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763277617/ec3fe9fc-db4a-4018-86a8-f97e7f499b6f.png',
      alt: 'Adidas D.O.N. Issue 5 left view',
      view: 'left',
    },
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763277596/fed0acb5-afc6-4e3b-96fd-c03db12c2d9f.png',
      alt: 'Adidas D.O.N. Issue 5 right view',
      view: 'right',
    },
  ],

  variants: [
    { size: 'US 8', stock: 7 },
    { size: 'US 9', stock: 7 },
    { size: 'US 10', stock: 7 },
    { size: 'US 11', stock: 7 },
  ],

  isFeatured: false,
  isNewArrival: false,
  tags: ['adidas', 'don', 'guard'],
},

{
  name: 'Adidas Harden Stepback 3',
  description: 'Budget Harden model from Adidas.',
  category: 'Shoes',
  brand: 'Adidas',
  gender: 'Men',
  price: 12500,
  originalPrice: 14500,
  discountPercent: 13,
  stock: 35,

  image: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763277804/b51ca404-ac8a-42f6-9387-0faf54e87993.png',

  images: [
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763277812/9add7117-bb0e-4828-ac9e-91d83db8265a.png',
      alt: 'Adidas Harden Stepback 3 front view',
      view: 'front',
    },
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763277823/bfe901fe-a167-4e93-8085-57a033a2f291.png',
      alt: 'Adidas Harden Stepback 3 back view',
      view: 'back',
    },
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763277818/cff0cf8b-f146-46c2-a766-e905558cb50f.png',
      alt: 'Adidas Harden Stepback 3 left view',
      view: 'left',
    },
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763277783/b895a63a-688b-4393-b0e9-ad7c62aeafa4.png',
      alt: 'Adidas Harden Stepback 3 right view',
      view: 'right',
    },
  ],

  variants: [
    { size: 'US 8', stock: 9 },
    { size: 'US 9', stock: 9 },
    { size: 'US 10', stock: 9 },
    { size: 'US 11', stock: 8 },
  ],

  isFeatured: false,
  isNewArrival: false,
  tags: ['adidas', 'harden', 'budget'],
},

{
  name: 'Adidas Crazyflight 6',
  description: 'Adidas retro basketball model for indoor/outdoor.',
  category: 'Shoes',
  brand: 'Adidas',
  gender: 'Unisex',
  price: 11000,
  originalPrice: 13000,
  discountPercent: 15,
  stock: 40,

  image: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763278076/df963e5e-2306-43ef-8adf-8f2f4136ce04.png',

  images: [
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763277987/3fd516be-efb3-4830-a6ec-3f6203c113e9.png',
      alt: 'Adidas Pro Model 3G front view',
      view: 'front',
    },
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763277999/44166de9-c42f-469b-870b-a0ee018c69e9.png',
      alt: 'Adidas Pro Model 3G back view',
      view: 'back',
    },
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763278007/dc5792f3-f21c-42b7-9b48-d774c007f9e2.png',
      alt: 'Adidas Pro Model 3G left view',
      view: 'left',
    },
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763277974/37ecdbba-4e7f-40a7-8523-d62d8ff22566.png',
      alt: 'Adidas Pro Model 3G right view',
      view: 'right',
    },
  ],

  variants: [
    { size: 'US 6', stock: 8 },
    { size: 'US 7', stock: 8 },
    { size: 'US 8', stock: 8 },
    { size: 'US 9', stock: 8 },
    { size: 'US 10', stock: 8 },
  ],

  isFeatured: false,
  isNewArrival: false,
  tags: ['adidas', 'pro model', 'retro'],
},
{
  name: 'Adidas Pro Bounce 2024',
  description: 'Adidas performance basketball shoe with Pro Bounce foam.',
  category: 'Shoes',
  brand: 'Adidas',
  gender: 'Unisex',
  price: 13500,
  originalPrice: 15500,
  discountPercent: 13,
  stock: 32,

  image: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763278183/8ccabed6-6d07-453f-9cc9-2cb00ea86ffe.png',

  images: [
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763278187/8cc63562-d9e1-419c-bf85-db51378d4446.png',
      alt: 'Adidas Pro Bounce 2024 front view',
      view: 'front',
    },
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763278191/a227fed4-4885-4f68-be66-56f260969710.png',
      alt: 'Adidas Pro Bounce 2024 back view',
      view: 'back',
    },
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763278196/cb8f46e3-cf19-45a0-a53e-4433c7e43eeb.png',
      alt: 'Adidas Pro Bounce 2024 left view',
      view: 'left',
    },
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763278172/fb973889-895c-4cae-8a0f-75c4d4c83e6a.png',
      alt: 'Adidas Pro Bounce 2024 right view',
      view: 'right',
    },
  ],

  variants: [
    { size: 'US 6', stock: 7 },
    { size: 'US 7', stock: 7 },
    { size: 'US 8', stock: 6 },
    { size: 'US 9', stock: 6 },
    { size: 'US 10', stock: 6 },
  ],

  isFeatured: false,
  isNewArrival: true,   // ✅ now a new arrival
  tags: ['adidas', 'probounce', 'performance'],
},

{
  name: 'Adidas Authentic Pro',
  description: 'Adidas Authentic Pro basketball shoe for club players.',
  category: 'Shoes',
  brand: 'Adidas',
  gender: 'Unisex',
  price: 9500,
  originalPrice: 11000,
  discountPercent: 14,
  stock: 45,

  image: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763278377/2a3125dc-8526-46ce-b349-86967fec3115.png',

  images: [
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763278347/d60bec22-8456-4f5f-9a3d-abf8bb1d730f.png',
      alt: 'Adidas Authentic Pro front view',
      view: 'front',
    },
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763278383/28425aea-3b21-4b17-b8cc-6abd4e7d10bd.png',
      alt: 'Adidas Authentic Pro back view',
      view: 'back',
    },
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763278395/c3297f3d-3ae9-4354-a60f-96aefd369fdf.png',
      alt: 'Adidas Authentic Pro left view',
      view: 'left',
    },
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763278338/3b76098a-b10c-44ba-8a69-566d8c83f743.png',
      alt: 'Adidas Authentic Pro right view',
      view: 'right',
    },
  ],

  variants: [
    { size: 'US 6', stock: 9 },
    { size: 'US 7', stock: 9 },
    { size: 'US 8', stock: 9 },
    { size: 'US 9', stock: 9 },
    { size: 'US 10', stock: 9 },
  ],

  isFeatured: false,
  isNewArrival: false,
  tags: ['adidas', 'authentic', 'club'],
},

{
  name: 'Adidas Legacy 2024',
  description: 'Adidas Legacy 2024 mid-top basketball shoe.',
  category: 'Shoes',
  brand: 'Adidas',
  gender: 'Unisex',
  price: 10500,
  originalPrice: 12200,
  discountPercent: 14,
  stock: 38,

  image: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763278542/6674be44-45b9-482b-b324-dcadce9cea36.png',

  images: [
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763278611/52b2618f-0bb8-4cef-9b0d-41a4030d9c69.png',
      alt: 'Adidas Legacy 2024 front view',
      view: 'front',
    },
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763278547/220ac1fc-e68a-4d8d-a9d0-49a616e9ebf4.png',
      alt: 'Adidas Legacy 2024 back view',
      view: 'back',
    },
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763278528/95886f8b-4dea-4473-8f76-3ab2608c2d04.png',
      alt: 'Adidas Legacy 2024 left view',
      view: 'left',
    },
    {
      url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763278513/c16559f0-67ed-4afa-b3ea-960e2e3d6868.png',
      alt: 'Adidas Legacy 2024 right view',
      view: 'right',
    },
  ],

  variants: [
    { size: 'US 6', stock: 8 },
    { size: 'US 7', stock: 8 },
    { size: 'US 8', stock: 8 },
    { size: 'US 9', stock: 7 },
    { size: 'US 10', stock: 7 },
  ],

  isFeatured: false,
  isNewArrival: false,
  tags: ['adidas', 'legacy', 'mid top'],
},

  // ========== Brand: Jordan ==========
  // ========== Brand: Jordan ==========
{
  name: 'Jordan Luka 3',
  description: 'Luka Dončić signature basketball shoe from Jordan brand.',
  category: 'Shoes',
  brand: 'Jordan',
  gender: 'Men',
  price: 21000,
  originalPrice: 23500,
  discountPercent: 11,
  stock: 20,

  image: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763278881/608acdce-f267-41a7-b4df-7eeea7efcdf4.png',

  images: [
    { url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763278927/910bcadd-b47d-4600-bf8b-fc3103539ed0.png', alt: 'Jordan Luka 3 front view', view: 'front' },
    { url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763278877/83785915-73c4-4793-a2b6-29fac9a50a38.png', alt: 'Jordan Luka 3 back view', view: 'back' },
    { url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763278934/e17a3a8c-39e7-41ca-af7a-7c03165872a0.png', alt: 'Jordan Luka 3 left view', view: 'left' },
    { url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763278866/85e080f8-f2d2-46d7-943f-edaf6b89f91d.png', alt: 'Jordan Luka 3 right view', view: 'right' },
  ],

  variants: [
    { size: 'US 8', stock: 5 },
    { size: 'US 9', stock: 5 },
    { size: 'US 10', stock: 5 },
    { size: 'US 11', stock: 5 },
  ],

  isFeatured: true,
  isNewArrival: true,
  tags: ['jordan', 'luka', 'signature'],
},
  {
  name: 'Jordan Zion 3',
  description: 'Zion Williamson signature basketball shoe from Jordan brand.',
  category: 'Shoes',
  brand: 'Jordan',
  gender: 'Men',
  price: 19500,
  originalPrice: 22000,
  discountPercent: 11,
  stock: 22,

  image: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763279079/4aac5ab8-0d89-4dec-b82d-2ce20328a8ca.png',

  images: [
    { url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763279083/671ee72c-b7c8-48b2-9d1a-4eba254da6db.png', alt: 'Jordan Zion 3 front view', view: 'front' },
    { url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763279087/eae6894a-41d5-4ee4-8917-0f0da3d89341.png', alt: 'Jordan Zion 3 back view', view: 'back' },
    { url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763279063/e5cb5111-5e5d-49f2-aa78-b068a1d33b38.png', alt: 'Jordan Zion 3 left view', view: 'left' },
    { url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763279072/51c2654f-e9c2-4d82-baac-e67824385714.png', alt: 'Jordan Zion 3 right view', view: 'right' },
  ],

  variants: [
    { size: 'US 8', stock: 6 },
    { size: 'US 9', stock: 6 },
    { size: 'US 10', stock: 5 },
    { size: 'US 11', stock: 5 },
  ],

  isFeatured: true,
  isNewArrival: false,
  tags: ['jordan', 'zion', 'forward'],
},

  {
  name: 'Jordan Max Aura 4',
  description: 'Jordan high-volume basketball shoe with Max Air cushioning.',
  category: 'Shoes',
  brand: 'Jordan',
  gender: 'Unisex',
  price: 16000,
  originalPrice: 18500,
  discountPercent: 14,
  stock: 30,

  image: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763279212/ec193c2e-11ac-496f-9347-e42383f88b25.png',

  images: [
    { url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763279221/43e80c36-6195-4695-98c3-224542cbb28c.png', alt: 'Jordan Max Aura 4 front view', view: 'front' },
    { url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763279225/ca58335d-e79d-4729-a9ce-b701ec59343a.png', alt: 'Jordan Max Aura 4 back view', view: 'back' },
    { url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763279201/2b120c70-5a71-4a4a-9afc-909200601296.png', alt: 'Jordan Max Aura 4 left view', view: 'left' },
    { url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763279217/49be1879-9eb5-46e4-9154-fc1d608ffecf.png', alt: 'Jordan Max Aura 4 right view', view: 'right' },
  ],

  variants: [
    { size: 'US 6', stock: 6 },
    { size: 'US 7', stock: 6 },
    { size: 'US 8', stock: 6 },
    { size: 'US 9', stock: 6 },
    { size: 'US 10', stock: 6 },
  ],

  isFeatured: false,
  isNewArrival: true,
  tags: ['jordan', 'max air', 'cushion'],
},
{
  name: 'Jordan React Elevation 3',
  description: 'Jordan performance shoe with React cushioning and premium support.',
  category: 'Shoes',
  brand: 'Jordan',
  gender: 'Men',
  price: 15000,
  originalPrice: 17500,
  discountPercent: 14,
  stock: 33,

  image: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763279465/3fbeb8c4-af5b-44a6-bb6f-32b06b8a6f19.png',

  images: [
    { url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763279477/ee45733b-eb91-41de-85f5-655c4e99857b.png', alt: 'Jordan React Elevation 3 front view', view: 'front' },
    { url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763279481/2132c540-2e31-4e17-95c7-ca022970c4d1.png', alt: 'Jordan React Elevation 3 back view', view: 'back' },
    { url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763279454/34ade9d5-aaac-458a-a81c-6d1217fd077d.png', alt: 'Jordan React Elevation 3 left view', view: 'left' },
    { url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763279471/3636852b-4c9a-4633-afe1-6384a689cbbb.png', alt: 'Jordan React Elevation 3 right view', view: 'right' },
  ],

  variants: [
    { size: 'US 8', stock: 8 },
    { size: 'US 9', stock: 8 },
    { size: 'US 10', stock: 8 },
    { size: 'US 11', stock: 9 },
  ],

  isFeatured: false,
  isNewArrival: false,
  tags: ['jordan', 'react', 'support'],
},

  {
  name: 'Jordan Air Zoom G.T. Jump',
  description: 'Jordan speed-focused basketball shoe for guards and quick players.',
  category: 'Shoes',
  brand: 'Jordan',
  gender: 'Men',
  price: 15500,
  originalPrice: 18000,
  discountPercent: 14,
  stock: 28,

  image: 'https://res.cloudinary.com/demo/image/upload/jordan_airzoomgtjump.jpg',

  images: [
    { url: 'https://res.cloudinary.com/demo/image/upload/jordan_airzoomgtjump.jpg', alt: 'Jordan Air Zoom G.T. Jump front view', view: 'front' },
    { url: 'https://res.cloudinary.com/demo/image/upload/e_flip/jordan_airzoomgtjump.jpg', alt: 'Jordan G.T. Jump back view', view: 'back' },
    { url: 'https://res.cloudinary.com/demo/image/upload/e_hflip/jordan_airzoomgtjump.jpg', alt: 'Jordan G.T. Jump left view', view: 'left' },
    { url: 'https://res.cloudinary.com/demo/image/upload/e_art:athena/jordan_airzoomgtjump.jpg', alt: 'Jordan G.T. Jump right view', view: 'right' },
  ],

  variants: [
    { size: 'US 8', stock: 7 },
    { size: 'US 9', stock: 7 },
    { size: 'US 10', stock: 7 },
    { size: 'US 11', stock: 7 },
  ],

  isFeatured: false,
  isNewArrival: false,
  tags: ['jordan', 'guard', 'speed'],
},

  {
  name: 'Jordan Zoom Trunner Ultimate',
  description: 'Jordan affordable performance basketball shoe for general players.',
  category: 'Shoes',
  brand: 'Jordan',
  gender: 'Unisex',
  price: 8500,
  originalPrice: 10000,
  discountPercent: 15,
  stock: 40,

  image: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763282102/7a30b1e8-535b-4d1c-bf63-20fe4357d7e8.png',

  images: [
    { url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763282229/f21282f7-178f-49db-8208-f1147c8d4c33.png', alt: 'Jordan Zoom Trunner Ultimate front view', view: 'front' },
    { url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763282102/7a30b1e8-535b-4d1c-bf63-20fe4357d7e8.png', alt: 'Jordan Zoom Trunner Ultimate back view', view: 'back' },
    { url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763282092/102ca8a5-f9ae-4bf7-8ead-e3369e9cae54.png', alt: 'Jordan Zoom Trunner Ultimate left view', view: 'left' },
    { url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763282087/6189d0a7-dc70-44cd-8210-29d535a256dc.png', alt: 'Jordan Zoom Trunner Ultimate right view', view: 'right' },
  ],

  variants: [
    { size: 'US 6', stock: 8 },
    { size: 'US 7', stock: 8 },
    { size: 'US 8', stock: 8 },
    { size: 'US 9', stock: 8 },
    { size: 'US 10', stock: 8 },
  ],

  isFeatured: false,
  isNewArrival: false,
  tags: ['jordan', 'budget', 'club'],
},

  {
  name: 'Jordan Max Aura 3 Fade',
  description: 'With premium leather upper and Max Air cushioning.',
  category: 'Shoes',
  brand: 'Jordan',
  gender: 'Unisex',
  price: 14500,
  originalPrice: 17000,
  discountPercent: 15,
  stock: 26,

  image: 'https://res.cloudinary.com/demo/image/upload/jordan_maxaura3fade.jpg',

  images: [
    { url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763282372/6cae6dde-5061-458b-bf3f-90126a0d9667.png', alt: 'Jordan Max Aura 3 Fade front view', view: 'front' },
    { url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763282375/91c7f362-f1d6-4f4e-94dc-26adc3688879.png', alt: 'Jordan Max Aura 3 Fade back view', view: 'back' },
    { url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763282354/0aafb2c3-4fea-41a1-ab43-5cb77c25fada.png', alt: 'Jordan Max Aura 3 Fade left view', view: 'left' },
    { url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763282362/3d75aa2e-30ec-41d0-b89f-7bc5b5dbd191.png', alt: 'Jordan Max Aura 3 Fade right view', view: 'right' },
  ],

  variants: [
    { size: 'US 6', stock: 6 },
    { size: 'US 7', stock: 6 },
    { size: 'US 8', stock: 6 },
    { size: 'US 9', stock: 4 },
    { size: 'US 10', stock: 4 },
  ],

  isFeatured: false,
  isNewArrival: false,
  tags: ['jordan', 'max aura', 'premium'],
},
{
  name: 'Jordan One Take 5',
  description: 'Jordan multipurpose basketball shoe for indoor/outdoor.',
  category: 'Shoes',
  brand: 'Jordan',
  gender: 'Unisex',
  price: 12000,
  originalPrice: 13800,
  discountPercent: 13,
  stock: 35,

  image: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763282735/94629c81-829d-4bc7-a81d-4c1bcfd8e00b.png',

  images: [
    { url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763282741/91f633a4-507f-4267-918b-d79e2a4697c2.png', alt: 'Jordan One Take 5 front view', view: 'front' },
    { url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763282760/3345ba10-d918-433d-b11a-f288cd217949.png', alt: 'Jordan One Take 5 back view', view: 'back' },
    { url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763282725/7960a3c9-6c78-4cf3-ba9f-d2eb0c67168a.png', alt: 'Jordan One Take 5 left view', view: 'left' },
    { url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763282818/4c01bc7a-171a-42f7-93c2-f5c69a0ec06c.png', alt: 'Jordan One Take 5 right view', view: 'right' },
  ],

  variants: [
    { size: 'US 6', stock: 7 },
    { size: 'US 7', stock: 7 },
    { size: 'US 8', stock: 7 },
    { size: 'US 9', stock: 7 },
    { size: 'US 10', stock: 7 },
  ],

  isFeatured: false,
  isNewArrival: false,
  tags: ['jordan', 'onetake', 'value'],
},
{
  name: 'Jordan Courtside 23',
  description: 'Jordan retro style basketball shoe inspired by MJ.',
  category: 'Shoes',
  brand: 'Jordan',
  gender: 'Unisex',
  price: 11000,
  originalPrice: 12800,
  discountPercent: 14,
  stock: 38,

  image: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763282928/102efb27-d841-451b-aa8c-ba282fa1f6de.png',

  images: [
    { url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763282938/f208ce13-3652-4725-81d3-c427b3aa04d6.png', alt: 'Jordan Courtside 23 front view', view: 'front' },
    { url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763282935/74608da5-cba7-420f-9220-c533cc976a4d.png', alt: 'Jordan Courtside 23 back view', view: 'back' },
    { url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763282916/ac555789-79a5-47e2-ac49-1996a69b2af5.png', alt: 'Jordan Courtside 23 left view', view: 'left' },
    { url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763282922/27f7d6d8-29c4-4115-a605-58d48ffec9ad.png', alt: 'Jordan Courtside 23 right view', view: 'right' },
  ],

  variants: [
    { size: 'US 6', stock: 8 },
    { size: 'US 7', stock: 8 },
    { size: 'US 8', stock: 8 },
    { size: 'US 9', stock: 7 },
    { size: 'US 10', stock: 7 },
  ],

  isFeatured: false,
  isNewArrival: false,
  tags: ['jordan', 'retro', 'mj'],
},
 {
  name: 'Jordan Zoom Trunner 2',
  description: 'Jordan budget performance shoe with Zoom Air cushioning.',
  category: 'Shoes',
  brand: 'Jordan',
  gender: 'Unisex',
  price: 9000,
  originalPrice: 10500,
  discountPercent: 14,
  stock: 42,

  image: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763283193/e716eb96-a1cf-47e1-b211-6d79c5add6a0.png',

  images: [
    { url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763283287/c2cbbbea-1e6b-4f83-b68f-9b0088ea0631.png', alt: 'Jordan Zoom Trunner 2 front view', view: 'front' },
    { url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763283197/fbc74d95-0420-438b-a41e-cfd2daf95d11.png', alt: 'Jordan Zoom Trunner 2 back view', view: 'back' },
    { url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763283360/95bca4f6-5eda-4590-9d7c-0c05e2dc85f7.png', alt: 'Jordan Zoom Trunner 2 left view', view: 'left' },
    { url: 'https://res.cloudinary.com/dprenqgxs/image/upload/v1763283183/7f5e1818-c60c-4ff2-b643-9690bf3d0ef3.png', alt: 'Jordan Zoom Trunner 2 right view', view: 'right' },
  ],

  variants: [
    { size: 'US 6', stock: 9 },
    { size: 'US 7', stock: 9 },
    { size: 'US 8', stock: 9 },
    { size: 'US 9', stock: 7 },
    { size: 'US 10', stock: 8 },
  ],

  isFeatured: false,
  isNewArrival: false,
  tags: ['jordan', 'budget', 'zoom'],
},
];
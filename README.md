# ChopperzFresh React

React/Vite migration of the ChopperzFresh meat delivery storefront.

## Structure

```text
chopperzfreshv2/
├── index.html
├── package.json
├── css/
│   └── style.css
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   └── data/
│       └── products.js
└── js/
    ├── app.js
    ├── cart.js
    └── data.js
```

The old `js/` files are kept as legacy reference files. The active app now runs from `src/main.jsx` and `src/App.jsx`.

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Notes

- Cart state is managed with React state and persisted to `localStorage`.
- Product/category data lives in `src/data/products.js`.
- The original stylesheet is reused through `src/main.jsx`.

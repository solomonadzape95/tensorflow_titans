# Tensorflow_titans

## Team Members 

- **[Olamide](https://github.com/danieljs-codes)**
- **[Solomon](https://github.com/solomonadzape95)**
- **[Venny](https://github.com/Venny-Dev)**
- **[Stephen](https://github.com/Praizee)**
- **[Obed](https://github.com/obed-smart)**
- **[Diamond](https://github.com/raveroses)**
- **[Bridget](https://github.com/Bridgetamana)**
- **[Basilver](https://github.com/Bazilver)**

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

## UI Design Concept
Our interface design was prototyped using [v0.dev](https://v0.dev), Vercel's AI-powered interface generator. You can view our initial design concept [here](https://v0.dev/chat/fork-of-modern-bill-split-design-nS46Gidhapg) and view the live demo version [here](https://v0-modern-bill-split-design.vercel.app/).

## Supabase Setup

This project uses [Supabase](https://supabase.com) for backend services (database, auth, storage, etc).

### Environment Variables

Make sure you create a `.env.local` file in the root with the following:

```bash
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-public-key

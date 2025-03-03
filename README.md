# Vite Plugin for Chicory

## Usage

1. Install the plugin:

```
npm install --save-dev vite-plugin-chicory
```

2. Add the plugin to your `vite.config.js`:

```javascript
import { defineConfig } from 'vite';
import chicory from 'vite-plugin-chicory';

export default defineConfig({
  plugins: [chicory()],
});
```

For more information about developing with Chicory, see the [Chicory documentation](https://chicory-lang.github.io/).
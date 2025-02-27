# Staffing

## Frontend (Client)

### Add `@` for path-resolve

1. Import `path` in `vite.config.js`

```js
import path from 'path'
```

2. Add `path.resolve` to `vite.config.js`

```js
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
```
3. Example of `vite.config.js` 

```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```



### Add vue-router

1. Add the vue router package

```shell
pnpm add -D vue-router@4
```

2. Create `/src/plugins/router.js`

```js
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    { path: '', name: 'home', component: () => import('@/views/Home.vue') }
]

const router = createRouter({
    routes,
    history: createWebHistory()
})

export default router
```

3. Update `main.js` to import `vue-router`

```js
// Import vue-router
import router from '@/plugins/router'
```

4. Update `main.js` to use `vue-router`

```js
createApp(App).use(router).mount('#app')
```

### Add Bulma CSS

1. Add Bulma CSS
- Add Bulma CSS

```shell
pnpm install bulma
```

2. Add Bulma globally by importing `main.js`

```js
// Import Bulma's CSS globally
import 'bulma/css/bulma.css'
```

3. Force Bulma CSS Light mode (optional)

```html
<!doctype html>
<html lang="en" data-theme="light">
  <head>
    <meta charset="UTF-8" />
    <meta name="color-scheme" content="light">
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>title_of_site</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```



## Backend (API)

## Database (PostgreSQL)
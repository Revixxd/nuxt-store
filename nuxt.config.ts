// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxt/eslint", "@nuxt/ui"],

  devtools: {
    enabled: true
  },

  css: ["~/assets/css/main.css"],

  ui: {
    colorMode: false
  },

  runtimeConfig: {
    public: {
      siteUrl: "https://nuxt-store.vercel.app"
    }
  },

  routeRules: {
    // TEMP: the Listing is the only page for now
    "/": { redirect: "/catalog" }
  },

  compatibilityDate: "2026-06-30",

  typescript: {
    tsConfig: {
      compilerOptions: {
        strict: true,
        noUncheckedIndexedAccess: true
      }
    }
  },

  eslint: {
    config: {
      // Prettier owns formatting
      stylistic: false
    }
  }
})

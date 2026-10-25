// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs"
import betterTailwindcss from "eslint-plugin-better-tailwindcss"
import { getDefaultAttributes } from "eslint-plugin-better-tailwindcss/api/defaults"
import prettier from "eslint-config-prettier/flat"

export default withNuxt(
  { ignores: ["html_figma_view/**"] },
  betterTailwindcss.configs["correctness-error"],
  {
    settings: {
      "better-tailwindcss": {
        entryPoint: "app/assets/css/main.css",
        attributes: [...getDefaultAttributes(), ["^v-bind:ui$", [{ match: "objectValues" }]]]
      }
    }
  },
  {
    rules: {
      "vue/block-order": ["error", { order: ["template", "script", "style"] }]
    }
  },
  prettier
)

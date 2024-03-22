import { defineConfig } from "astro/config";
import alpine from "@astrojs/alpinejs";
import tailwind from "@astrojs/tailwind";
import wikiLinkPlugin from "remark-wiki-link";
import icon from "astro-icon";
const hrefTemplate = permalink => {
  // const prefix = '/wiki/'
  const prefix = "";
  if (permalink.endsWith("index")) {
    return `${prefix}${permalink.slice(0, -6)}`;
  }
  return `${prefix}${permalink}`;
};


// https://astro.build/config
export default defineConfig({
  integrations: [alpine(), tailwind(), icon()],
  server: {
    port: 8080
  },
  markdown: {
    remarkPlugins: [[wikiLinkPlugin, {
      hrefTemplate: hrefTemplate,
      aliasDivider: "|"
    }]]
  },
  server: {
    port: 1337
  }
  // redirects: {
  //   '/': '/wiki'
  // }
});
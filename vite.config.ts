import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  ssr: {
    external: ['@uiw/react-md-editor']
  },
  server: {
    https: process.env.TLS_KEY 
      ? {
          key: process.env.TLS_KEY.replace(/\\n/g, '\n'),
          cert: process.env.TLS_CERT.replace(/\\n/g, '\n')
        }
      : false,
    host: "local.logmeup.dev"
  }
});

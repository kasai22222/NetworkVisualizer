import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  server: {
    headers: {
      'content-security-policy': "frame-ancestors *"
    },
  },
  plugins: [tailwindcss(), react()],
});

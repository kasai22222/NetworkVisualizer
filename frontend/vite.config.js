import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default ({ mode }) => {

  const env = loadEnv(mode, process.cwd())
  const allowedHosts = env.VITE_ALLOWED_HOSTS?.split(",")

  return defineConfig({
    server: {
      host: true,
      proxy: {
        '/ws': {
          target: 'ws://backend:3000',
          ws: true,
        },
      },
      allowedHosts: allowedHosts ?? [],
      port: 4000,
      headers: {
        'content-security-policy': "frame-ancestors *"
      },
    },
    plugins: [tailwindcss(), react()],
  });
}

import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default ({ mode }) => {

  const env = loadEnv(mode, process.cwd())
  const allowedHosts = env.VITE_ALLOWED_HOSTS?.split(",")

  return defineConfig({
    base: "/NetworkVisualizer/",
    server: {
      host: true,
      // proxy: {
      //   '/ws': {
      //     target: 'wss://backend:3000',
      //     ws: true,
      //     changeOrigin: true,
      //   },
      // },
      allowedHosts: allowedHosts ?? [],
      port: 4000,
      headers: {
        'content-security-policy': "frame-ancestors *"
      },
    },
    plugins: [tailwindcss(), react()],
  });
}

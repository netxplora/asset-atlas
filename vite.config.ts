import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Only split well-known standalone packages that have no internal
          // circular init order issues. Let Vite auto-chunk everything else
          // (especially Radix UI) to avoid TDZ "Cannot access before init" crashes.
          if (id.includes("node_modules")) {
            if (id.includes("@supabase")) return "supabase";
            if (id.includes("recharts") || id.includes("d3-") || id.includes("victory-")) return "recharts";
            if (id.includes("@tanstack/react-query") || id.includes("@tanstack/query-core")) return "tanstack";
            if (
              id.includes("/react/") ||
              id.includes("/react-dom/") ||
              id.includes("/react-router") ||
              id.includes("/scheduler/")
            ) return "react-vendor";
            if (id.includes("lucide-react")) return "lucide";
            // Do NOT force @radix-ui or cmdk into a shared vendor chunk —
            // let Rollup decide to preserve correct initialization order.
          }
        },
      },
    },
  },
}));

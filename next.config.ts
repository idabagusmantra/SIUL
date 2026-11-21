import type { NextConfig } from "next";

// Opsional: izinkan akses dev dari perangkat lain di LAN, mis. SIUL_DEV_ORIGINS=192.168.1.20,192.168.1.21
const devOrigins = (process.env.SIUL_DEV_ORIGINS ?? "").split(",").map(s => s.trim()).filter(Boolean);

const nextConfig: NextConfig = {
  allowedDevOrigins: devOrigins,
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;

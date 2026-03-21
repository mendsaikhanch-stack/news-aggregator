"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export default function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    // Хуудас бүрт хандалт бүртгэх
    fetch(`${API_BASE}/api/analytics/track?path=${encodeURIComponent(pathname)}`, {
      method: "POST",
    }).catch(() => {});
  }, [pathname]);

  return null;
}

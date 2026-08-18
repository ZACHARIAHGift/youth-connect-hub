import { useEffect, useState } from "react";

const KEY = "yc-visitor-id";

export function useVisitorId() {
  const [visitorId, setVisitorId] = useState<string | null>(null);

  useEffect(() => {
    let id = window.localStorage.getItem(KEY);
    if (!id) {
      id = `v_${crypto.randomUUID().replace(/-/g, "")}`;
      window.localStorage.setItem(KEY, id);
    }
    setVisitorId(id);
  }, []);

  return visitorId;
}

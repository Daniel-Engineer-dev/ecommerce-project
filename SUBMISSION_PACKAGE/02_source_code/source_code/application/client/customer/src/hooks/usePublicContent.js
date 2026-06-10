import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";
import { defaultContent } from "../content/defaultContent";

export const usePublicContent = (contentKey) => {
  const fallback = defaultContent[contentKey];
  const [content, setContent] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setHidden(false);
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/content/public/${encodeURIComponent(contentKey)}`,
        );
        const data = await res.json();
        if (!cancelled && data.hidden) {
          setHidden(true);
          setContent(null);
          return;
        }
        if (!cancelled && res.ok && data.item) {
          setContent({
            ...fallback,
            ...data.item,
            data: data.item.data && Object.keys(data.item.data).length
              ? data.item.data
              : fallback?.data,
          });
        }
      } catch (error) {
        if (!cancelled) setContent(fallback);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [contentKey]);

  return { content, data: content?.data || fallback?.data || {}, loading, hidden };
};

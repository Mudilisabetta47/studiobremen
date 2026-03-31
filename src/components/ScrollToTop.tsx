import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
    document.documentElement.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    document.body.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
}

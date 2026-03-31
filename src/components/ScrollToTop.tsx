import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    // Scroll all possible containers
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    document.querySelector("main")?.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

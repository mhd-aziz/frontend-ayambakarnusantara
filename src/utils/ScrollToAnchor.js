import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

function ScrollToAnchor() {
  const location = useLocation();
  const lastHash = useRef("");

  useEffect(() => {
    if (location.hash) {
      lastHash.current = location.hash.slice(1);
    }

    if (lastHash.current && document.getElementById(lastHash.current)) {
      setTimeout(() => {
        const element = document.getElementById(lastHash.current);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
          lastHash.current = "";
        }
      }, 1000);
    }
  }, [location]);

  return null;
}

export default ScrollToAnchor;

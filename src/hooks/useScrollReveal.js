import { useEffect } from "react";

// Content stays visible unless an observer is available to reveal it.
export default function useScrollReveal(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !("IntersectionObserver" in window)) return;
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const elements = [...root.querySelectorAll("[data-reveal]")];
    let observer;

    const reveal = element => {
      element.dataset.revealState = "visible";
      observer?.unobserve(element);
    };
    const setup = () => {
      observer?.disconnect();
      if (motionPreference.matches) {
        elements.forEach(reveal);
        return;
      }
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) reveal(entry.target);
        });
      }, { threshold: 0.08, rootMargin: "0px 0px -20px 0px" });
      elements.forEach(element => {
        if (element.dataset.revealState === "visible") return;
        // Do not briefly hide content already in view, including hash targets.
        const bounds = element.getBoundingClientRect();
        if (bounds.top < window.innerHeight && bounds.bottom > 0) reveal(element);
        else {
          element.dataset.revealState = "pending";
          observer.observe(element);
        }
      });
    };
    const onFocus = event => {
      const element = event.target.closest('[data-reveal-state="pending"]');
      if (element) reveal(element);
    };
    setup();
    root.addEventListener("focusin", onFocus);
    motionPreference.addEventListener("change", setup);
    return () => {
      observer?.disconnect();
      root.removeEventListener("focusin", onFocus);
      motionPreference.removeEventListener("change", setup);
      elements.forEach(element => { delete element.dataset.revealState; });
    };
  }, [rootRef]);
}

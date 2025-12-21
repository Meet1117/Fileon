import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const useGSAPAnimation = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Fade in animations for cards
      gsap.utils.toArray<HTMLElement>(".gsap-fade-in").forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: i * 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      // Scale animations
      gsap.utils.toArray<HTMLElement>(".gsap-scale-in").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, scale: 0.8 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      // Stagger animations for grids
      gsap.utils.toArray<HTMLElement>(".gsap-stagger-container").forEach((container) => {
        const items = container.querySelectorAll(".gsap-stagger-item");
        gsap.fromTo(
          items,
          { opacity: 0, y: 30, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: {
              trigger: container,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return containerRef;
};

export const animateElement = (
  element: HTMLElement | null,
  animation: "fadeIn" | "slideUp" | "scaleIn" | "bounce"
) => {
  if (!element) return;

  const animations = {
    fadeIn: { from: { opacity: 0 }, to: { opacity: 1, duration: 0.5 } },
    slideUp: { from: { opacity: 0, y: 30 }, to: { opacity: 1, y: 0, duration: 0.5 } },
    scaleIn: { from: { opacity: 0, scale: 0.8 }, to: { opacity: 1, scale: 1, duration: 0.4 } },
    bounce: {
      from: { scale: 0 },
      to: { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.5)" },
    },
  };

  const anim = animations[animation];
  gsap.fromTo(element, anim.from, anim.to);
};

export const createRipple = (event: React.MouseEvent<HTMLElement>) => {
  const button = event.currentTarget;
  const rect = button.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const ripple = document.createElement("span");
  ripple.style.cssText = `
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: scale(0);
    pointer-events: none;
    left: ${x}px;
    top: ${y}px;
    width: 100px;
    height: 100px;
    margin-left: -50px;
    margin-top: -50px;
  `;

  button.style.position = "relative";
  button.style.overflow = "hidden";
  button.appendChild(ripple);

  gsap.to(ripple, {
    scale: 4,
    opacity: 0,
    duration: 0.6,
    onComplete: () => ripple.remove(),
  });
};

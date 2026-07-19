import Navbar from "../components/navbar";
import Hero from "../components/hero";
import About from "../components/about";
import Services from "../components/services";

import "./Home.css";

import { useEffect } from "react";
import AccentBanner from "../components/Accentbanner";

import WhatToExpect from "../components/expect";
import ReviewGallery from "../components/ReviewGallery";

export default function Home() {
  useEffect(() => {
    const section = document.querySelector(".services-rich");

    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          section.classList.remove("animate-typing");

          // animation restart karanna
          void (section as HTMLElement).offsetWidth;

          section.classList.add("animate-typing");
        } else {
          section.classList.remove("animate-typing");
        }
      },
      {
        threshold: 0.35,
      }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Navbar />
      <Hero />
      <AccentBanner />
      <About />


      <WhatToExpect />

      <Services />
      <ReviewGallery />


    </>
  );
}
'use client';

import { useState, useEffect, useCallback } from 'react';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  backgroundImages: string[];
  ctaText: string;
  ctaHref: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  autoPlayInterval?: number;
}

export default function HeroSection({
  title,
  subtitle,
  backgroundImages,
  ctaText,
  ctaHref,
  secondaryCtaText,
  secondaryCtaHref,
  autoPlayInterval = 5000
}: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 700);
  }, [isTransitioning]);

  const goToNext = useCallback(() => {
    const nextIndex = (currentIndex + 1) % backgroundImages.length;
    goToSlide(nextIndex);
  }, [currentIndex, backgroundImages.length, goToSlide]);

  const goToPrevious = useCallback(() => {
    const prevIndex = (currentIndex - 1 + backgroundImages.length) % backgroundImages.length;
    goToSlide(prevIndex);
  }, [currentIndex, backgroundImages.length, goToSlide]);

  // Auto-play
  useEffect(() => {
    if (backgroundImages.length <= 1) return;
    
    const interval = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(interval);
  }, [goToNext, autoPlayInterval, backgroundImages.length]);

  return (
    <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden floating-particles">
      {/* Background Images Carousel */}
      <div className="absolute inset-0 z-0">
        {backgroundImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              index === currentIndex 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-105'
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt={`Hero background ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-secondary/60" />
      </div>

      {/* Navigation Arrows */}
      {backgroundImages.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 z-20 p-3 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/40 transition-all duration-300 hover:scale-110 group"
            aria-label="Imagen anterior"
          >
            <svg className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 z-20 p-3 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/40 transition-all duration-300 hover:scale-110 group"
            aria-label="Siguiente imagen"
          >
            <svg className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-5">
        <div className="absolute top-20 left-10 w-20 h-20 bg-accent/20 rounded-full animate-float"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-secondary/20 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-32 left-1/4 w-12 h-12 bg-accent/30 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-1/3 w-24 h-24 bg-primary/20 rounded-full animate-float" style={{ animationDelay: '0.5s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight animate-fade-in-up">
          {title}
        </h1>
        <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {subtitle}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={ctaHref}
            className="bg-accent hover:bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 animate-fade-in-up"
            style={{ animationDelay: '0.4s' }}
          >
            {ctaText}
          </a>
          {secondaryCtaText && secondaryCtaHref && (
            <a
              href={secondaryCtaHref}
              className="border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 hover:scale-105 animate-fade-in-up"
              style={{ animationDelay: '0.6s' }}
            >
              {secondaryCtaText}
            </a>
          )}
        </div>
      </div>

      {/* Carousel Indicators */}
      {backgroundImages.length > 1 && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20 flex space-x-3">
          {backgroundImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? 'w-8 h-3 bg-white'
                  : 'w-3 h-3 bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Ir a imagen ${index + 1}`}
            />
          ))}
        </div>
      )}

    </section>
  );
}

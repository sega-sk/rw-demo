import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  structuredData?: object;
}

export default function SEOHead({
  title = 'Reel Wheels Experience - Authentic Movie Vehicle Rentals & Memorabilia',
  description = 'Rent iconic movie vehicles like the Batmobile, DeLorean, and Ecto-1. Premium collection of authentic film cars and memorabilia for events, parties, and productions.',
  keywords = 'movie car rental, Batmobile rental, DeLorean rental, film vehicle rental, movie memorabilia, Hollywood cars, event rentals',
  image = '/vdp hero (2).webp',
  url = 'https://reelwheelsexperience.com/',
  type = 'website',
  structuredData
}: SEOHeadProps) {
  const fullImageUrl = image.startsWith('http') ? image : `${url}${image}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="Reel Wheels Experience" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}
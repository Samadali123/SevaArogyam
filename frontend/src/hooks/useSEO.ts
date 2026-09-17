import { useEffect } from 'react';

interface SEOOptions {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
}

export const useSEO = ({
  title,
  description,
  keywords,
  canonical = 'https://jansevaarogyam.com/',
  ogTitle,
  ogDescription,
}: SEOOptions) => {
  useEffect(() => {
    // 1. Update Title
    const defaultTitle = 'Jansevarogyam | Specialist OPD Hospital & Healthcare Network - Sarangpur, Shujalpur, Rajgarh';
    document.title = title ? `${title} | Jansevarogyam` : defaultTitle;

    // 2. Helper to set or create meta tag
    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let element = document.querySelector(selector) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        if (isProperty) {
          element.setAttribute('property', name);
        } else {
          element.setAttribute('name', name);
        }
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 3. Update Meta Description
    const defaultDesc = 'Jansevarogyam (जनसेवा आरोग्यम) provides specialist doctor OPD appointments, 24x7 ICU emergency, lab tests, pharmacy & regional healthcare across Sarangpur, Shujalpur, and Rajgarh, MP.';
    setMetaTag('description', description || defaultDesc);

    // 4. Update Meta Keywords
    const defaultKeywords = 'jansevaarogyam, Janseva Arogyam, Janseva, Arogyam, Janseva Arogyam Clinic, Janseva Arogyam Hospital, जनसेवा आरोग्यम, जनसेवा, आरोग्यम, Sarangpur hospital, Shujalpur clinic, Rajgarh doctor booking, OPD appointment online';
    setMetaTag('keywords', keywords ? `${keywords}, ${defaultKeywords}` : defaultKeywords);

    // 5. Update OpenGraph Meta Tags
    setMetaTag('og:title', ogTitle || title || defaultTitle, true);
    setMetaTag('og:description', ogDescription || description || defaultDesc, true);
    setMetaTag('og:url', canonical, true);

    // 6. Update Canonical Link
    let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonical);
  }, [title, description, keywords, canonical, ogTitle, ogDescription]);
};

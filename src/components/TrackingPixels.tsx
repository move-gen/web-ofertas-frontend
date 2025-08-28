'use client';

import { useEffect } from 'react';
import { trackingConfig } from '@/lib/tracking-config';

export default function TrackingPixels() {
  const { facebookPixelId, clarityId, gtmId } = trackingConfig;
  useEffect(() => {
    // Meta Pixel (Facebook)
    if (facebookPixelId) {
      // @ts-ignore
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src='https://connect.facebook.net/en_US/fbevents.js';
      s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script');
      
      // @ts-ignore
      fbq('init', facebookPixelId);
      // @ts-ignore
      fbq('track', 'PageView');
    }

    // Microsoft Clarity
    if (clarityId) {
      // @ts-ignore
      (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", clarityId);
    }

    // Google Tag Manager
    if (gtmId) {
      // @ts-ignore
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer',gtmId);
    }
  }, []);

  return (
    <>
      {/* Meta Pixel noscript fallback */}
      {facebookPixelId && (
        <noscript>
          <img 
            height="1" 
            width="1" 
            style={{ display: 'none' }}
            src={`https://www.facebook.com/tr?id=${facebookPixelId}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
      )}

      {/* Google Tag Manager noscript fallback */}
      {gtmId && (
        <noscript>
          <iframe 
            src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
            height="0" 
            width="0" 
            style={{ display: 'none', visibility: 'hidden' }}
            title="Google Tag Manager"
          />
        </noscript>
      )}
    </>
  );
}

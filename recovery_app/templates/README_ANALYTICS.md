# Analytics Setup Instructions

## Google Analytics Setup

1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new property for your website
3. Copy your Measurement ID (format: GA_MEASUREMENT_ID)
4. In `recovery_app/templates/base.html`, replace `GA_MEASUREMENT_ID` with your actual ID

Example:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
</script>
```

## Yandex Metrica Setup

1. Go to [Yandex Metrica](https://metrica.yandex.com/)
2. Create a new counter for your website
3. Copy your Counter ID (format: XXXXXXXX)
4. In `recovery_app/templates/base.html`, replace `YANDEX_METRIKA_ID` with your actual ID

Example:
```html
ym(12345678, "init", {
    clickmap:true,
    trackLinks:true,
    accurateTrackBounce:true,
    webvisor:true
});
```

## Testing

After replacing the IDs, test your analytics:
1. Google Analytics: Check Real-Time reports
2. Yandex Metrica: Check Visitors report

## SEO Features Added

- Structured Data (JSON-LD) for better search engine understanding
- Open Graph meta tags for social media sharing  
- Twitter Card meta tags
- XML Sitemap at `/sitemap.xml`
- Robots.txt at `/robots.txt`
- Canonical URLs
- Proper meta descriptions and keywords 
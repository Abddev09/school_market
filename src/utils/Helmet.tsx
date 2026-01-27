import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

interface HelmetProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
}


const routeToDefault = {
  "/": {
    title: "255-School Humo — Maktab do'koni",
    description:
      "255-School Humo — maktab uchun barcha kerakli mahsulotlar: daftar, qalam, sumka, o‘quv qurollari va boshqalar. Ball evaziga sovg‘alar oling!",
    keywords:
      "maktab, humo255, daftar, qalam, sumka, o‘quv qurollari, 255 School Market, Humo 255",
  },
  "/login": {
    title: "Tizimga kirish — 255-School Humo",
    description:
      "255-School Humo tizimiga kirish sahifasi. Hisobingiz orqali maktab do‘koniga kirib, ball to‘plang va sovg‘alar oling.",
    keywords: "login, tizimga kirish, humo255, 255 school",
  },
};

export default function HelmetPage({
  title,
  description,
  keywords,
  image,
}: HelmetProps) {
  const { pathname } = useLocation();

  const defaults = routeToDefault[pathname as keyof typeof routeToDefault] || routeToDefault["/"];

  const finalTitle = title || defaults.title;
  const finalDesc = description || defaults.description;
  const finalKeywords = keywords || defaults.keywords;
  const finalImage = image || `https://humo255.uz/logo.png`;

  const url = `https://humo255.uz${pathname}`;

  return (
    <Helmet prioritizeSeoTags>
      {/* Basic SEO */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDesc} />
      <meta name="keywords" content={finalKeywords} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={url} />
      <meta name="author" content="255-School Humo" />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDesc} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="255-School Humo" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDesc} />
      <meta name="twitter:image" content={finalImage} />

      {/* JSON-LD Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          url,
          name: finalTitle,
          description: finalDesc,
          image: finalImage,
          publisher: {
            "@type": "Organization",
            name: "255-School Humo",
            logo: `https://humo255.uz/logo.png`,
          },
          inLanguage: "uz",
        })}
      </script>

      {/* Theme color */}
      <meta name="theme-color" content="#0b3d91" />
    </Helmet>
  );
}

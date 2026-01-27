import React from "react";
import { Helmet } from "react-helmet-async";

interface PageProps {
  children?: React.ReactNode;
}

const HelemtProviders: React.FC<PageProps> = ({ children }) => {
  return (
    <>
      <Helmet>
        <title>255-School Humo — Maktab do'koni</title>
        <meta
          name="description"
          content="255-School Humo — maktab uchun barcha kerakli mahsulotlar: daftar, qalam, sumka va boshqalar. Ball evaziga erishish imkoniyati."
        />
        <meta
          name="keywords"
          content="maktab, 255humo, humo255, humo255.uz, daftar, qalam, sumka, o‘quv qurollari, 255 School Market"
        />
        <meta name="author" content="humo255.uz" />
        <meta name="robots" content="index, follow" />

        {/* Open Graph */}
        <meta property="og:title" content="255-School Humo — Maktab do'koni" />
        <meta
          property="og:description"
          content="Maktab uchun barcha kerakli narsalar: daftar, qalam, sumka va boshqalar. Ball evaziga erishish."
        />
        <meta property="og:image" content="https://humo255.uz/logo.png" />
        <meta property="og:url" content="https://humo255.uz/" />
        <meta property="og:type" content="website" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="255-School Humo — Maktab uchun mahsulotlar" />
        <meta
          name="twitter:description"
          content="Maktab uchun daftar, qalam, sumka va boshqalar. Ball evaziga erishish."
        />
        <meta name="twitter:image" content="https://humo255.uz/logo.png" />

        <meta name="theme-color" content="#0b3d91" />
      </Helmet>

      <div>
        {children}
      </div>
    </>
  );
};

export default HelemtProviders;

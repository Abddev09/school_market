import React from "react";

interface HumoCardProps {
  fullName: string;
  balance: string;
}

const HumoCard: React.FC<HumoCardProps> = ({ fullName, balance }) => {
  return (
    <div
      className="relative w-[360px] h-[220px] rounded-2xl overflow-hidden shadow-lg bg-cover bg-center"
      style={{
        backgroundImage: "url('/images/humo-card-bg.png')", // 🔥 rasm joylashuvi
      }}
    >
      {/* Balans */}
      <div className="absolute left-6 bottom-16 text-white text-lg font-semibold drop-shadow-md">
        💰 {balance}
      </div>

      {/* Ism familiya */}
      <div className="absolute bottom-5 left-6 text-yellow-400 font-medium text-sm tracking-wide">
        {fullName}
      </div>

      {/* Optional gradient overlay (xohlasang yo‘q qilsa ham bo‘ladi) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
    </div>
  );
};

export default HumoCard;

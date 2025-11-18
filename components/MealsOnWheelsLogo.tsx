import Image from "next/image";

export default function MealsOnWheelsLogo({ className = "" }: { className?: string }) {
  const logoSrc = `/assets/meals-on-wheels-logo.png?v=${Date.now()}`;

  return (
    <div className={`overflow-hidden ${className}`}>
      <Image
        src={logoSrc}
        alt="Meals on Wheels Logo"
        width={288}
        height={115}
        className="w-full h-auto object-cover"
        priority
        unoptimized
      />
    </div>
  );
}


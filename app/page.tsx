import LandingPage from "@/components/LandingPage";
import { defaultContent } from "@/data/defaults";

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: "Hotel Kausi",
    image: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/images/hotel-exterior-night.jpg`,
    description: defaultContent.about.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Lakeside Road, Main Lane between 4th & 5th Street",
      addressLocality: "Pokhara",
      postalCode: "33700",
      addressCountry: "NP",
    },
    telephone: defaultContent.contact.phone,
    email: defaultContent.contact.email,
    priceRange: "NPR 6,200–8,500",
    amenityFeature: ["Free Wi-Fi", "Restaurant", "Airport shuttle", "24-hour front desk", "Private parking"].map((name) => ({ "@type": "LocationFeatureSpecification", name, value: true })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <LandingPage initialContent={defaultContent} />
    </>
  );
}

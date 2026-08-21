import HomeDataProvider from "../context/HomeDataProvider";

import HeroSection from "../sections/home/HeroSection";
import CategoriesPreview from "../sections/home/CategoriesPreview";
import FeaturedPreview from "../sections/home/FeaturedPreview";

function Home() {
  return (
    <HomeDataProvider>
      <main>
        <HeroSection />
        <CategoriesPreview />
        <FeaturedPreview />
      </main>
    </HomeDataProvider>
  );
}

export default Home;
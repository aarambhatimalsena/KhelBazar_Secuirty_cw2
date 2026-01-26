import React from "react";
import HeroSlider from "../components/common/HeroSlider";
import PromoSection from "../components/common/PromoSection";
import FeaturedCategories from "../components/common/FeaturedCategoires";
import BannerSection from "../components/common/BannerSection";
const Home = () => (
  <div>
    <HeroSlider />
    <PromoSection />
    <BannerSection />  
    <FeaturedCategories />
  </div>
);

export default Home;

import React, { useState, useEffect } from 'react';
import './Home.scss';
import Services from '../../component/services/Services';
import Trending from '../../component/trending/Trending';
import Collections from '../../component/collections/Collections';
import { Banner } from '../../component/banner/Banner';
import AboutSection from '../../component/about/AboutSection';
import AboutInfoSection from '../../component/about/aboutinfo';
import Schemess from '../../component/schemess/Schemes';
import Hero from '../../component/hero/Hero';

const API_URL = process.env.REACT_APP_API_URL || '';

const Home = () => {
  const [latestImageUrl, setLatestImageUrl] = useState(null);
  const [isPopupVisible, setIsPopupVisible] = useState(true);

  useEffect(() => {
    const fetchLatestImage = async () => {
      try {
        const res = await fetch(`${API_URL}/api/images/latest`);
        const data = await res.json();
        if (data && data.url) {
          setLatestImageUrl(`${API_URL}${data.url}`);
        }
      } catch (e) {
        console.error('Failed to fetch latest image', e);
      }
    };

    fetchLatestImage();
  }, []);

  const closePopup = () => {
    setIsPopupVisible(false);
  };

  return (
    <>
      {latestImageUrl && isPopupVisible && (
        <div
          className="popup"
          onClick={closePopup}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            zIndex: 1000,
          }}
        >
          <img
            src={latestImageUrl}
            alt="Latest Uploaded"
            style={{ maxHeight: '90%', maxWidth: '90%' }}
          />
        </div>
      )}

      <div className="hero_image m_70">
        <Hero />
      </div>
      <div className="mx_width themeContainer">
        <Services />
        <Trending />
        <Collections />
      </div>
      <div className="fluid">
        <Banner />
      </div>
      <h1 style={{ textAlign: 'center', fontFamily: '"El Messiri", sans-serif' }}>
        About Us
      </h1>
      <AboutSection />
      <AboutInfoSection />

      <h1 style={{ textAlign: 'center', fontFamily: '"El Messiri", sans-serif' }}>
        Schemes
      </h1>
      <Schemess />

      <div className="mx_width themeContainer m_70">
        {/* <Blog/> */}
      </div>
    </>
  );
};

export default Home;

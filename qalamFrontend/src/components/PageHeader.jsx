import React, { useState, useEffect } from 'react';
import { headingData } from '../utils/headingData';

const PageHeader = ({ pageType }) => {
  const [heading, setHeading] = useState({ title: '', subtitle: '' });

  useEffect(() => {
    const headings = headingData[pageType] || [];
    if (headings.length > 0) {
      const randomIndex = Math.floor(Math.random() * headings.length);
      setHeading(headings[randomIndex]);
    }
  }, [pageType]);

  return (
    <div className="text-center my-8 md:my-12">
      <h1 
        className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent pb-2"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        {heading.title}
      </h1>
      <p className="text-md md:text-lg text-gray-500 mt-2">
        {heading.subtitle}
      </p>
    </div>
  );
};

export default PageHeader; 
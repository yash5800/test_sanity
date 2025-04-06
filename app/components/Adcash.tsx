/* eslint-disable @typescript-eslint/ban-ts-comment */
'use client'

import { useEffect } from 'react';

export default function AdcashScript() {
  useEffect(() => {
    // Load the Adcash library
    const loader = document.createElement('script');
    loader.src = 'https://acscdn.com/script/aclib.js';
    loader.async = true;
    loader.onload = () => {
      // Run auto tag once the library is loaded
      // @ts-ignore
      aclib.runAutoTag({
        zoneId: 'or8r0azzdy',
      });
    };
    document.body.appendChild(loader);
  }, []);

  return null;
}

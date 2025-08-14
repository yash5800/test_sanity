import React from 'react'
import Script from 'next/script'

type AdSenseProps = {
  pId: string;
}

const AdSense = ({ pId }: AdSenseProps) => {
  return (
    <>
      <meta name="google-adsense-account" content="ca-pub-6889447229726755"></meta>
      <Script 
         async 
         src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${pId}`}
        crossOrigin='anonymous'
        strategy="afterInteractive"
      />
    </>
    
  )
}

export default AdSense
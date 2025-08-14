"use client"
import React, { useEffect } from 'react'

type AdBannerProps = {
  dataAdSlot: string;
  dataAdFormat: string;
  dataFullWidthResponsive: boolean;
}

const AdBanner = ({
  dataAdSlot,
  dataAdFormat,
  dataFullWidthResponsive
}: AdBannerProps)  => {
  useEffect(()=>{
    try{
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    }catch(e){
      console.error(e);
    }
  },[])
  return (
    <ins
      className='adsbygoogle'
      style={{ display: 'block'}}
      data-ad-client='ca-pub-6889447229726755'
      data-ad-slot={dataAdSlot}
      data-ad-format={dataAdFormat}
      data-full-width-responsive={dataFullWidthResponsive.toString()}
    >
      
    </ins>
  )
}

export default AdBanner
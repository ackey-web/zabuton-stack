'use client';

import { useState, useEffect } from 'react';

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
}

export function useDevice(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenWidth: 1024,
    screenHeight: 768,
  });

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // User Agent による判定（補助的）
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileUA = /iphone|ipod|android.*mobile|windows phone/i.test(userAgent);
      const isTabletUA = /ipad|android(?!.*mobile)/i.test(userAgent);

      // 画面サイズによる判定（メイン）
      const isMobile = width < 768 || isMobileUA;
      const isTablet = (width >= 768 && width < 1024) || isTabletUA;
      const isDesktop = width >= 1024 && !isMobileUA && !isTabletUA;

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        screenWidth: width,
        screenHeight: height,
      });
    };

    // 初回チェック
    checkDevice();

    // リサイズ時に再判定
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return deviceInfo;
}

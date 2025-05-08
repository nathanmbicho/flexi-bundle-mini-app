"use client";

import React from 'react';
import Script from 'next/script';

const AlipayScriptLoader: React.FC = () => {
    return (
        <Script
            src="https://appx/web-view.min.js"
            strategy="beforeInteractive"
            onLoad={() => {
                console.log('AlipayJSBridge script loaded successfully');
            }}
            onError={(e) => {
                console.error('Error loading AlipayJSBridge script:', e);
            }}
        />
    );
};

export default AlipayScriptLoader;
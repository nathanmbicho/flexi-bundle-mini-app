"use client";

import React from 'react';
import AlipayScriptLoader from "@/app/components/AlipayScriptLoader";
import AlipayPayment from "@/app/components/AlipayPaymentComponent";

// Define the response types (same as in the component for consistency)
interface AlipaySuccessResponse {
    transactionId?: string;
    [key: string]: unknown;
}

interface AlipayFailResponse {
    message?: string;
    [key: string]: unknown;
}

const App: React.FC = () => {
    const handlePaymentSuccess = (response: AlipaySuccessResponse) => {
        console.log('Payment was successful!', response);
        // Additional success logic here
    };

    const handlePaymentFail = (response: AlipayFailResponse) => {
        console.log('Payment failed:', response);
        // Additional failure logic here
    };

    return (
        <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-6">
            {/* Load the AlipayJSBridge script */}
            <AlipayScriptLoader />

            <h1 className="text-2xl font-bold mb-8">Alipay Payment Demo</h1>x
            {/* Example with all props */}
            <div className="p-4 bg-white rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-lg font-semibold mb-4">Complete Payment</h2>
                <AlipayPayment
                    amount="250"
                    businessID="123456"
                    reason="Premium subscription payment"
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentFail={handlePaymentFail}
                />
            </div>
        </div>
    );
};

export default App;
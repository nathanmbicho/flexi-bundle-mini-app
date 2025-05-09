"use client";

import React, { useState, useEffect } from 'react';

interface AlipaySuccessResponse {
    transactionId?: string;
    [key: string]: unknown;
}

interface AlipayFailResponse {
    message?: string;
    [key: string]: unknown;
}

// AlipayJSBridge
interface AlipayJSBridge {
    call(
        apiName: string,
        params: Record<string, unknown>,
        successCallback?: (response: AlipaySuccessResponse) => void,
        failCallback?: (response: AlipayFailResponse) => void,
        completeCallback?: () => void
    ): void;
}

interface AlipayPaymentProps {
    amount: string;
}

declare global {
    interface Window {
        AlipayJSBridge?: AlipayJSBridge;
    }
}

const AlipayPayment: React.FC<AlipayPaymentProps> = ({amount}) => {
    const [isAlipayBridgeAvailable, setIsAlipayBridgeAvailable] = useState<boolean>(false);
    const [paymentStatus, setPaymentStatus] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // check if AlipayJSBridge is available
    useEffect(() => {
        const checkAlipayBridge = () => {
            if (typeof window !== 'undefined') {
                if (window.AlipayJSBridge) {
                    setIsAlipayBridgeAvailable(true);
                    console.log('AlipayJSBridge is available');
                } else {
                    console.log('AlipayJSBridge is not available');
                }
            }
        };

        checkAlipayBridge();

        // event if AlipayJSBridge is available
        if (typeof document !== 'undefined') {
            document.addEventListener('AlipayJSBridgeReady', checkAlipayBridge);
        }

        return () => {
            if (typeof document !== 'undefined') {
                document.removeEventListener('AlipayJSBridgeReady', checkAlipayBridge);
            }
        };
    }, []);

    // Handle payment function
    const handlePayment = () => {
        if (!isAlipayBridgeAvailable) {
            alert('Payment service is currently unavailable. Please ensure you are using the Alipay Mini Program.');
            return;
        }

        setIsLoading(true);
        setPaymentStatus('processing');

        // create a reference number
        // const billReference = `FLEXI${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)}`;

        try {
            window.AlipayJSBridge?.call(
                'buyGoods',
                {
                    tillNumber: '89900',
                    amount: amount,
                    currency: 'KES',
                    reason: "Flexi Bundle Purchase"
                } as Record<string, unknown>,
                (res: AlipaySuccessResponse) => {
                    // payment success
                    console.log('Payment successful', res);
                    setPaymentStatus('success');
                    setIsLoading(false);

                    // show a success message with transaction details
                    window.AlipayJSBridge?.call(
                        'alert',
                        {
                            title: 'Success',
                            content: `Payment successful!\nTransaction ID: ${res.transactionId || 'N/A'}`
                        } as Record<string, unknown>,
                        () => {}
                    );
                },
                (res: AlipayFailResponse) => {
                    // Payment failed
                    console.log('Payment failed', res);
                    setPaymentStatus('failed');
                    setIsLoading(false);

                    // show an error message
                    window.AlipayJSBridge?.call(
                        'alert',
                        {
                            title: 'Payment Failed',
                            content: res.message || 'An error occurred during payment'
                        } as Record<string, unknown>,
                        () => {}
                    );
                }
            );

            window.location.reload();
        } catch (error) {
            console.error('Payment error:', error);
            setPaymentStatus('failed');
            setIsLoading(false);

            // show error
            if (window.AlipayJSBridge) {
                window.AlipayJSBridge.call(
                    'alert',
                    {
                        title: 'Error',
                        content: `Payment error: ${error instanceof Error ? error.message : String(error)}`
                    } as Record<string, unknown>,
                    () => {}
                );
            } else {
                alert(`Payment error: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
    };

    return (
        <div className="flex flex-col items-center">
            <button
                onClick={handlePayment}
                disabled={!isAlipayBridgeAvailable || isLoading}
                className={`w-full py-3 rounded-lg font-medium text-center ${
                    !isAlipayBridgeAvailable || isLoading
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                }`}
            >
                {isLoading ? 'Processing...' : `Confirm and Pay KES ${amount}`}
            </button>

            {paymentStatus === 'processing' && (
                <p className="mt-2 text-yellow-600">Processing payment...</p>
            )}
            {paymentStatus === 'success' && (
                <p className="mt-2 text-green-600">Payment successful!</p>
            )}
            {paymentStatus === 'failed' && (
                <p className="mt-2 text-red-600">Payment failed. Please try again.</p>
            )}
            {!isAlipayBridgeAvailable && (
                <p className="mt-2 text-red-600">
                    AlipayJSBridge is not available.
                </p>
            )}
        </div>
    );
};

export default AlipayPayment;
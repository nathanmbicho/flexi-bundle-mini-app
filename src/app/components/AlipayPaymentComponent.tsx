"use client";

import React, { useState, useEffect } from 'react';

// Define types for Alipay responses
interface AlipaySuccessResponse {
    transactionId?: string;
    [key: string]: unknown;
}

interface AlipayFailResponse {
    message?: string;
    [key: string]: unknown;
}

// Define type for AlipayJSBridge
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
    businessID: string;
    reason?: string;
    onPaymentSuccess?: (response: AlipaySuccessResponse) => void;
    onPaymentFail?: (response: AlipayFailResponse) => void;
}

// Define a type for the window object with AlipayJSBridge
declare global {
    interface Window {
        AlipayJSBridge?: AlipayJSBridge;
    }
}

const AlipayPayment: React.FC<AlipayPaymentProps> = ({
                                                         amount,
                                                         businessID,
                                                         reason = "Payment",
                                                         onPaymentSuccess,
                                                         onPaymentFail
                                                     }) => {
    const [isAlipayBridgeAvailable, setIsAlipayBridgeAvailable] = useState<boolean>(false);
    const [paymentStatus, setPaymentStatus] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Check if AlipayJSBridge is available
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

        // Add an event listener for when AlipayJSBridge becomes available
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

        // Create a reference number from the current date + random digits
        const billReference = `REF${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)}`;

        try {
            window.AlipayJSBridge?.call(
                'payBill',
                {
                    businessID: businessID,
                    billReference: billReference,
                    amount: amount,
                    currency: 'KES', // Only KES supported currently
                    reason: reason,
                } as Record<string, unknown>,
                (res: AlipaySuccessResponse) => {
                    // Payment success
                    console.log('Payment successful', res);
                    setPaymentStatus('success');
                    setIsLoading(false);

                    // Call the success callback if provided
                    if (onPaymentSuccess) {
                        onPaymentSuccess(res);
                    }

                    // Show a success message with transaction details
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

                    // Call the fail callback if provided
                    if (onPaymentFail) {
                        onPaymentFail(res);
                    }

                    // Show an error message
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
        } catch (error) {
            console.error('Payment error:', error);
            setPaymentStatus('failed');
            setIsLoading(false);

            // Show error in native alert
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
                className={`px-6 py-2 rounded-lg font-medium ${
                    !isAlipayBridgeAvailable || isLoading
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                }`}
            >
                {isLoading ? 'Processing...' : `Pay KES ${amount}`}
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
                    AlipayJSBridge is not available. Please ensure you&#39;re using the Alipay Mini Program.
                </p>
            )}
        </div>
    );
};

export default AlipayPayment;
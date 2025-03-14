"use client"
import React, { useState } from 'react';
import Head from 'next/head';

// Define types
interface ServiceSelection {
    airtime: boolean;
    dataBundles: boolean;
    callMinutes: boolean;
    sms: boolean;
}

interface BundleDetails {
    airtime: number;
    dataBundles: number;
    callMinutes: number;
    sms: number;
    validity: string;
}

interface ValidityOption {
    value: string;
    label: string;
}

interface ValidityMultipliers {
    [key: string]: {
        dataBundles: number;
        callMinutes: number;
        sms: number;
    };
}

interface BaseRates {
    dataBundles: number;
    callMinutes: number;
    sms: number;
    airtime: number;
}

export default function Home() {
    const [step, setStep] = useState<number>(1);
    const [selectedServices, setSelectedServices] = useState<ServiceSelection>({
        airtime: false,
        dataBundles: false,
        callMinutes: false,
        sms: false
    });

    const [bundleDetails, setBundleDetails] = useState<BundleDetails>({
        airtime: 0,
        dataBundles: 0,
        callMinutes: 0,
        sms: 0,
        validity: ''
    });

    const validityOptions: ValidityOption[] = [
        { value: '1hour', label: 'Valid for 1 hour' },
        { value: '3hours', label: 'Valid for 3 hours' },
        { value: '6hours', label: 'Valid for 6 hours' },
        { value: 'midnight', label: 'Valid till Midnight' },
        { value: '24hours', label: 'Valid for 24hrs' },
        { value: '3days', label: 'Valid for 3 days' },
        { value: '7days', label: 'Valid for 7 Days' },
        { value: '30days', label: 'Valid for 30 days' }
    ];

    const validityMultipliers: ValidityMultipliers = {
        '1hour': { dataBundles: 0, callMinutes: 0 , sms: 0 }, // Base price
        '3hours': { dataBundles: 0.5, callMinutes: 0.3, sms: 0.2 },
        '6hours': { dataBundles: 0.10, callMinutes: 0.6, sms: 0.3  },
        'midnight': { dataBundles: 0.15, callMinutes: 0.9, sms: 0.4  },
        '24hours': { dataBundles: 0.20, callMinutes: 1.2, sms: 0.5  },
        '3days': { dataBundles: 0.25, callMinutes: 1.5, sms: 0.6  },
        '7days': { dataBundles: 0.30, callMinutes: 1.8, sms: 0.7  },
        '30days': { dataBundles: 0.35, callMinutes: 2.4, sms: 0.8  }
    };

    const baseRates: BaseRates = {
        airtime: 1, // 1:1 for airtime
        sms: 0.5, // 0.5  bob per SMS
        dataBundles: 1.2, // 1.2 bob per MB
        callMinutes: 1.5 // 1.6 bob per minute
    };

    const handleServiceSelection = (service: keyof ServiceSelection): void => {
        setSelectedServices({
            ...selectedServices,
            [service]: !selectedServices[service]
        });
    };

    const handleBundleDetailsChange = (service: keyof BundleDetails, value: string): void => {
        setBundleDetails({
            ...bundleDetails,
            [service]: parseInt(value) || 0
        });
    };

    const handleValidityChange = (validity: string): void => {
        setBundleDetails({
            ...bundleDetails,
            validity
        });
    };

    const calculateTotal = (): string => {
        const { dataBundles, callMinutes, sms, airtime, validity } = bundleDetails;

        if (!validity) {
            return '0.00';
        }

        const multipliers = validityMultipliers[validity];

        let total = 0;

        if (selectedServices.dataBundles && dataBundles > 0) {
            const basePrice = dataBundles * baseRates.dataBundles;
            const additionalCost = basePrice * multipliers.dataBundles;
            total += basePrice + additionalCost;
        }

        if (selectedServices.callMinutes && callMinutes > 0) {
            const basePrice = callMinutes * baseRates.callMinutes;
            const additionalCost = basePrice * multipliers.callMinutes;
            total += basePrice + additionalCost;
        }

        if (selectedServices.sms && sms > 0) {
            const basePrice = sms * baseRates.sms;
            const additionalCost = basePrice * multipliers.sms;
            total += basePrice + additionalCost;
        }

        if (selectedServices.airtime && airtime > 0) {
            total += airtime * baseRates.airtime;
        }

        return Math.round(total).toFixed(2);
    };

    const nextStep = (): void => {
        setStep(step + 1);
    };

    const prevStep = (): void => {
        setStep(step - 1);
    };

    const hasSelectedAtLeastOne = Object.values(selectedServices).some(value => value);

    const hasFilledRequiredFields = (): boolean => {
        for (const service in selectedServices) {
            if (
                selectedServices[service as keyof ServiceSelection] &&
                service !== 'validity' &&
                (bundleDetails[service as keyof Omit<BundleDetails, 'validity'>] <= 0)
            ) {
                return false;
            }
        }
        return bundleDetails.validity !== '';
    };

    return (
        <div className="min-h-screen bg-green-50">
            <Head>
                <title>Safaricom Flexi Bundle</title>
                <meta name="description" content="Create your custom data bundle purchase" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            {/* Header */}
            <header className="bg-green-600 text-white py-4 shadow-md">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <div className="flex items-center">
                        <svg className="w-8 h-8 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 7h18M3 12h18M3 17h12" stroke="white" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <h1 className="text-xl font-bold">M-PESA</h1>
                    </div>
                </div>
            </header>

            <main className="container mx-auto py-6 px-4 max-w-md">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
                    {/* Title Bar */}
                    <div className="bg-green-600 text-white py-3 px-4">
                        <h2 className="text-lg font-semibold text-center">Flexi Bundle</h2>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                        {/* Step Indicator */}
                        <div className="mb-6">
                            <div className="flex justify-between">
                                {[1, 2, 3].map((stepNumber) => (
                                    <div key={stepNumber} className="flex flex-col items-center">
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 
                                            ${step === stepNumber
                                                ? 'border-green-600 bg-green-600 text-white'
                                                : step > stepNumber
                                                    ? 'border-green-600 bg-green-100 text-green-600'
                                                    : 'border-gray-300 bg-gray-100 text-gray-500'}`}
                                        >
                                            {step > stepNumber ? '✓' : stepNumber}
                                        </div>
                                        <span className={`text-xs mt-1 ${step >= stepNumber ? 'text-green-600' : 'text-gray-500'}`}>
                                            {stepNumber === 1 ? 'Select' : stepNumber === 2 ? 'Details' : 'Confirm'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-2 overflow-hidden h-1 rounded-full bg-gray-200">
                                <div
                                    className="h-full bg-green-600 transition-all duration-300"
                                    style={{ width: `${(step - 1) * 50}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Step 1: Service Selection */}
                        {step === 1 && (
                            <div>
                                <h3 className="text-green-700 font-bold mb-4">Select Services</h3>
                                <p className="text-gray-600 mb-4 text-sm">Choose what you want to include in your bundle:</p>

                                <div className="space-y-3">
                                    {(Object.keys(selectedServices) as Array<keyof ServiceSelection>).map((service) => (
                                        <div key={service}
                                             className={`flex items-center p-3 border rounded-lg ${
                                                 selectedServices[service] ? 'border-green-500 bg-green-50' : 'border-gray-200'
                                             }`}
                                             onClick={() => handleServiceSelection(service)}
                                        >
                                            <div className={`w-5 h-5 flex-shrink-0 rounded border ${
                                                selectedServices[service] ? 'bg-green-600 border-green-600' : 'border-gray-300'
                                            } flex items-center justify-center mr-3`}>
                                                {selectedServices[service] && (
                                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-800 capitalize">
                                                    {service === 'dataBundles' ? 'Data Bundles' :
                                                        service === 'callMinutes' ? 'Call Minutes' :
                                                            service === 'sms' ? 'SMS' : 'Airtime'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8">
                                    <button
                                        onClick={nextStep}
                                        disabled={!hasSelectedAtLeastOne}
                                        className={`w-full py-3 rounded-lg font-medium text-center ${
                                            hasSelectedAtLeastOne
                                                ? 'bg-green-600 text-white'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Bundle Details */}
                        {step === 2 && (
                            <div>
                                <h3 className="text-green-700 font-bold mb-4">Bundle Details</h3>
                                <p className="text-gray-600 mb-4 text-sm">Enter the amount for each service:</p>

                                <div className="space-y-4">
                                    {selectedServices.dataBundles && (
                                        <div>
                                            <label htmlFor="dataBundles" className="block text-sm font-medium text-gray-700 mb-1">
                                                Data Bundles (MBs)
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    id="dataBundles"
                                                    min="0"
                                                    value={bundleDetails.dataBundles}
                                                    onChange={(e) => handleBundleDetailsChange('dataBundles', e.target.value)}
                                                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm text-black focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                />
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                    <span className="text-gray-500">MB</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {selectedServices.callMinutes && (
                                        <div>
                                            <label htmlFor="callMinutes" className="block text-sm font-medium text-gray-700 mb-1">
                                                Call Minutes
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    id="callMinutes"
                                                    min="0"
                                                    value={bundleDetails.callMinutes}
                                                    onChange={(e) => handleBundleDetailsChange('callMinutes', e.target.value)}
                                                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm text-black focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                />
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                    <span className="text-gray-500">mins</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {selectedServices.sms && (
                                        <div>
                                            <label htmlFor="sms" className="block text-sm font-medium text-gray-700 mb-1">
                                                SMS Count
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    id="sms"
                                                    min="0"
                                                    value={bundleDetails.sms}
                                                    onChange={(e) => handleBundleDetailsChange('sms', e.target.value)}
                                                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm text-black focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                />
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                    <span className="text-gray-500">SMS</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {selectedServices.airtime && (
                                        <div>
                                            <label htmlFor="airtime" className="block text-sm font-medium text-gray-700 mb-1">
                                                Airtime (KSh)
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                    <span className="text-gray-500">KSh</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    id="airtime"
                                                    min="0"
                                                    value={bundleDetails.airtime}
                                                    onChange={(e) => handleBundleDetailsChange('airtime', e.target.value)}
                                                    className="block w-full pl-12 px-3 py-3 border border-gray-300 rounded-lg shadow-sm text-black focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label htmlFor="validity" className="block text-sm font-medium text-gray-700 mb-1">
                                            Bundle Validity
                                        </label>
                                        <select
                                            id="validity"
                                            value={bundleDetails.validity}
                                            onChange={(e) => handleValidityChange(e.target.value)}
                                            className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm text-black focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none bg-white"
                                        >
                                            <option value="">Select validity period</option>
                                            {validityOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-8 space-y-3">
                                    <button
                                        onClick={nextStep}
                                        disabled={!hasFilledRequiredFields()}
                                        className={`w-full py-3 rounded-lg font-medium text-center ${
                                            hasFilledRequiredFields()
                                                ? 'bg-green-600 text-white'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                    >
                                        Next
                                    </button>
                                    <button
                                        onClick={prevStep}
                                        className="w-full py-3 rounded-lg font-medium text-center border border-gray-300 text-gray-700"
                                    >
                                        Back
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Confirmation */}
                        {step === 3 && (
                            <div>
                                <h3 className="text-green-700 font-bold mb-4">Confirm Your Bundle</h3>

                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4 mb-6">
                                    <div className="text-center">
                                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Bundle Summary</span>
                                    </div>

                                    {selectedServices.dataBundles && bundleDetails.dataBundles > 0 && (
                                        <div className="flex justify-between py-2 border-b border-gray-200">
                                            <span className="text-gray-600">Data</span>
                                            <span className="font-medium text-gray-800">{bundleDetails.dataBundles} MB</span>
                                        </div>
                                    )}

                                    {selectedServices.callMinutes && bundleDetails.callMinutes > 0 && (
                                        <div className="flex justify-between py-2 border-b border-gray-200">
                                            <span className="text-gray-600">Call Minutes</span>
                                            <span className="font-medium text-gray-800">{bundleDetails.callMinutes} mins</span>
                                        </div>
                                    )}

                                    {selectedServices.sms && bundleDetails.sms > 0 && (
                                        <div className="flex justify-between py-2 border-b border-gray-200">
                                            <span className="text-gray-600">SMS</span>
                                            <span className="font-medium text-gray-800">{bundleDetails.sms} messages</span>
                                        </div>
                                    )}

                                    {selectedServices.airtime && bundleDetails.airtime > 0 && (
                                        <div className="flex justify-between py-2 border-b border-gray-200">
                                            <span className="text-gray-600">Airtime</span>
                                            <span className="font-medium text-gray-800">KSh {bundleDetails.airtime}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between py-2 border-b border-gray-200">
                                        <span className="text-gray-600">Validity</span>
                                        <span className="font-medium text-gray-800">
                                            {validityOptions.find(opt => opt.value === bundleDetails.validity)?.label}
                                        </span>
                                    </div>

                                    <div className="flex justify-between py-3 bg-green-50 rounded-md px-2">
                                        <span className="font-semibold text-gray-700">Total Amount</span>
                                        <span className="font-bold text-green-700">KSh {calculateTotal()}</span>
                                    </div>
                                </div>

                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-yellow-700">
                                                You will be charged KSh {calculateTotal()} from your M-PESA account
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-3">
                                    <button
                                        className="w-full py-3 rounded-lg font-medium text-center bg-green-600 text-white"
                                        onClick={
                                            () => {
                                                alert(`Purchase successful! You will be charged KSh ${calculateTotal()}.`)
                                                window.location.reload();
                                            }
                                        }>
                                        Confirm and Pay
                                    </button>
                                    <button
                                        onClick={prevStep}
                                        className="w-full py-3 rounded-lg font-medium text-center border border-gray-300 text-gray-700"
                                    >
                                        Back
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
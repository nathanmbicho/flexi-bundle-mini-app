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
        // Fix the type checking issue
        for (const service in selectedServices) {
            if (
                selectedServices[service as keyof ServiceSelection] &&
                service !== 'validity' && // Skip validity check here
                (bundleDetails[service as keyof Omit<BundleDetails, 'validity'>] <= 0)
            ) {
                return false;
            }
        }
        return bundleDetails.validity !== '';
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Head>
                <title>Flexi Bundle Mini App</title>
                <meta name="description" content="Create your custom data bundle purchase" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="container mx-auto py-10 px-4 max-w-md">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h1 className="text-2xl font-bold text-center text-indigo-600 mb-6">Flexi Bundle Mini App</h1>

                    {/* Progress Bar */}
                    <div className="mb-8">
                        <div className="flex justify-between mb-2">
                            {[1, 2, 3].map((stepNumber) => (
                                <div
                                    key={stepNumber}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center 
                    ${step === stepNumber
                                        ? 'bg-indigo-600 text-white'
                                        : step > stepNumber
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-200 text-gray-700'}`}
                                >
                                    {step > stepNumber ? '✓' : stepNumber}
                                </div>
                            ))}
                        </div>
                        <div className="overflow-hidden h-2 rounded-full bg-gray-200">
                            <div
                                className="h-full bg-indigo-600 transition-all duration-300"
                                style={{ width: `${(step - 1) * 50}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Step 1: Service Selection */}
                    {step === 1 && (
                        <div>
                            <h2 className="text-xl text-black font-semibold mb-4">Select Services</h2>
                            <p className="text-gray-600 mb-4">Choose the services you want to bundle:</p>

                            <div className="space-y-3">
                                {(Object.keys(selectedServices) as Array<keyof ServiceSelection>).map((service) => (
                                    <div key={service} className="flex items-start">
                                        <div className="flex items-center h-5">
                                            <input
                                                id={service}
                                                type="checkbox"
                                                checked={selectedServices[service]}
                                                onChange={() => handleServiceSelection(service)}
                                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                            />
                                        </div>
                                        <div className="ml-3 text-sm">
                                            <label htmlFor={service} className="font-medium text-gray-700 capitalize">
                                                {service === 'dataBundles' ? 'Data Bundles' :
                                                    service === 'callMinutes' ? 'Call Minutes' :
                                                        service === 'sms' ? 'SMS' : 'Airtime'}
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={nextStep}
                                    disabled={!hasSelectedAtLeastOne}
                                    className={`px-4 py-2 rounded-md ${
                                        hasSelectedAtLeastOne
                                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
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
                            <h2 className="text-xl text-black font-semibold mb-4">Bundle Details</h2>
                            <p className="text-gray-600 mb-4">Enter the amount for each service:</p>

                            <div className="space-y-4">
                                {selectedServices.dataBundles && (
                                    <div>
                                        <label htmlFor="dataBundles" className="block text-sm font-medium text-gray-700">
                                            Data Bundles (MBs)
                                        </label>
                                        <input
                                            type="number"
                                            id="dataBundles"
                                            min="0"
                                            value={bundleDetails.dataBundles}
                                            onChange={(e) => handleBundleDetailsChange('dataBundles', e.target.value)}
                                            className="mt-1 block text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                    </div>
                                )}

                                {selectedServices.callMinutes && (
                                    <div>
                                        <label htmlFor="callMinutes" className="block text-sm font-medium text-gray-700">
                                            Call Minutes
                                        </label>
                                        <input
                                            type="number"
                                            id="callMinutes"
                                            min="0"
                                            value={bundleDetails.callMinutes}
                                            onChange={(e) => handleBundleDetailsChange('callMinutes', e.target.value)}
                                            className="mt-1 text-black block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                    </div>
                                )}

                                {selectedServices.sms && (
                                    <div>
                                        <label htmlFor="sms" className="block text-sm font-medium text-gray-700">
                                            SMS Count
                                        </label>
                                        <input
                                            type="number"
                                            id="sms"
                                            min="0"
                                            value={bundleDetails.sms}
                                            onChange={(e) => handleBundleDetailsChange('sms', e.target.value)}
                                            className="mt-1 block text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                    </div>
                                )}

                                {selectedServices.airtime && (
                                    <div>
                                        <label htmlFor="airtime" className="block text-sm font-medium text-gray-700">
                                            Airtime (KSh)
                                        </label>
                                        <input
                                            type="number"
                                            id="airtime"
                                            min="0"
                                            value={bundleDetails.airtime}
                                            onChange={(e) => handleBundleDetailsChange('airtime', e.target.value)}
                                            className="mt-1 block text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label htmlFor="validity" className="block text-sm font-medium text-gray-700">
                                        Bundle Validity
                                    </label>
                                    <select
                                        id="validity"
                                        value={bundleDetails.validity}
                                        onChange={(e) => handleValidityChange(e.target.value)}
                                        className="mt-1 block text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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

                            <div className="mt-8 flex justify-between">
                                <button
                                    onClick={prevStep}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={nextStep}
                                    disabled={!hasFilledRequiredFields()}
                                    className={`px-4 py-2 rounded-md ${
                                        hasFilledRequiredFields()
                                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Confirmation */}
                    {step === 3 && (
                        <div>
                            <h2 className="text-xl text-black font-semibold mb-4">Confirm Your Bundle</h2>

                            <div className="bg-gray-50 p-4 rounded-md space-y-5 mb-6">
                                <h3 className="font-semibold text-gray-600 text-center text-sm uppercase">Bundle Summary:</h3>

                                <div className="space-y-3 text-gray-700">
                                    {selectedServices.dataBundles && bundleDetails.dataBundles > 0 && (
                                        <div className="flex justify-between">
                                            <span>Data:</span>
                                            <span className="font-medium">{bundleDetails.dataBundles} MB</span>
                                        </div>
                                    )}

                                    {selectedServices.callMinutes && bundleDetails.callMinutes > 0 && (
                                        <div className="flex justify-between">
                                            <span>Call Minutes:</span>
                                            <span className="font-medium">{bundleDetails.callMinutes} mins</span>
                                        </div>
                                    )}

                                    {selectedServices.sms && bundleDetails.sms > 0 && (
                                        <div className="flex justify-between">
                                            <span>SMS:</span>
                                            <span className="font-medium">{bundleDetails.sms} messages</span>
                                        </div>
                                    )}

                                    {selectedServices.airtime && bundleDetails.airtime > 0 && (
                                        <div className="flex justify-between">
                                            <span>Airtime:</span>
                                            <span className="font-medium">KSh {bundleDetails.airtime}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between">
                                        <span>Validity:</span>
                                        <span className="font-medium">
                                          {validityOptions.find(opt => opt.value === bundleDetails.validity)?.label}
                                        </span>
                                    </div>

                                    <div className="border-t border-gray-200 pt-2 mt-2">
                                        <div className="flex justify-between font-semibold">
                                            <span>Total Amount:</span>
                                            <span className="text-indigo-600">KSh {calculateTotal()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-between">
                                <button
                                    onClick={prevStep}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Back
                                </button>
                                <button
                                    className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                                    onClick={
                                        () => {
                                            alert(`Purchase successful! You will be charged KSh ${calculateTotal()}.`)
                                            window.location.reload();
                                       }
                                    }>
                                    Purchase Bundle
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                <p className="text-center text-sm mt-2">@Prepared By  Group 4</p>
            </main>
        </div>
    );
}
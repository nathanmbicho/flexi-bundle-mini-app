"use client"
import { useState, useEffect } from 'react';
import Head from 'next/head';

type ServiceOption = 'airtime' | 'dataBundles' | 'callMinutes' | 'sms';

interface SelectedOptions {
    airtime: boolean;
    dataBundles: boolean;
    callMinutes: boolean;
    sms: boolean;
}

interface ValidityOption {
    id: string;
    label: string;
    mbsRate: number;
    minutesRate: number;
    smsRate: number;
    airtimeRate: number;
}

interface BundleResult {
    airtime: number;
    dataBundles: number;
    callMinutes: number;
    sms: number;
    validity: string;
    validityLabel: string;
}

export default function Home() {
    const [step, setStep] = useState(1);
    const [amount, setAmount] = useState<number>(100);
    const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({
        airtime: false,
        dataBundles: false,
        callMinutes: false,
        sms: false
    });

    const [results, setResults] = useState<BundleResult>({
        airtime: 0,
        dataBundles: 0,
        callMinutes: 0,
        sms: 0,
        validity: '',
        validityLabel: ''
    });

    const validityOptions: ValidityOption[] = [
        { id: '1hour', label: 'Valid for 1 hour', mbsRate: 1, minutesRate: 1, smsRate: 1, airtimeRate: 1 },
        { id: '3hours', label: 'Valid for 3 hours', mbsRate: 1.25, minutesRate: 1.3, smsRate: 1.2, airtimeRate: 1.1 },
        { id: '6hours', label: 'Valid for 6 hours', mbsRate: 1.5, minutesRate: 1.6, smsRate: 1.4, airtimeRate: 1.2 },
        { id: 'midnight', label: 'Valid till Midnight', mbsRate: 1.75, minutesRate: 1.9, smsRate: 1.6, airtimeRate: 1.3 },
        { id: '24hrs', label: 'Valid for 24hrs', mbsRate: 2, minutesRate: 2.2, smsRate: 1.8, airtimeRate: 1.4 },
        { id: '3days', label: 'Valid for 3 days', mbsRate: 2.5, minutesRate: 2.8, smsRate: 2.2, airtimeRate: 1.6 },
        { id: '7days', label: 'Valid for 7 Days', mbsRate: 3, minutesRate: 3.5, smsRate: 2.7, airtimeRate: 1.8 },
        { id: '30days', label: 'Valid for 30 days', mbsRate: 4, minutesRate: 5, smsRate: 3.5, airtimeRate: 2 }
    ];

    // Base rates for each service
    const baseRates = {
        dataBundles: 2, // 2 bob per MB
        callMinutes: 5, // 5 bob per minute
        sms: 1,         // 1 bob per SMS
        airtime: 1      // 1:1 for airtime
    };

    // Calculate what the user will get for their money
    useEffect(() => {
        if (step === 2) {
            findOptimalBundle();
        }
    }, [step, selectedOptions, amount]);

    const findOptimalBundle = () => {
        // Count how many services were selected
        const selectedServiceCount = Object.values(selectedOptions).filter(Boolean).length;
        if (selectedServiceCount === 0) return;

        // Divide the amount equally among selected services
        const amountPerService = amount / selectedServiceCount;

        // Try each validity period and find the one that gives the best overall value
        let bestResult: BundleResult = {
            airtime: 0,
            dataBundles: 0,
            callMinutes: 0,
            sms: 0,
            validity: '',
            validityLabel: ''
        };

        let bestScore = 0;

        validityOptions.forEach(validityOption => {
            // Calculate what each service gets with this validity
            const tempResult: BundleResult = {
                airtime: 0,
                dataBundles: 0,
                callMinutes: 0,
                sms: 0,
                validity: validityOption.id,
                validityLabel: validityOption.label
            };

            if (selectedOptions.dataBundles) {
                // Calculate MBs (round down to nearest 10)
                const mbs = Math.floor((amountPerService / (baseRates.dataBundles * validityOption.mbsRate)) / 10) * 10;
                tempResult.dataBundles = mbs;
            }

            if (selectedOptions.callMinutes) {
                // Calculate minutes (round down to nearest 10)
                const minutes = Math.floor((amountPerService / (baseRates.callMinutes * validityOption.minutesRate)) / 10) * 10;
                tempResult.callMinutes = minutes;
            }

            if (selectedOptions.sms) {
                // Calculate SMS (round down to nearest 10)
                const smsCount = Math.floor((amountPerService / (baseRates.sms * validityOption.smsRate)) / 10) * 10;
                tempResult.sms = smsCount;
            }

            if (selectedOptions.airtime) {
                // Calculate airtime (round down to nearest 10)
                const airtimeAmount = Math.floor((amountPerService / validityOption.airtimeRate) / 10) * 10;
                tempResult.airtime = airtimeAmount;
            }

            // Score this result - we want to maximize units per shilling but also consider longer validity
            // This scoring approach favors combinations that give more value
            const validityMultiplier = {
                '1hour': 0.5,
                '3hours': 0.6,
                '6hours': 0.7,
                'midnight': 0.8,
                '24hrs': 0.9,
                '3days': 1.0,
                '7days': 1.1,
                '30days': 1.2
            }[validityOption.id] || 1;

            // Calculate score based on normalized service values and validity
            const mbsValue = tempResult.dataBundles / baseRates.dataBundles;
            const minutesValue = tempResult.callMinutes / baseRates.callMinutes;
            const smsValue = tempResult.sms / baseRates.sms;
            const airtimeValue = tempResult.airtime / baseRates.airtime;

            // Calculate total service value, accounting for which services were selected
            let totalValue = 0;
            let serviceCount = 0;

            if (selectedOptions.dataBundles) {
                totalValue += mbsValue;
                serviceCount++;
            }

            if (selectedOptions.callMinutes) {
                totalValue += minutesValue;
                serviceCount++;
            }

            if (selectedOptions.sms) {
                totalValue += smsValue;
                serviceCount++;
            }

            if (selectedOptions.airtime) {
                totalValue += airtimeValue;
                serviceCount++;
            }

            // Average value per service, weighted by validity
            const score = (totalValue / serviceCount) * validityMultiplier;

            if (score > bestScore) {
                bestScore = score;
                bestResult = { ...tempResult };
            }
        });

        setResults(bestResult);
    };

    const handleCheckboxChange = (option: ServiceOption) => {
        setSelectedOptions({
            ...selectedOptions,
            [option]: !selectedOptions[option]
        });
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value) || 0;
        setAmount(value);
    };

    const handleNext = () => {
        // Check if amount is entered and at least one option is selected
        if (step === 1) {
            if (amount <= 0) {
                alert('Please enter a valid amount');
                return;
            }

            if (!Object.values(selectedOptions).some(value => value)) {
                alert('Please select at least one service');
                return;
            }
        }

        // Find the optimal bundle before proceeding to step 2
        if (step === 1) {
            findOptimalBundle();
        }

        setStep(step + 1);
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Head>
                <title>Flexi Bundle Mini App</title>
                <meta name="description" content="Create your own custom budget bundle" />
            </Head>

            <main className="max-w-md mx-auto py-12 px-4">
                <div className="bg-white rounded-lg shadow p-6">
                    <h1 className="text-2xl font-bold text-center text-purple-700 mb-6">Flexi Bundle Budget Plan</h1>

                    {/* Progress indicator */}
                    <div className="flex items-center justify-around mb-8">
                        {[1, 2].map((stepNumber) => (
                            <div key={stepNumber} className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    step >= stepNumber ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
                                }`}>
                                    {stepNumber}
                                </div>
                                <span className="text-xs mt-1">
                                  {stepNumber === 1 ? 'Configure' : 'Results'}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Step 1: Configure Amount and Services */}
                    {step === 1 && (
                        <div>
                            <h2 className="text-lg font-semibold mb-4">Configure Your Bundle</h2>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    How much do you want to spend? (KSh)
                                </label>
                                <input
                                    type="number"
                                    min="10"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    value={amount}
                                    onChange={handleAmountChange}
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Spend On?
                                </label>

                                <div className="space-y-3">
                                    <label className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox h-5 w-5 text-purple-600"
                                            checked={selectedOptions.airtime}
                                            onChange={() => handleCheckboxChange('airtime')}
                                        />
                                        <span className="text-gray-900">Airtime</span>
                                    </label>

                                    <label className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox h-5 w-5 text-purple-600"
                                            checked={selectedOptions.dataBundles}
                                            onChange={() => handleCheckboxChange('dataBundles')}
                                        />
                                        <span className="text-gray-900">Data Bundles</span>
                                    </label>

                                    <label className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox h-5 w-5 text-purple-600"
                                            checked={selectedOptions.callMinutes}
                                            onChange={() => handleCheckboxChange('callMinutes')}
                                        />
                                        <span className="text-gray-900">Call Minutes</span>
                                    </label>

                                    <label className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox h-5 w-5 text-purple-600"
                                            checked={selectedOptions.sms}
                                            onChange={() => handleCheckboxChange('sms')}
                                        />
                                        <span className="text-gray-900">SMS</span>
                                    </label>
                                </div>
                            </div>

                            <div className="mt-10">

                                <button
                                    onClick={handleNext}
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Results */}
                    {step === 2 && (
                        <div>
                            <h2 className="text-lg font-semibold mb-4">Your Optimized Bundle</h2>

                            <div className="bg-purple-50 rounded-lg p-4 mb-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-medium text-purple-800">For KSh {amount}, you&#39;ll get:</h3>
                                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {results.validityLabel}
                  </span>
                                </div>

                                <div className="space-y-4 text-sm">
                                    {selectedOptions.dataBundles && (
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{results.dataBundles} MBs</p>
                                                <p className="text-xs text-gray-500">Data Bundles</p>
                                            </div>
                                        </div>
                                    )}

                                    {selectedOptions.callMinutes && (
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{results.callMinutes} Minutes</p>
                                                <p className="text-xs text-gray-500">Call Minutes</p>
                                            </div>
                                        </div>
                                    )}

                                    {selectedOptions.sms && (
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{results.sms} SMS</p>
                                                <p className="text-xs text-gray-500">Text Messages</p>
                                            </div>
                                        </div>
                                    )}

                                    {selectedOptions.airtime && (
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">KSh {results.airtime}</p>
                                                <p className="text-xs text-gray-500">Airtime</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 flex justify-between">
                                <button
                                    onClick={handleBack}
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition duration-200"
                                >
                                    Back
                                </button>
                                <button
                                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
                                    onClick={() => alert(`Thank you for your purchase! Your bundle will be activated shortly.`)}
                                >
                                    Purchase Bundle
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
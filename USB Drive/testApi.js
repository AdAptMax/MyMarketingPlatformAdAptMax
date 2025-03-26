const axios = require("axios");

// Base URL of your local server
const baseUrl = "http://localhost:4000";

// Test User API
const testUserApi = async () => {
    try {
        const response = await axios.get(`${baseUrl}/users`);
        console.log("User API Test Passed:", response.status);
    } catch (error) {
        console.error("User API Test Failed:", error);
    }
};

// Test Campaign API
const testCampaignApi = async () => {
    try {
        const response = await axios.get(`${baseUrl}/campaigns`);
        console.log("Campaign API Test Passed:", response.status);
    } catch (error) {
        console.error("Campaign API Test Failed:", error);
    }
};

// Test Payment API
const testPaymentApi = async () => {
    try {
        const response = await axios.get(`${baseUrl}/payments`);
        console.log("Payment API Test Passed:", response.status);
    } catch (error) {
        console.error("Payment API Test Failed:", error);
    }
};

// Test Referral API
const testReferralApi = async () => {
    try {
        const response = await axios.get(`${baseUrl}/referrals`);
        console.log("Referral API Test Passed:", response.status);
    } catch (error) {
        console.error("Referral API Test Failed:", error);
    }
};

// Run all tests
const runTests = async () => {
    await testUserApi();
    await testCampaignApi();
    await testPaymentApi();
    await testReferralApi();
};

// Execute the test
runTests();

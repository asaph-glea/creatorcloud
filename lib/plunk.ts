import Plunk from '@plunk/node';

const apiKey = process.env.PLUNK_API_KEY;

if (!apiKey) {
    console.warn("PLUNK_API_KEY is not set. Email notifications will be disabled.");
}

export const plunk = apiKey ? new Plunk(apiKey) : null;

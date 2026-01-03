import { ApifyClient } from 'apify-client';
import dotenv from 'dotenv';

dotenv.config();

// Initialize the ApifyClient with API token
const client = new ApifyClient({
    token: process.env.APIFY_API_TOKEN,
});

// Prepare Actor input
const input = {
  "total_posts": 15,
  "username": process.env.LINKEDIN_USERNAME,
  "page_number": 1,
  "limit": 100
};

(async () => {
    // Run the Actor and wait for it to finish
    const run = await client.actor("LQQIXN9Othf8f7R5n").call(input);

    // Fetch and print Actor results from the run's dataset (if any)
    console.log('Results from dataset');
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    items.forEach((item) => {
        console.dir(item);
    });
})();
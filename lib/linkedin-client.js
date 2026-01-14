import { ApifyClient } from 'apify-client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Create and configure Apify client
 * @param {string} apiToken - Apify API token
 * @returns {ApifyClient} Configured Apify client
 */
export function createClient(apiToken) {
    return new ApifyClient({ token: apiToken });
}

/**
 * Load mock data from JSON file
 * @returns {Promise<Array>} Array of mock LinkedIn posts
 */
async function loadMockData() {
    const mockDataPath = path.join(__dirname, '..', 'mock-data', 'linkedin-posts.json');
    
    if (!fs.existsSync(mockDataPath)) {
        throw new Error(`Mock data file not found at: ${mockDataPath}`);
    }
    
    console.log('Loading mock data from:', mockDataPath);
    const data = fs.readFileSync(mockDataPath, 'utf8');
    return JSON.parse(data);
}

/**
 * Fetch LinkedIn posts for a user
 * @param {ApifyClient} client - Apify client instance (ignored in mock mode)
 * @param {string} username - LinkedIn username
 * @param {boolean} useMock - Whether to use mock data instead of API
 * @returns {Promise<Array>} Array of LinkedIn posts
 */
export async function fetchLinkedInPosts(client, username, useMock = false) {
    if (useMock) {
        console.log('Using mock data (API call skipped)');
        const mockData = await loadMockData();
        return mockData.map(normalizePost);
    }
    
    const input = {
        "username": username,
        "page_number": 1,
        "limit": 25
    };
    
    console.log('Fetching LinkedIn posts...');
    const run = await client.actor("LQQIXN9Othf8f7R5n").call(input);
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    
    return items.map(normalizePost);
}

// Helper function to detect video
export function normalizePost(item) {
    const media = item.media || {};

    const isVideo = media.type === 'video' || 
                    (media.thumbnail && !media.type && !media.images && !media.url);

    const imageUrl = isVideo 
        ? media.thumbnail || null 
        : media.images?.[0]?.url || media.url || null;

    return {
        ...item,
        isVideo,
        imageUrl
    };
}

/**
 * Filter posts to only include user's own regular posts
 * @param {Array} items - Array of LinkedIn posts
 * @param {string} username - LinkedIn username
 * @returns {Array} Filtered array of own posts
 */
export function filterOwnPosts(items, username) {
    return items.filter(item => {
        const isOwnPost = item.post_type === 'regular';
        const isAuthor = item.author.username === username;
        return isOwnPost && isAuthor;
    });
}

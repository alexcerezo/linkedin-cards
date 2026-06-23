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
    const dataset = client.dataset(run.defaultDatasetId);

    // Request all available items from the actor (it processes up to 25)
    // since the feed may contain many posts from other users
    const { items } = await dataset.listItems({ limit: 25 });
    console.log(`Fetched ${items.length} items from dataset`);

    return items.map(normalizePost);
}

// Helper function to detect video and normalize fields
export function normalizePost(item) {
    const media = item.media || {};

    const isVideo = media.type === 'video' || 
                    (media.thumbnail && !media.type && !media.images && !media.url);

    const imageUrl = isVideo 
        ? media.thumbnail || null 
        : media.images?.[0]?.url || media.url || null;

    // Try to extract author username from various possible structures
    // Apify actor may return author as object, string, or different field names
    let author = item.author;
    if (!author) {
        author = {};
    } else if (typeof author === 'string') {
        // e.g. "urn:li:person:abc123" - extract the URN suffix
        author = { urn: author };
    }

    let postType = item.post_type;
    if (!postType) {
        // Try alternative field names
        postType = item.type || item.postType || 'regular';
    }

    if (!item.text && item.description) {
        item.text = item.description;
    }

    return {
        ...item,
        author,
        post_type: postType,
        isVideo,
        imageUrl
    };
}

/**
 * Filter posts to only include user's own regular posts and reposts
 * @param {Array} items - Array of LinkedIn posts
 * @param {string} username - LinkedIn username
 * @param {Object} options - Filter options
 * @param {boolean} includeReposts - Include reposts
 * @returns {Array} Filtered array of own posts
 */
export function filterOwnPosts(items, username, includeReposts) {
    
    const filtered = items.filter(item => {
        const authorUsername = item.author?.username;
        const postType = item.post_type;
        
        // Debug: log each item for troubleshooting
        console.log(`  [filter] type=${postType} author=${authorUsername} hasReshared=${!!item.reshared_post} match=??`);
        
        // For regular posts, author must be the user
        if (postType === 'regular' && authorUsername === username) {
            console.log(`    -> MATCHED as regular post`);
            return true;
        }
        
        // For simple reposts, include if option is enabled
        if (includeReposts && 
            postType === 'repost' &&
            authorUsername === username) {
            console.log(`    -> MATCHED as simple repost`);
            return true;
        }
        
        // For quote reposts (with commentary), include if option is enabled
        if (includeReposts && 
            item.reshared_post && 
            postType === 'quote' &&
            authorUsername === username) {
            console.log(`    -> MATCHED as quote repost`);
            return true;
        }
        
        console.log(`    -> FILTERED OUT`);
        return false;
    });
    
    console.log(`Filter result: ${filtered.length}/${items.length} posts match for user "${username}" (includeReposts=${includeReposts})`);
    return filtered;
}

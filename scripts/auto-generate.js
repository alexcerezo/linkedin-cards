import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { loadTranslations } from '../lib/translations.js';
import { updateReadme } from '../lib/readme-updater.js';
import { generateCard } from '../lib/card-generator.js';
import { createClient, fetchLinkedInPosts, filterOwnPosts } from '../lib/linkedin-client.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ACTION_PATH = path.join(__dirname, '..');
const USER_REPO_PATH = process.cwd();

dotenv.config();

(async () => {
    try {
        // Load translations
        const translations = loadTranslations();
        
        // Ensure required directories exist
        const cardsDir = path.join(USER_REPO_PATH, 'cards');
        if (!fs.existsSync(cardsDir)) {
            fs.mkdirSync(cardsDir, { recursive: true });
        }
        
        // Initialize LinkedIn client
        const client = createClient(process.env.APIFY_API_TOKEN);
        
        // Fetch and filter posts
        const useMockData = process.env.USE_MOCK_DATA === 'true';
        // TODO: Make this configurable
        const includeQuotes = 'true';
        const items = await fetchLinkedInPosts(client, process.env.LINKEDIN_USERNAME, useMockData);
        const ownPosts = filterOwnPosts(items, process.env.LINKEDIN_USERNAME, { includeQuotes });
        const maxCards = parseInt(process.env.MAX_CARDS_TO_GENERATE || '4', 10);
        const postsToGenerate = ownPosts.slice(0, maxCards);
        
        if (postsToGenerate.length === 0) {
            console.log('No posts found');
            return;
        }
        
        console.log(`Generating cards for ${postsToGenerate.length} posts...`);
        
        // Generate cards
        const generatedCardsData = [];
        const outputDir = path.join(USER_REPO_PATH, 'cards');
        const templateDir = path.join(ACTION_PATH, 'templates');
        const language = process.env.LANGUAGE || 'en';
        
        for (const post of postsToGenerate) {
            const cardData = await generateCard(post, outputDir, templateDir, {
                language,
                translations
            });
            generatedCardsData.push(cardData);
        }
        
        // Update README
        const readmePath = path.join(USER_REPO_PATH, 'README.md');
        updateReadme(readmePath, generatedCardsData);
        
        console.log('Cards generated successfully.');
        
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
})();

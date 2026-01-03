import { ApifyClient } from 'apify-client';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const client = new ApifyClient({
    token: process.env.APIFY_API_TOKEN,
});

const input = {
  "total_posts": 15,
  "username": process.env.LINKEDIN_USERNAME,
  "page_number": 1,
  "limit": 100
};

function filterOwnPosts(items, username) {
    return items.filter(item => {
        const isOwnPost = item.post_type === 'regular' || item.post_type === 'quote';
        const isAuthor = item.author.username === username;
        return isOwnPost && isAuthor;
    });
}

function getNewPosts(currentPosts, savedPostsPath) {
    if (!fs.existsSync(savedPostsPath)) {
        return currentPosts;
    }
    
    const savedPosts = JSON.parse(fs.readFileSync(savedPostsPath, 'utf8'));
    const savedIds = new Set(savedPosts.map(p => p.full_urn));
    return currentPosts.filter(p => !savedIds.has(p.full_urn));
}

function savePosts(posts, filePath) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(posts, null, 2), 'utf-8');
}

(async () => {
    try {
        const run = await client.actor("LQQIXN9Othf8f7R5n").call(input);
        const { items } = await client.dataset(run.defaultDatasetId).listItems();
        
        const ownPosts = filterOwnPosts(items, process.env.LINKEDIN_USERNAME);
        const postsPath = path.join(process.cwd(), 'data', 'posts.json');
        const newPosts = getNewPosts(ownPosts, postsPath);
        
        if (newPosts.length > 0) {
            console.log(`${newPosts.length} posts nuevos detectados`);
            savePosts(ownPosts, postsPath);
        } else {
            console.log('No hay posts nuevos');
        }
        
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
})();
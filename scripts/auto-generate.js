import { ApifyClient } from 'apify-client';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

dotenv.config();

const translations = {
    es: {
        'second': 'segundo',
        'seconds': 'segundos',
        'minute': 'minuto',
        'minutes': 'minutos',
        'hour': 'hora',
        'hours': 'horas',
        'day': 'día',
        'days': 'días',
        'week': 'semana',
        'weeks': 'semanas',
        'month': 'mes',
        'months': 'meses',
        'year': 'año',
        'years': 'años',
        'ago': 'Hace',
        invertOrder: true
    },
    en: {
        invertOrder: false
    }
};

function translateRelativeTime(englishTime, language = 'en') {
    if (language === 'en' || !translations[language]) {
        return englishTime;
    }
    
    let translated = englishTime.toLowerCase();
    const trans = translations[language];
    
    Object.keys(trans).forEach(key => {
        if (key === 'invertOrder') return;
        const regex = new RegExp(`\\b${key}\\b`, 'gi');
        translated = translated.replace(regex, trans[key]);
    });
    
    if (trans.invertOrder) {
        const parts = translated.trim().split(' ');
        if (parts.length >= 2) {
            const agoWord = trans.ago || 'ago';
            const agoIndex = parts.findIndex(p => p.toLowerCase().includes(agoWord.toLowerCase()));
            if (agoIndex !== -1) {
                parts.splice(agoIndex, 1);
                translated = `${agoWord} ${parts.join(' ')}`;
            }
        }
    }
    
    return translated;
}

const client = new ApifyClient({
    token: process.env.APIFY_API_TOKEN,
});

const input = {
  "username": process.env.LINKEDIN_USERNAME,
  "page_number": 1,
  "limit": 100
};

function filterOwnPosts(items, username) {
    return items.filter(item => {
        const isOwnPost = item.post_type === 'regular';
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

function updateReadme(generatedCardsData, maxCards) {
    const readmePath = path.join(process.cwd(), 'README.md');
    let readme = fs.readFileSync(readmePath, 'utf8');
    
    const timestampToUrl = {};
    
    const postsDataPath = path.join(process.cwd(), 'data', 'posts.json');
    if (fs.existsSync(postsDataPath)) {
        const postsData = JSON.parse(fs.readFileSync(postsDataPath, 'utf8'));
        postsData.forEach(post => {
            timestampToUrl[post.posted_at.timestamp.toString()] = post.url;
        });
    }
    
    generatedCardsData.forEach(card => {
        timestampToUrl[card.timestamp] = card.url;
    });
    
    const existingCards = [];
    const cardPattern = /cards\/(\d+)-(light|dark)\.svg/g;
    let match;
    while ((match = cardPattern.exec(readme)) !== null) {
        const timestamp = match[1];
        if (!existingCards.includes(timestamp)) {
            existingCards.push(timestamp);
        }
    }
    
    const allCards = [...new Set([...generatedCardsData.map(c => c.timestamp), ...existingCards])];
    allCards.sort((a, b) => b - a);
    const cardsToShow = allCards.slice(0, maxCards);
    
    const cardHTML = cardsToShow.map((timestamp, index) => {
        const lightPath = `cards/${timestamp}-light.svg`;
        const darkPath = `cards/${timestamp}-dark.svg`;
        const postUrl = timestampToUrl[timestamp] || `https://linkedin.com/in/${process.env.LINKEDIN_USERNAME}`;
        return `  <a href="${postUrl}">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="${darkPath}">
      <source media="(prefers-color-scheme: light)" srcset="${lightPath}">
      <img alt="LinkedIn Card ${index + 1}" src="${lightPath}" width="320px">
    </picture>
  </a>`;
    }).join('\n');
    
    const beginMarker = '<!-- BEGIN LINKEDIN -->';
    const endMarker = '<!-- END LINKEDIN -->';
    const beginIndex = readme.indexOf(beginMarker);
    const endIndex = readme.indexOf(endMarker);
    
    if (beginIndex !== -1 && endIndex !== -1) {
        readme = readme.substring(0, beginIndex + beginMarker.length) + '\n' + cardHTML + '\n' + readme.substring(endIndex);
        fs.writeFileSync(readmePath, readme, 'utf8');
        console.log('README actualizado con las tarjetas');
    }
}

async function fetchImageAsBase64(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        client.get(url, (res) => {
            const data = [];
            res.on('data', (chunk) => data.push(chunk));
            res.on('end', () => {
                const buffer = Buffer.concat(data);
                resolve(`data:image/jpeg;base64,${buffer.toString('base64')}`);
            });
        }).on('error', reject);
    });
}

function getAnimationKeyframes(imageCount) {
    if (imageCount === 1) {
        return {
            keyframes: '@keyframes static1 { 0% {opacity:1} 100% {opacity:1} }',
            classes: '.img-1 { animation-name: static1; opacity: 1; }'
        };
    }
    
    if (imageCount === 2) {
        return {
            keyframes: `@keyframes cycle2_1 { 0% {opacity:1} 47% {opacity:1} 53% {opacity:0} 100% {opacity:0} }
                @keyframes cycle2_2 { 0% {opacity:0} 47% {opacity:0} 53% {opacity:1} 100% {opacity:1} }`,
            classes: `.img-1 { animation-name: cycle2_1; opacity: 1; }
                .img-2 { animation-name: cycle2_2; }`
        };
    }
    
    if (imageCount === 3) {
        return {
            keyframes: `@keyframes cycle1 { 0% {opacity:1} 30% {opacity:1} 36% {opacity:0} 94% {opacity:0} 100% {opacity:1} }
                @keyframes cycle2 { 0% {opacity:0} 30% {opacity:0} 36% {opacity:1} 63% {opacity:1} 69% {opacity:0} 100% {opacity:0} }
                @keyframes cycle3 { 0% {opacity:0} 63% {opacity:0} 69% {opacity:1} 94% {opacity:1} 100% {opacity:0} }`,
            classes: `.img-1 { animation-name: cycle1; opacity: 1; }
                .img-2 { animation-name: cycle2; }
                .img-3 { animation-name: cycle3; }`
        };
    }
    
    if (imageCount >= 4) {
        return {
            keyframes: `@keyframes cycle4_1 { 0% {opacity:1} 22% {opacity:1} 28% {opacity:0} 94% {opacity:0} 100% {opacity:1} }
                @keyframes cycle4_2 { 0% {opacity:0} 22% {opacity:0} 28% {opacity:1} 47% {opacity:1} 53% {opacity:0} 100% {opacity:0} }
                @keyframes cycle4_3 { 0% {opacity:0} 47% {opacity:0} 53% {opacity:1} 72% {opacity:1} 78% {opacity:0} 100% {opacity:0} }
                @keyframes cycle4_4 { 0% {opacity:0} 72% {opacity:0} 78% {opacity:1} 94% {opacity:1} 100% {opacity:0} }`,
            classes: `.img-1 { animation-name: cycle4_1; opacity: 1; }
                .img-2 { animation-name: cycle4_2; }
                .img-3 { animation-name: cycle4_3; }
                .img-4 { animation-name: cycle4_4; }`
        };
    }
}

async function generateCard(post) {
    const outputDir = path.join(process.cwd(), 'cards');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const hasImages = post.media && (post.media.type === 'image' || post.media.type === 'images');
    const images = hasImages ? (post.media.images || [{ url: post.media.url }]) : [];
    
    const name = `${post.author.first_name} ${post.author.last_name || ''}`.trim();
    const bio = post.author.headline || '';
    const profilePicture = await fetchImageAsBase64(post.author.profile_picture);
    const text = post.text.substring(0, 250);
    const timeRaw = post.posted_at.relative.split('•')[0].trim();
    const language = process.env.LANGUAGE || 'en';
    const time = translateRelativeTime(timeRaw, language);
    const reactions = post.stats.total_reactions;
    const comments = `${post.stats.comments} ${language === 'es' ? 'comentarios' : 'comments'}`;
    
    const imageBase64 = [];
    for (let i = 0; i < Math.min(images.length, 4); i++) {
        imageBase64.push(await fetchImageAsBase64(images[i].url));
    }
    
    const themes = ['light', 'dark'];
    
    for (const theme of themes) {
        const templateName = hasImages ? `linkedin-post-${theme}.svg` : `linkedin-post-${theme}-text.svg`;
        const templatePath = path.join(process.cwd(), 'templates', templateName);
        let template = fs.readFileSync(templatePath, 'utf8');
        
        template = template.replace(/\$\{name\}/g, name);
        template = template.replace(/\$\{bio\}/g, bio);
        template = template.replace(/\$\{profile_picture\}/g, profilePicture);
        template = template.replace(/\$\{text\}/g, text);
        template = template.replace(/\$\{time\}/g, time);
        template = template.replace(/\$\{reactions\}/g, reactions);
        template = template.replace(/\$\{comments\}/g, comments);
        
        if (hasImages && imageBase64.length > 0) {
            const animations = getAnimationKeyframes(imageBase64.length);
            
            template = template.replace(
                /@keyframes cycle1 \{[^}]+\}\s*@keyframes cycle2 \{[^}]+\}\s*@keyframes cycle3 \{[^}]+\}/,
                animations.keyframes
            );
            
            template = template.replace(
                /\.img-1 \{[^}]+\}\s*\.img-2 \{[^}]+\}\s*\.img-3 \{[^}]+\}/,
                animations.classes
            );
            
            const galleryDivs = imageBase64.map((img, i) => 
                `            <div class="gallery-slide img-${i + 1}" style="background-image: url(${img});"></div>`
            ).join('\n');
            
            template = template.replace(
                /<div class="gallery-container">\s*<\/div>/,
                `<div class="gallery-container">\n${galleryDivs}\n        </div>`
            );
        }
        
        const timestamp = post.posted_at.timestamp;
        const outputPath = path.join(outputDir, `${timestamp}-${theme}.svg`);
        fs.writeFileSync(outputPath, template, 'utf8');
        console.log(`Tarjeta generada: ${outputPath}`);
    }
}

(async () => {
    try {
        const run = await client.actor("LQQIXN9Othf8f7R5n").call(input);
        const { items } = await client.dataset(run.defaultDatasetId).listItems();
        
        const ownPosts = filterOwnPosts(items, process.env.LINKEDIN_USERNAME);
        const postsPath = path.join(process.cwd(), 'data', 'posts.json');
        const newPosts = getNewPosts(ownPosts, postsPath);
        
        if (newPosts.length > 0) {
            const maxCards = parseInt(process.env.MAX_CARDS_TO_GENERATE || '5', 10);
            const postsToGenerate = newPosts.slice(0, maxCards);
            
            console.log(`${newPosts.length} posts nuevos detectados`);
            console.log(`Generando tarjetas para ${postsToGenerate.length} posts`);
            
            const generatedCardsData = [];
            for (const post of postsToGenerate) {
                await generateCard(post);
                generatedCardsData.push({
                    timestamp: post.posted_at.timestamp.toString(),
                    url: post.url
                });
            }
            
            updateReadme(generatedCardsData, maxCards);
            savePosts(ownPosts, postsPath);
        } else {
            console.log('No hay posts nuevos');
        }
        
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
})();
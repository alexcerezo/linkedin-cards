import { ApifyClient } from 'apify-client';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ACTION_PATH = path.join(__dirname, '..');
const USER_REPO_PATH = process.cwd();

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
        'comment': 'comentario',
        'comments': 'comentarios',
        invertOrder: true
    },
    en: {
        'comment': 'comment',
        'comments': 'comments',
        invertOrder: false
    },
    fr: {
        'second': 'seconde',
        'seconds': 'secondes',
        'minute': 'minute',
        'minutes': 'minutes',
        'hour': 'heure',
        'hours': 'heures',
        'day': 'jour',
        'days': 'jours',
        'week': 'semaine',
        'weeks': 'semaines',
        'month': 'mois',
        'months': 'mois',
        'year': 'an',
        'years': 'ans',
        'ago': 'Il y a',
        'comment': 'commentaire',
        'comments': 'commentaires',
        invertOrder: true
    },
    de: {
        'second': 'Sekunde',
        'seconds': 'Sekunden',
        'minute': 'Minute',
        'minutes': 'Minuten',
        'hour': 'Stunde',
        'hours': 'Stunden',
        'day': 'Tag',
        'days': 'Tagen',
        'week': 'Woche',
        'weeks': 'Wochen',
        'month': 'Monat',
        'months': 'Monaten',
        'year': 'Jahr',
        'years': 'Jahren',
        'ago': 'Vor',
        'comment': 'Kommentar',
        'comments': 'Kommentare',
        invertOrder: true
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
  "limit": 25
};

function filterOwnPosts(items, username) {
    return items.filter(item => {
        const isOwnPost = item.post_type === 'regular';
        const isAuthor = item.author.username === username;
        return isOwnPost && isAuthor;
    });
}

function updateReadme(generatedCardsData, maxCards) {
    const readmePath = path.join(USER_REPO_PATH, 'README.md');
    let readme = fs.readFileSync(readmePath, 'utf8');
    
    // Obtener información del repositorio desde variables de entorno de GitHub Actions
    const githubRepo = process.env.GITHUB_REPOSITORY || '';
    const githubBranch = process.env.GITHUB_REF_NAME || 'main';
    
    const cardHTML = generatedCardsData.map((card, index) => {
        const lightPath = githubRepo 
            ? `https://github.com/${githubRepo}/blob/${githubBranch}/cards/${card.timestamp}-light.svg`
            : `cards/${card.timestamp}-light.svg`;
        const darkPath = githubRepo 
            ? `https://github.com/${githubRepo}/blob/${githubBranch}/cards/${card.timestamp}-dark.svg`
            : `cards/${card.timestamp}-dark.svg`;
        const postUrl = card.url || `https://linkedin.com/in/${process.env.LINKEDIN_USERNAME}`;
        return `  <a href="${postUrl}">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="${darkPath}">
      <source media="(prefers-color-scheme: light)" srcset="${lightPath}">
      <img alt="LinkedIn Card ${index + 1}" src="${lightPath}" width="320px">
    </picture>
  </a>`;
    }).join('\n');
    
    const fullHTML = `<p align="center">\n${cardHTML}\n</p>`;
    
    const commentTag = process.env.COMMENT_TAG_NAME || 'LINKEDIN-CARDS';
    const beginMarker = `<!-- BEGIN ${commentTag} -->`;
    const endMarker = `<!-- END ${commentTag} -->`;
    const beginIndex = readme.indexOf(beginMarker);
    const endIndex = readme.indexOf(endMarker);
    
    if (beginIndex !== -1 && endIndex !== -1) {
        readme = readme.substring(0, beginIndex) + beginMarker + '\n' + fullHTML + '\n' + endMarker + readme.substring(endIndex + endMarker.length);
        fs.writeFileSync(readmePath, readme, 'utf8');
        console.log('README actualizado con las tarjetas');
    } else {
        console.log(`No se encontraron los marcadores ${beginMarker} y ${endMarker} en README.md`);
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
    const outputDir = path.join(USER_REPO_PATH, 'cards');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const hasImages = post.media && (post.media.type === 'image' || post.media.type === 'images');
    const images = hasImages ? (post.media.images || [{ url: post.media.url }]) : [];
    
    const name = `${post.author.first_name} ${post.author.last_name || ''}`.trim();
    const bio = post.author.headline || '';
    const profilePicture = await fetchImageAsBase64(post.author.profile_picture);
    const text = post.text
    const timeRaw = post.posted_at.relative.split('•')[0].trim();
    const language = process.env.LANGUAGE || 'en';
    const time = translateRelativeTime(timeRaw, language);
    const reactions = post.stats.total_reactions;
    const commentCount = post.stats.comments;
    const commentKey = commentCount === 1 ? 'comment' : 'comments';
    const commentsText = translations[language]?.[commentKey] || (commentCount === 1 ? 'comment' : 'comments');
    const comments = `${commentCount} ${commentsText}`;
    
    const imageBase64 = [];
    for (let i = 0; i < Math.min(images.length, 4); i++) {
        imageBase64.push(await fetchImageAsBase64(images[i].url));
    }
    
    const themes = ['light', 'dark'];
    
    for (const theme of themes) {
        const templateName = hasImages ? `linkedin-post-${theme}.svg` : `linkedin-post-${theme}-text.svg`;
        const templatePath = path.join(ACTION_PATH, 'templates', templateName);
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
        // Ensure required directories exist
        const cardsDir = path.join(USER_REPO_PATH, 'cards');
        if (!fs.existsSync(cardsDir)) {
            fs.mkdirSync(cardsDir, { recursive: true });
        }
        
        console.log('Fetching LinkedIn posts...');
        const run = await client.actor("LQQIXN9Othf8f7R5n").call(input);
        const { items } = await client.dataset(run.defaultDatasetId).listItems();
        
        const ownPosts = filterOwnPosts(items, process.env.LINKEDIN_USERNAME);
        const maxCards = parseInt(process.env.MAX_CARDS_TO_GENERATE || '4', 10);
        const postsToGenerate = ownPosts.slice(0, maxCards);
        
        if (postsToGenerate.length === 0) {
            console.log('No posts found');
            return;
        }
        
        console.log(`Generating cards for ${postsToGenerate.length} posts...`);
        
        const generatedCardsData = [];
        for (const post of postsToGenerate) {
            await generateCard(post);
            generatedCardsData.push({
                timestamp: post.posted_at.timestamp.toString(),
                url: post.url
            });
        }
        
        updateReadme(generatedCardsData, maxCards);
        console.log('✅ Cards generated successfully!');
        
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
})();
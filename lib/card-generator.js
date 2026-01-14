import fs from 'fs';
import path from 'path';
import { fetchImageAsBase64 } from './image-utils.js';
import { getAnimationKeyframes } from './animations.js';
import { translateRelativeTime } from './translations.js';

/**
 * Generate inline SVG play button that works in foreignObject
 * @param {string} theme - 'light' or 'dark'
 * @returns {string} HTML/CSS play button overlay
 */
function generatePlayButtonHTML(theme) {
    const bgColor = theme === 'dark' 
        ? 'rgba(0, 0, 0, 0.7)' 
        : 'rgba(0, 0, 0, 0.6)';
    const iconColor = '#ffffff';
    
    return `
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; pointer-events: none;">
                    <div style="width: 68px; height: 68px; border-radius: 50%; background: ${bgColor}; display: flex; align-items: center; justify-content: center; border: 3px solid rgba(255,255,255,0.9); box-shadow: 0 4px 15px rgba(0,0,0,0.4);">
                        <div style="width: 0; height: 0; border-top: 14px solid transparent; border-bottom: 14px solid transparent; border-left: 22px solid ${iconColor}; margin-left: 5px;"></div>
                    </div>
                </div>`;
}

/**
 * Generate SVG card for a LinkedIn post
 * @param {Object} post - LinkedIn post object
 * @param {string} outputDir - Directory to save generated cards
 * @param {string} templateDir - Directory containing SVG templates
 * @param {Object} options - Generation options
 * @returns {Promise<Object>} Object with timestamp and url of generated card
 */
export async function generateCard(post, outputDir, templateDir, options = {}) {
    const {
        language = 'en',
        translations = {}
    } = options;
    
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const hasImages = post.media && (post.media.type === 'image' || post.media.type === 'images');
    const isVideo = post.isVideo || post.media?.type === 'video';
    const hasMedia = isVideo || hasImages;
    
    let images = [];
    if (isVideo) {
        const thumbnailUrl = post.imageUrl || post.media?.thumbnail || null;
        if (thumbnailUrl) {
            images.push(thumbnailUrl);
        }
    } else if (hasImages) {
        if (Array.isArray(post.media?.images)) {
            images = post.media.images.map(img => typeof img === 'string' ? img : img.url);
        } else if (post.imageUrl) {
            images.push(post.imageUrl);
        }
    }
    
    const name = `${post.author.first_name} ${post.author.last_name || ''}`.trim();
    const bio = post.author.headline || '';
    const profilePicture = await fetchImageAsBase64(post.author.profile_picture);
    const text = post.text;
    const timeRaw = post.posted_at.relative.split('•')[0].trim();
    const time = translateRelativeTime(timeRaw, language, translations);
    const reactions = post.stats.total_reactions;
    const commentCount = post.stats.comments;
    const commentKey = commentCount === 1 ? 'comment' : 'comments';
    const commentsText = translations[language]?.[commentKey] || (commentCount === 1 ? 'comment' : 'comments');
    const comments = `${commentCount} ${commentsText}`;
    
    const imageBase64 = [];
    for (let i = 0; i < Math.min(images.length, 4); i++) {
        // Handle both string URLs and object URLs
        const imgUrl = typeof images[i] === 'string' ? images[i] : images[i].url;
        imageBase64.push(await fetchImageAsBase64(imgUrl));
    }
    
    const themes = ['light', 'dark'];
    
    for (const theme of themes) {
        const templateName = hasMedia ? `linkedin-post-${theme}.svg` : `linkedin-post-${theme}-text.svg`;
        const templatePath = path.join(templateDir, templateName);
        let template = fs.readFileSync(templatePath, 'utf8');
        
        template = template.replace(/\$\{name\}/g, name);
        template = template.replace(/\$\{bio\}/g, bio);
        template = template.replace(/\$\{profile_picture\}/g, profilePicture);
        template = template.replace(/\$\{text\}/g, text);
        template = template.replace(/\$\{time\}/g, time);
        template = template.replace(/\$\{reactions\}/g, reactions);
        template = template.replace(/\$\{comments\}/g, comments);
        
        if (hasMedia && imageBase64.length > 0) {
            
            if (isVideo) {
                // Single thumbnail with play button overlay
                const galleryDiv = `            <div class="gallery-slide img-1" style="background-image: url(${imageBase64[0]}); position: relative;">
                </div>${generatePlayButtonHTML(theme)}`;
                
                template = template.replace(
                    /<div class="gallery-container">\s*<\/div>/,
                    `<div class="gallery-container" style="position: relative;">\n${galleryDiv}\n        </div>`
                );
                
                // Remove animation for video thumbnails (static image)
                template = template.replace(
                    /(@keyframes\s+\w+\s*\{[^}]+\}\s*){1,4}/,
                    ''
                );
                template = template.replace(
                    /(\.img-\d+\s*\{[^}]+\}\s*){1,4}/,
                    '.img-1 { opacity: 1; }'
                );
            } else {
                
                const animations = getAnimationKeyframes(imageBase64.length);
                
                // Replace keyframes - more flexible regex to match any number of keyframes
                template = template.replace(
                    /(@keyframes\s+\w+\s*\{[^}]+\}\s*){1,4}/,
                    animations.keyframes
                );
                
                // Replace animation classes - more flexible regex
                template = template.replace(
                    /(\.img-\d+\s*\{[^}]+\}\s*){1,4}/,
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
        }
        
        const timestamp = post.posted_at.timestamp;
        const outputPath = path.join(outputDir, `${timestamp}-${theme}.svg`);
        fs.writeFileSync(outputPath, template, 'utf8');
        console.log(`Card generated: ${outputPath} ${isVideo ? '(video)' : ''}`);
    }
    
    return {
        timestamp: post.posted_at.timestamp.toString(),
        url: post.url
    };
}

# LinkedIn Cards Generator

Automatically generate beautiful LinkedIn post cards and display them in your GitHub profile README. The cards update daily with your latest posts.

<!-- BEGIN LINKEDIN -->
<!-- END LINKEDIN -->

## Features

- 🎨 Automatic card generation from LinkedIn posts
- 🌓 Light and dark theme support
- 🔄 Daily automatic updates via GitHub Actions
- 🌍 Multi-language support (English, Spanish...) Feel free to create a pull request adding yours.
- 📱 Responsive SVG cards

## Setup

### 1. Fork or Clone this Repository

```bash
git clone https://github.com/alexcerezo/linkedin-cards.git
cd linkedin-cards
```

### 2. Configure Repository Secrets and Variables

**Create a Secret:**

Go to Settings → Secrets and variables → Actions → Secrets → New repository secret:

| Secret Name | Description | Example |
| `APIFY_API_TOKEN` | Your Apify API token | `apify_api_xxxxx` |

**Create Variables:**

Go to Settings → Secrets and variables → Actions → Variables → New repository variable:

| Variable Name | Description | Example |
|--------------|-------------|---------|
| `LINKEDIN_USERNAME` | Your LinkedIn username | `johndoe` |
| `MAX_CARDS_TO_GENERATE` | Maximum number of cards to display | `4` |
| `LANGUAGE` | Card language (`en`, `es` ...) | `en` |

**How to get your Apify API token:**
1. Create a free account at [apify.com](https://apify.com)
2. Go to Settings → Integrations → API tokens
3. Copy your token

**How to find your LinkedIn username:**
Your LinkedIn profile URL looks like: `linkedin.com/in/johndoe` - your username is `johndoe`

### 3. Add Markers to Your README

In your profile README (or any README where you want to display the cards), add these markers:

```markdown
<!-- BEGIN LINKEDIN -->
<!-- END LINKEDIN -->
```

The cards will be automatically inserted between these markers.

### 4. Enable GitHub Actions

The workflow runs automatically every day at midnight UTC. You can also trigger it manually:

1. Go to Actions tab in your repository
2. Select "Auto-Generate LinkedIn Cards"
3. Click "Run workflow"

### 5. Wait for the First Run

After the first execution, your README will display your latest LinkedIn posts as cards.

## Local Development

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
APIFY_API_TOKEN=your_apify_api_token_here
LINKEDIN_USERNAME=your_linkedin_username
MAX_CARDS_TO_GENERATE=4
LANGUAGE=en
```

Run the generator:

```bash
node scripts/auto-generate.js
```

## Language Support

Currently supported languages:
- English (`en`)
- Spanish (`es`)

To change the language, update the `LANGUAGE` variable in your repository settings.

### Adding New Languages

Edit `scripts/auto-generate.js` and add your translations:

```javascript
const translations = {
    es: { /* Spanish translations */ },
    en: { /* English translations */ },
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
        'ago': 'il y a',
        invertOrder: true
    }
};
```

Set `invertOrder: true` if your language places "ago" at the beginning (like Spanish: "Hace 3 semanas").

## How It Works

1. The GitHub Action runs daily
2. Fetches your latest LinkedIn posts via Apify
3. Generates SVG cards for new posts
4. Updates your README automatically
5. Commits changes to your repository

## Customization

### Card Templates

Templates are located in `templates/`:
- `linkedin-post-light.svg` - Light theme with images
- `linkedin-post-dark.svg` - Dark theme with images
- `linkedin-post-light-text.svg` - Light theme text-only
- `linkedin-post-dark-text.svg` - Dark theme text-only

Edit these files to customize the card appearance.

### Maximum Cards

Change `MAX_CARDS_TO_GENERATE` variable to control how many cards are displayed (recommended: 4-6).

## Example

See this README for a live example of generated cards.

## License

MIT License - feel free to use and modify.

## Credits

Created by [Alejandro Cerezo](https://linkedin.com/in/alexcerezocontreras)
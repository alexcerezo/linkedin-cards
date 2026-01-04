# LinkedIn Cards Generator

Automatically generate beautiful LinkedIn post cards and display them in your GitHub profile README. The cards update daily with your latest posts.

<!-- BEGIN LINKEDIN-CARDS -->
<p align="center">
  <a href="https://www.linkedin.com/posts/alexcerezocontreras_fundamentos-de-github-activity-7410580273488138241-sIZP?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAGDzZvgBnXqsXb6EUzbmoDxCnI-PyrDZsvM">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://github.com/alexcerezo/alexcerezo/blob/main/cards/1766820019123-dark.svg">
      <source media="(prefers-color-scheme: light)" srcset="https://github.com/alexcerezo/alexcerezo/blob/main/cards/1766820019123-light.svg">
      <img alt="LinkedIn Card 1" src="https://github.com/alexcerezo/alexcerezo/blob/main/cards/1766820019123-light.svg" width="320px">
    </picture>
  </a>
  <a href="https://www.linkedin.com/posts/alexcerezocontreras_gsec-activity-7404566046545903616-oy71?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAGDzZvgBnXqsXb6EUzbmoDxCnI-PyrDZsvM">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://github.com/alexcerezo/alexcerezo/blob/main/cards/1765386115681-dark.svg">
      <source media="(prefers-color-scheme: light)" srcset="https://github.com/alexcerezo/alexcerezo/blob/main/cards/1765386115681-light.svg">
      <img alt="LinkedIn Card 2" src="https://github.com/alexcerezo/alexcerezo/blob/main/cards/1765386115681-light.svg" width="320px">
    </picture>
  </a>
  <a href="https://www.linkedin.com/posts/alexcerezocontreras_hoy-he-tenido-la-suerte-de-asistir-al-primer-activity-7377475497473146880-MYnC?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAGDzZvgBnXqsXb6EUzbmoDxCnI-PyrDZsvM">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://github.com/alexcerezo/alexcerezo/blob/main/cards/1758927225464-dark.svg">
      <source media="(prefers-color-scheme: light)" srcset="https://github.com/alexcerezo/alexcerezo/blob/main/cards/1758927225464-light.svg">
      <img alt="LinkedIn Card 3" src="https://github.com/alexcerezo/alexcerezo/blob/main/cards/1758927225464-light.svg" width="320px">
    </picture>
  </a>
  <a href="https://www.linkedin.com/posts/alexcerezocontreras_hoy-a-tocado-asistir-a-la-charla-de-azurem%C3%A1laga-activity-7374160674068877312-biYP?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAGDzZvgBnXqsXb6EUzbmoDxCnI-PyrDZsvM">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://github.com/alexcerezo/alexcerezo/blob/main/cards/1758136909978-dark.svg">
      <source media="(prefers-color-scheme: light)" srcset="https://github.com/alexcerezo/alexcerezo/blob/main/cards/1758136909978-light.svg">
      <img alt="LinkedIn Card 4" src="https://github.com/alexcerezo/alexcerezo/blob/main/cards/1758136909978-light.svg" width="320px">
    </picture>
  </a>
</p>
<!-- END LINKEDIN-CARDS -->

## Features

- 🎨 Automatic card generation from LinkedIn posts
- 🌓 Light and dark theme support
- 🔄 Daily automatic updates via GitHub Actions
- 🌍 Multi-language support (English, Spanish, French, German...) Feel free to create a pull request adding yours.
- 📱 Responsive SVG cards
- 🚀 Easy setup - just add to your workflow!

## Quick Setup (Recommended)

### 1. Add Comment Tags to Your README

In your profile README (or any README where you want to display the cards), add these markers:

```markdown
<!-- BEGIN LINKEDIN-CARDS -->
<!-- END LINKEDIN-CARDS -->
```

### 2. Create Workflow File

Create `.github/workflows/linkedin-cards.yml` in your repository:

```yaml
name: LinkedIn Cards

on:
  schedule:
    - cron: "0 0 * * *"  # Runs daily at midnight
  workflow_dispatch:

permissions:
  contents: write

jobs:
  linkedin-cards:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: alexcerezo/linkedin-cards@main
        with:
          apify_api_token: ${{ secrets.APIFY_API_TOKEN }}
          linkedin_username: ${{ vars.LINKEDIN_USERNAME }}
          max_cards_to_generate: 4
          language: en
```

### 3. Configure Secrets and Variables

**Create a Secret:**

Go to Settings → Secrets and variables → Actions → Secrets:

| Name | Description | How to get |
|------|-------------|-----------|
| `APIFY_API_TOKEN` | Your Apify API token | Create free account at [apify.com](https://apify.com) → Settings → API tokens |

**Create a Variable:**

Go to Settings → Secrets and variables → Actions → Variables:

| Name | Description | Example |
|------|-------------|---------|
| `LINKEDIN_USERNAME` | Your LinkedIn username | `johndoe` (from `linkedin.com/in/johndoe`) |

### 4. Run the Workflow

Go to Actions tab → LinkedIn Cards → Run workflow

That's it! Your README will automatically update with your latest LinkedIn posts. 🎉

---

## Advanced Setup (Fork Repository)

If you want to customize templates or contribute to the project:

---

## Advanced Setup (Fork Repository)

If you want to customize templates or contribute to the project:

### 1. Fork or Clone this Repository

```bash
git clone https://github.com/alexcerezo/linkedin-cards.git
cd linkedin-cards
```

### 2. Configure Repository Secrets and Variables

Same as Quick Setup above.

### 3. Add Markers to Your README

```markdown
<!-- BEGIN LINKEDIN-CARDS -->
<!-- END LINKEDIN-CARDS -->
```

### 4. Enable GitHub Actions

The included workflow runs automatically. You can also trigger it manually from the Actions tab.

---

## Configuration Options

### Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `apify_api_token` | Apify API token | ✅ Yes | - |
| `linkedin_username` | Your LinkedIn username | ✅ Yes | - |
| `max_cards_to_generate` | Max number of cards | ❌ No | `4` |
| `language` | Card language | ❌ No | `en` |
| `comment_tag_name` | Comment tag for README injection | ❌ No | `LINKEDIN-CARDS` |

### Supported Languages

- `en` - English
- `es` - Spanish  
- `fr` - French
- `de` - German

---

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

---

## Adding New Languages

Want to add support for your language? Edit [auto-generate.js](scripts/auto-generate.js) and add your translations:

```javascript
const translations = {
    // ... existing translations
    pt: {  // Portuguese example
        'second': 'segundo',
        'seconds': 'segundos',
        'minute': 'minuto',
        'minutes': 'minutos',
        'hour': 'hora',
        'hours': 'horas',
        'day': 'dia',
        'days': 'dias',
        'week': 'semana',
        'weeks': 'semanas',
        'month': 'mês',
        'months': 'meses',
        'year': 'ano',
        'years': 'anos',
        'ago': 'Há',
        'comments': 'comentários',
        invertOrder: true
    }
};
```

Set `invertOrder: true` if your language places "ago" at the beginning (like Spanish: "Hace 3 semanas").

Pull requests are welcome! 🌍

---

## How It Works

1. The GitHub Action runs on a schedule (daily by default)
2. Fetches your latest LinkedIn posts via Apify
3. Generates SVG cards for your most recent posts
4. Updates your README with the new cards
5. Commits and pushes the changes to your repository

The action regenerates cards each time it runs, always showing your latest posts.

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

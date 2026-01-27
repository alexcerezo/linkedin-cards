# GitHub Readme LinkedIn Card Generator

Automatically generate beautiful LinkedIn post cards and display them in your GitHub profile README. The cards update daily with your latest posts.

<!-- BEGIN LINKEDIN-CARDS -->
<p align="center">
  <a href="https://www.linkedin.com/posts/javiertorralbocortes_a-falta-de-menos-de-una-semana-para-mi-charla-activity-7417475807884779520-jsDx?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAGLXW_oBmL40e0Yr8nStfKZeMgUxnf0LDEY">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="cards/1768481442272-dark.svg">
      <source media="(prefers-color-scheme: light)" srcset="cards/1768481442272-light.svg">
      <img alt="LinkedIn Card 1" src="cards/1768481442272-light.svg" width="320px">
    </picture>
  </a>
  <a href="https://www.linkedin.com/posts/javiertorralbocortes_backend-dotnet-internship-activity-7415042276982239232-Yz4j?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAGLXW_oBmL40e0Yr8nStfKZeMgUxnf0LDEY">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="cards/1767887767926-dark.svg">
      <source media="(prefers-color-scheme: light)" srcset="cards/1767887767926-light.svg">
      <img alt="LinkedIn Card 2" src="cards/1767887767926-light.svg" width="320px">
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
          include_reposts: 'true'
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
| `include_reposts` | Include reposts (quote or simple) | ❌ No | `false` |
| `comment_tag_name` | Comment tag for README injection | ❌ No | `LINKEDIN-CARDS` |

### Supported Languages

- `en` - English
- `es` - Spanish  
- `fr` - French
- `de` - German
- `ar` - Arabic

---

## Local Development

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
# Secret - Keep this private!
APIFY_API_TOKEN=your_apify_api_token_here

# Variables - Can be public
LINKEDIN_USERNAME=alexcerezocontreras
MAX_CARDS_TO_GENERATE=25
LANGUAGE=es  # Options: en, es, fr, de, ar
INCLUDE_REPOSTS=true # Set to 'true' to include reposts

# Development/Testing
USE_MOCK_DATA=true  # Set to 'true' to use mock data instead of calling the API (saves costs during development)
```

Run the generator:

```bash
node scripts/auto-generate.js
```

---

## Adding New Languages

Want to add support for your language? Create a json into the lang folder and add your translations:

```json
      {  // Portuguese example
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

Templates are located in `templates/`. Edit these files to customize the card appearance.

### Maximum Cards

Change `MAX_CARDS_TO_GENERATE` variable to control how many cards are displayed (recommended: 4-6).

## Example

See this README for a live example of generated cards.

## License

MIT License - feel free to use and modify.

## Credits

Created by [Alejandro Cerezo](https://linkedin.com/in/alexcerezocontreras)

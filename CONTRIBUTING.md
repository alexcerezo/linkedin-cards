# Contributing to LinkedIn Cards Generator

Thank you for your interest in contributing to the LinkedIn Cards Generator! We welcome contributions from the community.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Adding New Languages](#adding-new-languages)
- [Coding Guidelines](#coding-guidelines)
- [Testing](#testing)
- [Questions?](#questions)

## Code of Conduct

By participating in this project, you are expected to uphold a welcoming and inclusive environment. Please be respectful and constructive in all interactions.

## How Can I Contribute?

There are many ways to contribute:

- 🐛 **Report bugs** - If you find a bug, please create an issue with details
- 💡 **Suggest features** - Have an idea? Open an issue to discuss it
- 🌍 **Add language support** - Help make the project accessible in more languages
- 📝 **Improve documentation** - Fix typos, clarify instructions, or add examples
- 🎨 **Enhance templates** - Improve the SVG card designs
- 💻 **Submit code** - Fix bugs or implement new features

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/linkedin-cards.git
   cd linkedin-cards
   ```
3. **Add the upstream repository**:
   ```bash
   git remote add upstream https://github.com/alexcerezo/linkedin-cards.git
   ```
4. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Setup

### Prerequisites

- Node.js >= 18
- npm (comes with Node.js)
- Git
- An Apify account with API token (free tier available at [apify.com](https://apify.com))
  - **Note**: The Apify API token is required to fetch real LinkedIn posts from the API
  - **For development**: You can work on templates, translations, and other features without an API token by setting `USE_MOCK_DATA=true` in your `.env` file

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory:
   ```env
   APIFY_API_TOKEN=your_apify_api_token_here
   LINKEDIN_USERNAME=your_linkedin_username
   MAX_CARDS_TO_GENERATE=4
   LANGUAGE=en
   USE_MOCK_DATA=false  # Set to 'true' to use mock data instead of calling the API
   ```

3. Run the generator to test:
   ```bash
   node scripts/auto-generate.js
   ```

### Project Structure

```
linkedin-cards/
├── lib/                    # Core library files
│   ├── card-generator.js   # SVG card generation logic
│   ├── linkedin-client.js  # LinkedIn API client
│   ├── readme-updater.js   # README injection logic
│   ├── translations.js     # Language translations loader
│   ├── image-utils.js      # Image processing utilities
│   └── animations.js       # SVG animation utilities
├── scripts/                # Executable scripts
│   └── auto-generate.js    # Main generation script
├── templates/              # SVG card templates
│   ├── linkedin-post-light.svg
│   ├── linkedin-post-dark.svg
│   ├── linkedin-post-light-text.svg
│   └── linkedin-post-dark-text.svg
├── lang/                   # Language translation files
│   ├── en.json
│   ├── es.json
│   ├── fr.json
│   └── de.json
└── action.yml             # GitHub Action configuration
```

## Pull Request Process

1. **Update your fork** with the latest changes from main:
   ```bash
   git fetch upstream
   git merge upstream/main
   ```
   
   *Advanced: You can also use `git rebase upstream/main` if you're comfortable with rebasing.*

2. **Make your changes** following the [coding guidelines](#coding-guidelines)

3. **Test your changes** thoroughly

4. **Commit your changes** with clear, descriptive messages:
   ```bash
   git add .
   git commit -m "Add feature: description of your changes"
   ```

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** on GitHub:
   - Provide a clear title and description
   - Reference any related issues (e.g., "Fixes #123")
   - Explain what your changes do and why they're needed
   - Include screenshots for UI/template changes

7. **Respond to feedback** - Maintainers may request changes

8. Once approved, your PR will be merged!

## Adding New Languages

We encourage adding support for new languages! Here's how:

1. Create a new JSON file in the `lang/` directory (e.g., `pt.json` for Portuguese)

2. Add the following translations:
   ```json
   {
     "second": "segundo",
     "seconds": "segundos",
     "minute": "minuto",
     "minutes": "minutos",
     "hour": "hora",
     "hours": "horas",
     "day": "dia",
     "days": "dias",
     "week": "semana",
     "weeks": "semanas",
     "month": "mês",
     "months": "meses",
     "year": "ano",
     "years": "anos",
     "ago": "Há",
     "comment": "comentário",
     "comments": "comentários",
     "invertOrder": true
   }
   ```

3. Set `invertOrder: true` if your language places "ago" at the beginning (like Spanish: "Hace 3 semanas")

4. Test the new language:
   ```bash
   LANGUAGE=pt node scripts/auto-generate.js
   ```

5. Update the README.md to list the new language in the "Supported Languages" section

6. Submit a pull request with your changes

## Coding Guidelines

### JavaScript Style

- Use **ES6+ features** (const/let, arrow functions, async/await)
- Use **meaningful variable names** that describe their purpose
- Follow the existing code style in the project
- Add **comments** for complex logic
- Keep functions **small and focused** on a single task

### File Organization

- Place reusable logic in the `lib/` directory
- Keep executable scripts in the `scripts/` directory
- Store SVG templates in the `templates/` directory
- Add language files to the `lang/` directory

### Commits

- Write clear, concise commit messages
- Use present tense ("Add feature" not "Added feature")
- Reference issues and PRs when relevant
- Keep commits focused on a single change

### SVG Templates

- Maintain both light and dark theme versions
- Ensure responsive design (width and viewBox)
- Test with different content lengths
- Keep file sizes optimized

## Testing

Before submitting a pull request:

1. **Test the generator** with your changes:
   ```bash
   node scripts/auto-generate.js
   ```

2. **Verify the generated cards** look correct:
   - Check both light and dark themes
   - Test with different content types (text-only, with images)
   - Verify different languages if applicable

3. **Test the GitHub Action** locally if possible or in your fork

4. **Check for errors** in the console output

## Questions?

If you have questions or need help:

- Open an issue with the "question" label
- Check existing issues to see if your question has been answered
- Review the README.md for usage instructions

## Recognition

Contributors will be recognized in the project. Thank you for helping make LinkedIn Cards Generator better! 🎉

---

**Happy Contributing!** 🚀

*Created by [Alejandro Cerezo](https://linkedin.com/in/alexcerezocontreras)*

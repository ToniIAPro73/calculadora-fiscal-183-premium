# 183-Day Tax Calculator Premium Claude Code

Premium version of the 183-day fiscal residency calculator for digital nomads in Spain and the EU. Designed with a luxury visual system and comprehensive tax planning features.

## Features

- **Accurate Tax Calculations**: Calculate fiscal residency status based on the 183-day rule
- **Audit-Ready PDF Reports**: Generate professional reports with detailed date ranges
- **Multi-Language Support**: Spanish, English, and additional languages
- **Dark Theme Support**: Comfortable night mode with glass-morphism design
- **Date Range Management**: Add, manage, and merge multiple date ranges
- **Real-Time Calculations**: Instant updates as you modify date ranges

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite 6.2
- **Styling**: Tailwind CSS 4.1 with custom glass-morphism components
- **UI Components**: Radix UI (Dialog, Popover, Progress, Tooltip, Label)
- **Icons**: Lucide React
- **PDF Generation**: jsPDF
- **Routing**: React Router 7.13
- **Notifications**: Sonner Toast
- **Date Handling**: date-fns 4.1

## Quick Start

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

The app will start on `http://localhost:5173` by default.

### Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── App.tsx                 # Main app with routing
├── main.tsx                # React DOM entry point
├── index.css               # Global styles
├── components/             # React components
│   ├── ui/                 # Shadcn-style UI components
│   └── [feature components]
├── contexts/               # React contexts
│   ├── ThemeContext.tsx    # Dark/light theme
│   └── i18nContext.tsx     # Multi-language support
├── lib/                    # Utility functions
├── pages/                  # Page routes
│   ├── TaxNomadCalculator.tsx
│   ├── PrivacyPolicy.tsx
│   └── TermsOfService.tsx
```

## Features Deferred to Phase 2

- Stripe integration
- Advanced statistics
- Database integration
- AI recommendations
- Backend services

## License

Proprietary - All rights reserved

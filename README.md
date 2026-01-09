# Opportunity Finder

Discover the best project ideas from Reddit opportunities, analyzed by AI.

## Features

- 🔍 **Advanced Filtering** - Filter by score, complexity, revenue potential, novelty, and demand
- 📊 **Smart Sorting** - Sort by multiple criteria
- 🏷️ **Tag Cloud** - Popular keywords for quick discovery
- 🎯 **Subreddit Filtering** - Browse by specific communities
- 💡 **AI Analysis** - Each opportunity analyzed for technical complexity, revenue potential, novelty, and market demand

## Setup

1. Clone the repository:
```bash
git clone https://github.com/kurosh87/opportunity-finder.git
cd opportunity-finder
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables in `.env.local`:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=neven_scraper
DB_USER=your_username
DB_PASSWORD=your_password
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. For database, use:
   - [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
   - [Supabase](https://supabase.com/)
   - [Neon](https://neon.tech/)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: shadcn/ui + Tailwind CSS
- **Database**: PostgreSQL
- **Language**: TypeScript

## License

MIT

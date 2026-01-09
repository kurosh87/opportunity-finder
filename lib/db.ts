import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'neven_scraper',
  user: process.env.DB_USER || 'pejman',
  password: process.env.DB_PASSWORD || '',
});

export interface Opportunity {
  id: number;
  title: string;
  category: string;
  description: string;
  opportunity: string;
  subreddit: string;
  member_count: string;
  timestamp: string;
  points: number;
  comments: number;
  source_url: string;
  technical_complexity: number;
  revenue_potential: number;
  novelty_score: number;
  market_demand: number;
  overall_score: number;
  ai_analysis: string;
  analyzed_at: string;
  created_at: string;
}

export async function getOpportunities(params: {
  minScore?: number;
  maxComplexity?: number;
  minRevenue?: number;
  minNovelty?: number;
  minDemand?: number;
  search?: string;
  subreddit?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}): Promise<{ opportunities: Opportunity[]; total: number }> {
  const {
    minScore = 0,
    maxComplexity = 10,
    minRevenue = 0,
    minNovelty = 0,
    minDemand = 0,
    search = '',
    subreddit = '',
    sortBy = 'overall_score',
    sortOrder = 'desc',
    limit = 50,
    offset = 0,
  } = params;

  const conditions: string[] = ['analyzed_at IS NOT NULL'];
  const values: (string | number)[] = [];
  let paramIndex = 1;

  if (minScore > 0) {
    conditions.push(`overall_score >= $${paramIndex++}`);
    values.push(minScore);
  }

  if (maxComplexity < 10) {
    conditions.push(`technical_complexity <= $${paramIndex++}`);
    values.push(maxComplexity);
  }

  if (minRevenue > 0) {
    conditions.push(`revenue_potential >= $${paramIndex++}`);
    values.push(minRevenue);
  }

  if (minNovelty > 0) {
    conditions.push(`novelty_score >= $${paramIndex++}`);
    values.push(minNovelty);
  }

  if (minDemand > 0) {
    conditions.push(`market_demand >= $${paramIndex++}`);
    values.push(minDemand);
  }

  if (search) {
    conditions.push(`(title ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR ai_analysis ILIKE $${paramIndex})`);
    values.push(`%${search}%`);
    paramIndex++;
  }

  if (subreddit) {
    conditions.push(`subreddit = $${paramIndex++}`);
    values.push(subreddit);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const allowedSortColumns = [
    'overall_score',
    'technical_complexity',
    'revenue_potential',
    'novelty_score',
    'market_demand',
    'points',
    'comments',
    'created_at',
  ];
  const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'overall_score';
  const safeSortOrder = sortOrder === 'asc' ? 'ASC' : 'DESC';

  const countQuery = `SELECT COUNT(*) FROM opportunities ${whereClause}`;
  const countResult = await pool.query(countQuery, values);
  const total = parseInt(countResult.rows[0].count);

  const dataQuery = `
    SELECT * FROM opportunities
    ${whereClause}
    ORDER BY ${safeSortBy} ${safeSortOrder} NULLS LAST
    LIMIT $${paramIndex++} OFFSET $${paramIndex++}
  `;
  values.push(limit, offset);

  const dataResult = await pool.query(dataQuery, values);

  return {
    opportunities: dataResult.rows,
    total,
  };
}

export async function getSubreddits(): Promise<{ subreddit: string; count: number }[]> {
  const result = await pool.query(`
    SELECT subreddit, COUNT(*) as count
    FROM opportunities
    WHERE analyzed_at IS NOT NULL AND subreddit IS NOT NULL AND subreddit != ''
    GROUP BY subreddit
    ORDER BY count DESC
    LIMIT 50
  `);
  return result.rows;
}

export async function getStats(): Promise<{
  total: number;
  analyzed: number;
  avgScore: number;
  topScore: number;
}> {
  const result = await pool.query(`
    SELECT
      COUNT(*) as total,
      COUNT(CASE WHEN analyzed_at IS NOT NULL THEN 1 END) as analyzed,
      ROUND(AVG(overall_score)::numeric, 2) as avg_score,
      MAX(overall_score) as top_score
    FROM opportunities
  `);
  return {
    total: parseInt(result.rows[0].total),
    analyzed: parseInt(result.rows[0].analyzed),
    avgScore: parseFloat(result.rows[0].avg_score) || 0,
    topScore: parseFloat(result.rows[0].top_score) || 0,
  };
}

export async function getKeywords(): Promise<{ word: string; count: number }[]> {
  const result = await pool.query(`
    SELECT word, COUNT(*) as count
    FROM (
      SELECT LOWER(unnest(regexp_split_to_array(title, '\\s+'))) as word
      FROM opportunities
      WHERE analyzed_at IS NOT NULL
    ) words
    WHERE length(word) > 3
      AND word NOT IN ('what', 'this', 'that', 'with', 'from', 'have', 'will', 'your', 'there', 'their', 'about', 'would', 'which', 'when', 'make', 'like', 'just', 'into', 'over', 'such', 'than', 'them', 'been', 'some', 'could', 'more', 'very', 'after', 'most', 'also', 'made', 'then', 'well', 'back', 'only', 'come', 'being', 'were', 'much', 'where', 'does', 'here', 'need', 'help', 'looking', 'best', 'good', 'want', 'anyone', 'know', 'find', 'tool')
      AND word ~ '^[a-z]+$'
    GROUP BY word
    ORDER BY count DESC
    LIMIT 100
  `);
  return result.rows;
}

export default pool;

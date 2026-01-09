'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Opportunity {
  id: number;
  title: string;
  category: string;
  description: string;
  opportunity: string;
  subreddit: string;
  points: number;
  comments: number;
  source_url: string;
  technical_complexity: number;
  revenue_potential: number;
  novelty_score: number;
  market_demand: number;
  overall_score: number;
  ai_analysis: string;
}

interface Stats {
  total: number;
  analyzed: number;
  avgScore: number;
  topScore: number;
}

interface Subreddit {
  subreddit: string;
  count: number;
}

interface Keyword {
  word: string;
  count: number;
}

export default function Home() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [subreddits, setSubreddits] = useState<Subreddit[]>([]);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState<number | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [minScore, setMinScore] = useState(0);
  const [maxComplexity, setMaxComplexity] = useState(10);
  const [minRevenue, setMinRevenue] = useState(0);
  const [minNovelty, setMinNovelty] = useState(0);
  const [minDemand, setMinDemand] = useState(0);
  const [selectedSubreddit, setSelectedSubreddit] = useState('');
  const [sortBy, setSortBy] = useState('overall_score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const limit = 25;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        minScore: minScore.toString(),
        maxComplexity: maxComplexity.toString(),
        minRevenue: minRevenue.toString(),
        minNovelty: minNovelty.toString(),
        minDemand: minDemand.toString(),
        search,
        subreddit: selectedSubreddit,
        sortBy,
        sortOrder,
        limit: limit.toString(),
        offset: (page * limit).toString(),
      });

      const res = await fetch(`/api/opportunities?${params}`);
      const data = await res.json();
      setOpportunities(data.opportunities);
      setTotal(data.total);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  }, [minScore, maxComplexity, minRevenue, minNovelty, minDemand, search, selectedSubreddit, sortBy, sortOrder, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetch('/api/opportunities?action=stats')
      .then((res) => res.json())
      .then(setStats);
    fetch('/api/opportunities?action=subreddits')
      .then((res) => res.json())
      .then(setSubreddits);
    fetch('/api/opportunities?action=keywords')
      .then((res) => res.json())
      .then(setKeywords);
  }, []);

  const resetFilters = () => {
    setSearch('');
    setMinScore(0);
    setMaxComplexity(10);
    setMinRevenue(0);
    setMinNovelty(0);
    setMinDemand(0);
    setSelectedSubreddit('');
    setSortBy('overall_score');
    setSortOrder('desc');
    setPage(0);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 7) return 'bg-green-500';
    if (score >= 5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Opportunity Finder</h1>
            <p className="text-zinc-400">Discover the best project ideas from Reddit</p>
          </div>
          {stats && (
            <div className="flex gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.analyzed.toLocaleString()}</div>
                <div className="text-zinc-400">Analyzed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{stats.topScore}</div>
                <div className="text-zinc-400">Top Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.avgScore}</div>
                <div className="text-zinc-400">Avg Score</div>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Filters</CardTitle>
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Reset
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">Search</label>
                <Input
                  placeholder="Search opportunities..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(0);
                  }}
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">Subreddit</label>
                <Select
                  value={selectedSubreddit}
                  onValueChange={(v) => {
                    setSelectedSubreddit(v === 'all' ? '' : v);
                    setPage(0);
                  }}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700">
                    <SelectValue placeholder="All subreddits" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All subreddits</SelectItem>
                    {subreddits.map((s) => (
                      <SelectItem key={s.subreddit} value={s.subreddit}>
                        {s.subreddit} ({s.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">Sort By</label>
                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="overall_score">Overall Score</SelectItem>
                      <SelectItem value="revenue_potential">Revenue</SelectItem>
                      <SelectItem value="novelty_score">Novelty</SelectItem>
                      <SelectItem value="market_demand">Demand</SelectItem>
                      <SelectItem value="technical_complexity">Complexity</SelectItem>
                      <SelectItem value="points">Points</SelectItem>
                      <SelectItem value="comments">Comments</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="bg-zinc-800 border-zinc-700"
                  >
                    {sortOrder === 'desc' ? '↓' : '↑'}
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <label className="text-sm text-zinc-400 mb-2 block">
                  Min Score: {minScore}
                </label>
                <Slider
                  value={[minScore]}
                  onValueChange={([v]) => {
                    setMinScore(v);
                    setPage(0);
                  }}
                  max={10}
                  step={0.5}
                  className="py-2"
                />
              </div>
              <div>
                <label className="text-sm text-zinc-400 mb-2 block">
                  Max Complexity: {maxComplexity}
                </label>
                <Slider
                  value={[maxComplexity]}
                  onValueChange={([v]) => {
                    setMaxComplexity(v);
                    setPage(0);
                  }}
                  max={10}
                  step={0.5}
                  className="py-2"
                />
              </div>
              <div>
                <label className="text-sm text-zinc-400 mb-2 block">
                  Min Revenue: {minRevenue}
                </label>
                <Slider
                  value={[minRevenue]}
                  onValueChange={([v]) => {
                    setMinRevenue(v);
                    setPage(0);
                  }}
                  max={10}
                  step={0.5}
                  className="py-2"
                />
              </div>
              <div>
                <label className="text-sm text-zinc-400 mb-2 block">
                  Min Novelty: {minNovelty}
                </label>
                <Slider
                  value={[minNovelty]}
                  onValueChange={([v]) => {
                    setMinNovelty(v);
                    setPage(0);
                  }}
                  max={10}
                  step={0.5}
                  className="py-2"
                />
              </div>
              <div>
                <label className="text-sm text-zinc-400 mb-2 block">
                  Min Demand: {minDemand}
                </label>
                <Slider
                  value={[minDemand]}
                  onValueChange={([v]) => {
                    setMinDemand(v);
                    setPage(0);
                  }}
                  max={10}
                  step={0.5}
                  className="py-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Keywords Tag Cloud */}
        {keywords.length > 0 && (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Popular Keywords</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {keywords.slice(0, 40).map((k) => (
                  <Badge
                    key={k.word}
                    variant="secondary"
                    className="cursor-pointer hover:bg-zinc-600 transition-colors"
                    style={{
                      fontSize: `${Math.max(0.7, Math.min(1.3, 0.7 + k.count / 100))}rem`,
                    }}
                    onClick={() => {
                      setSearch(k.word);
                      setPage(0);
                    }}
                  >
                    {k.word} ({k.count})
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">
                {loading ? 'Loading...' : `${total.toLocaleString()} opportunities found`}
              </CardTitle>
              <div className="flex gap-2 items-center text-sm text-zinc-400">
                Page {page + 1} of {totalPages || 1}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                >
                  ←
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(page + 1)}
                >
                  →
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800">
                  <TableHead className="text-zinc-400">Score</TableHead>
                  <TableHead className="text-zinc-400">Title</TableHead>
                  <TableHead className="text-zinc-400">Subreddit</TableHead>
                  <TableHead className="text-zinc-400 text-center">Tech</TableHead>
                  <TableHead className="text-zinc-400 text-center">Rev</TableHead>
                  <TableHead className="text-zinc-400 text-center">Novel</TableHead>
                  <TableHead className="text-zinc-400 text-center">Demand</TableHead>
                  <TableHead className="text-zinc-400 text-center">Engagement</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {opportunities.map((opp) => (
                  <>
                    <TableRow
                      key={opp.id}
                      className="border-zinc-800 cursor-pointer hover:bg-zinc-800/50"
                      onClick={() => setExpanded(expanded === opp.id ? null : opp.id)}
                    >
                      <TableCell>
                        <div
                          className={`${getScoreColor(opp.overall_score)} text-white font-bold px-2 py-1 rounded text-center min-w-[50px]`}
                        >
                          {opp.overall_score?.toFixed(1)}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <div className="font-medium truncate">{opp.title}</div>
                        {opp.category && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            {opp.category}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSubreddit(opp.subreddit);
                            setPage(0);
                          }}
                        >
                          {opp.subreddit}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{opp.technical_complexity?.toFixed(1)}</TableCell>
                      <TableCell className="text-center">{opp.revenue_potential?.toFixed(1)}</TableCell>
                      <TableCell className="text-center">{opp.novelty_score?.toFixed(1)}</TableCell>
                      <TableCell className="text-center">{opp.market_demand?.toFixed(1)}</TableCell>
                      <TableCell className="text-center">
                        <span className="text-orange-400">{opp.points}↑</span>
                        {' '}
                        <span className="text-zinc-400">{opp.comments}💬</span>
                      </TableCell>
                    </TableRow>
                    {expanded === opp.id && (
                      <TableRow key={`${opp.id}-expanded`} className="border-zinc-800 bg-zinc-800/30">
                        <TableCell colSpan={8} className="p-4">
                          <div className="space-y-3">
                            {opp.description && (
                              <div>
                                <div className="text-sm font-medium text-zinc-400 mb-1">Description</div>
                                <p className="text-sm">{opp.description}</p>
                              </div>
                            )}
                            {opp.opportunity && (
                              <div>
                                <div className="text-sm font-medium text-zinc-400 mb-1">Opportunity</div>
                                <p className="text-sm">{opp.opportunity}</p>
                              </div>
                            )}
                            {opp.ai_analysis && (
                              <div>
                                <div className="text-sm font-medium text-zinc-400 mb-1">AI Analysis</div>
                                <p className="text-sm text-green-300">{opp.ai_analysis}</p>
                              </div>
                            )}
                            {opp.source_url && (
                              <a
                                href={opp.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:underline text-sm inline-block"
                                onClick={(e) => e.stopPropagation()}
                              >
                                View Original →
                              </a>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>

            {opportunities.length === 0 && !loading && (
              <div className="text-center py-8 text-zinc-400">
                No opportunities found matching your criteria
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

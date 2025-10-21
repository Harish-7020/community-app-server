'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search as SearchIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSearch } from '@/hooks/useSearch';
import { SearchType } from '@/types';
import Link from 'next/link';
import { formatRelativeTime } from '@/utils/date';

const searchTypes = [
  { label: 'All', value: SearchType.ALL },
  { label: 'Users', value: SearchType.USER },
  { label: 'Communities', value: SearchType.COMMUNITY },
  { label: 'Posts', value: SearchType.POST },
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [searchType, setSearchType] = useState<SearchType>(SearchType.ALL);
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useSearch(query, searchType, page);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  return (
    <div className="space-y-8 animate-fade-in">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold">Search</h1>
        <p className="text-muted-foreground">
          Find users, communities, and posts
        </p>
      </motion.div>

      {/* Search Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-12 rounded-2xl"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {searchTypes.map((type) => (
          <Button
            key={type.value}
            variant={searchType === type.value ? 'default' : 'outline'}
            onClick={() => setSearchType(type.value)}
            className="rounded-2xl"
          >
            {type.label}
          </Button>
        ))}
      </div>

      {/* Results */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : data && data.data.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground">
              Found {data.totalCount} results
            </p>
            {data.data.map((result) => (
              <Card key={`${result.type}-${result.id}`} className="hover:shadow-md transition-all rounded-3xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>
                        <Link
                          href={
                            result.type === 'user'
                              ? `/profile/${result.id}`
                              : result.type === 'community'
                              ? `/community/${result.id}`
                              : `/post/${result.id}`
                          }
                          className="hover:underline"
                        >
                          {result.name || result.title}
                        </Link>
                      </CardTitle>
                      {result.content && (
                        <CardDescription className="mt-1">
                          {result.content}
                        </CardDescription>
                      )}
                    </div>
                    <Badge className="rounded-2xl capitalize">{result.type}</Badge>
                  </div>
                </CardHeader>
                {result.createdAt && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {formatRelativeTime(result.createdAt)}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4">
                  Page {page} of {data.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  disabled={page === data.totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : query ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No results found for &quot;{query}&quot;
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Enter a search query to get started
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


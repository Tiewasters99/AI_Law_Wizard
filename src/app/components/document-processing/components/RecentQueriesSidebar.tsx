import { motion } from 'framer-motion'
import { Clock, TrendingUp, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
import { Badge } from '../../ui/badge'
import type { DocumentQuery } from '../../../stores/queryHistoryStore'

interface RecentQueriesSidebarProps {
  queries: DocumentQuery[]
  statistics: {
    total: number
    successful: number
    today: number
  } | null
  onQuerySelect?: (query: DocumentQuery) => void
}

export const RecentQueriesSidebar = ({
  queries,
  statistics,
  onQuerySelect
}: RecentQueriesSidebarProps) => {
  if (!queries.length) return null

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {/* Statistics Card */}
      {statistics && (
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Queries</span>
              <Badge variant="secondary">{statistics.total}</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Successful</span>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                {statistics.successful}
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Today</span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {statistics.today}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Queries Card */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            Recent Queries
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {queries.slice(0, 5).map((query) => (
            <motion.button
              key={query.id}
              onClick={() => onQuerySelect?.(query)}
              className="w-full text-left p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-lg transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-gray-700 line-clamp-2 flex-1">
                  {query.userQuery}
                </p>
                {query.success && (
                  <Zap className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(query.createdAt).toLocaleDateString()}
              </p>
            </motion.button>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  )
}


'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { theme } from '@/lib/theme'
import type { PlayerState } from '@/hooks/useCompetition'

type SortKey = 'progress' | 'name' | 'wpm' | 'accuracy'
type SortDir = 'asc' | 'desc'

const ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50] as const

type Props = {
  players: PlayerState[]
}

function getProgressDisplay(typedText: string): string {
  if (!typedText) return '—'
  return `${typedText}|`
}

export function PlayersTable({ players }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sortFromUrl = (searchParams.get('sort') as SortKey) || 'wpm'
  const dirFromUrl = (searchParams.get('dir') as SortDir) || 'desc'
  const pageFromUrl = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const rowsFromUrl = Math.max(
    ROWS_PER_PAGE_OPTIONS[0],
    Math.min(
      ROWS_PER_PAGE_OPTIONS[ROWS_PER_PAGE_OPTIONS.length - 1],
      parseInt(searchParams.get('rows') || '10', 10)
    )
  )

  const [sort, setSort] = useState<SortKey>(sortFromUrl)
  const [dir, setDir] = useState<SortDir>(dirFromUrl)
  const [page, setPage] = useState(pageFromUrl)
  const [rowsPerPage, setRowsPerPage] = useState(rowsFromUrl)

  useEffect(() => {
    setSort(sortFromUrl)
    setDir(dirFromUrl)
    setPage(pageFromUrl)
    setRowsPerPage(rowsFromUrl)
  }, [sortFromUrl, dirFromUrl, pageFromUrl, rowsFromUrl])

  const updateUrl = useCallback(
    (updates: { sort?: SortKey; dir?: SortDir; page?: number; rows?: number }) => {
      const params = new URLSearchParams(searchParams.toString())
      if (updates.sort !== undefined) params.set('sort', updates.sort)
      if (updates.dir !== undefined) params.set('dir', updates.dir)
      if (updates.page !== undefined) params.set('page', String(updates.page))
      if (updates.rows !== undefined) params.set('rows', String(updates.rows))
      router.replace(`?${params.toString()}`, { scroll: false })
    },
    [searchParams, router]
  )

  const handleSort = useCallback(
    (key: SortKey) => {
      const newDir = sort === key && dir === 'desc' ? 'asc' : 'desc'
      setSort(key)
      setDir(newDir)
      setPage(1)
      updateUrl({ sort: key, dir: newDir, page: 1 })
    },
    [sort, dir, updateUrl]
  )

  const sortedPlayers = useMemo(() => {
    const arr = [...players]
    arr.sort((a, b) => {
      let cmp = 0
      switch (sort) {
        case 'progress':
          cmp = (a.typedText?.length ?? 0) - (b.typedText?.length ?? 0)
          break
        case 'name':
          cmp = a.name.localeCompare(b.name)
          break
        case 'wpm':
          cmp = a.wpm - b.wpm
          break
        case 'accuracy':
          cmp = a.accuracy - b.accuracy
          break
        default:
          cmp = 0
      }
      return dir === 'asc' ? cmp : -cmp
    })
    return arr
  }, [players, sort, dir])

  const totalPages = Math.max(1, Math.ceil(sortedPlayers.length / rowsPerPage))
  const paginatedPlayers = useMemo(() => {
    const start = (page - 1) * rowsPerPage
    return sortedPlayers.slice(start, start + rowsPerPage)
  }, [sortedPlayers, page, rowsPerPage])

  const handleRowsChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = parseInt(e.target.value, 10)
      setRowsPerPage(val)
      setPage(1)
      updateUrl({ rows: val, page: 1 })
    },
    [updateUrl]
  )

  const goToPage = useCallback(
    (p: number) => {
      const clamped = Math.max(1, Math.min(p, totalPages))
      setPage(clamped)
      updateUrl({ page: clamped })
    },
    [totalPages, updateUrl]
  )

  const SortHeader = ({ label, sortKey }: { label: string; sortKey: SortKey }) => (
    <button
      type="button"
      onClick={() => handleSort(sortKey)}
      className="text-left font-medium hover:opacity-80 transition-opacity"
      style={{ color: theme.text.correct }}
    >
      {label}
      {sort === sortKey && (
        <span className="ml-1" aria-hidden>
          {dir === 'asc' ? '↑' : '↓'}
        </span>
      )}
    </button>
  )

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse font-mono text-sm">
        <thead>
          <tr style={{ borderBottom: `1px solid ${theme.border.default}` }}>
            <th className="py-2 px-3 text-left">
              <SortHeader label="Live progress" sortKey="progress" />
            </th>
            <th className="py-2 px-3 text-left">
              <SortHeader label="Player name" sortKey="name" />
            </th>
            <th className="py-2 px-3 text-right">
              <SortHeader label="WPM" sortKey="wpm" />
            </th>
            <th className="py-2 px-3 text-right">
              <SortHeader label="Accuracy" sortKey="accuracy" />
            </th>
          </tr>
        </thead>
        <tbody>
          {paginatedPlayers.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                className="py-6 text-center"
                style={{ color: theme.text.muted }}
              >
                No players yet. Join the competition!
              </td>
            </tr>
          ) : (
            paginatedPlayers.map((p) => (
              <tr
                key={p.id}
                style={{ borderBottom: `1px solid ${theme.border.default}` }}
              >
                <td className="py-2 px-3 max-w-[280px]" style={{ color: theme.text.correct }}>
                  <span
                    className="block truncate font-mono"
                    style={{ fontVariantNumeric: 'normal' }}
                    title={p.typedText || undefined}
                  >
                    {getProgressDisplay(p.typedText ?? '')}
                  </span>
                </td>
                <td className="py-2 px-3" style={{ color: theme.text.correct }}>
                  {p.name}
                </td>
                <td className="py-2 px-3 text-right" style={{ color: theme.text.muted }}>
                  {p.wpm}
                </td>
                <td className="py-2 px-3 text-right" style={{ color: theme.text.muted }}>
                  {p.accuracy.toFixed(1)}%
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {sortedPlayers.length > 0 && (
        <div
          className="flex flex-wrap items-center gap-4 py-3 px-3 mt-0"
          style={{
            borderTop: `1px solid ${theme.border.default}`,
            color: theme.text.muted,
            backgroundColor: theme.bg.main,
          }}
        >
          <div className="flex items-center gap-2">
            <label htmlFor="rows-per-page" className="text-xs">
              Rows per page:
            </label>
            <select
              id="rows-per-page"
              value={rowsPerPage}
              onChange={handleRowsChange}
              className="rounded px-2 py-1 text-sm border outline-none focus:ring-1"
              style={{
                borderColor: theme.border.default,
                color: theme.text.correct,
                backgroundColor: theme.bg.muted,
              }}
            >
              {ROWS_PER_PAGE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
              className="px-2 py-1 rounded disabled:opacity-40 hover:opacity-80"
            >
              Prev
            </button>
            <span className="text-xs">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
              className="px-2 py-1 rounded disabled:opacity-40 hover:opacity-80"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

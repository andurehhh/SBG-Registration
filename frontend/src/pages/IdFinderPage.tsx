// frontend/src/pages/IdFinderPage.tsx
import { useState, type FormEvent } from 'react'
import { Search, AlertCircle, Clock, UserX } from 'lucide-react'
import { IdCard } from '../components/id-card/IdCard'
import { BackButton } from '../components/ui/BackButton'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { supabase } from '../lib/api'
import { assignSticker } from '../lib/utils'
import type { PublicMember } from '../types'

type SearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'found'; member: PublicMember; stickerId: string }
  | { status: 'not_found' }
  | { status: 'not_approved'; memberStatus: string }
  | { status: 'rate_limited' }
  | { status: 'error'; message: string }

export default function IdFinderPage() {
  const [studentNumber, setStudentNumber] = useState('')
  const [searchState, setSearchState] = useState<SearchState>({ status: 'idle' })

  async function handleSearch(e: FormEvent) {
    e.preventDefault()
    if (!studentNumber.trim()) return

    setSearchState({ status: 'loading' })

    try {
      const { data: member, error } = await supabase
        .from('member_public_view')
        .select('id, student_number, full_name, sbg_id, course, year_level, section, school_year, skills, sticker_id, status, created_at')
        .eq('student_number', studentNumber.trim())
        .single()

      if (error || !member) {
        setSearchState({ status: 'not_found' })
        return
      }

      if (member.status !== 'approved' && member.status !== 'inactive') {
        setSearchState({ status: 'not_approved', memberStatus: member.status })
        return
      }

      const stickerId = member.sticker_id ?? assignSticker(member.id)
      setSearchState({ status: 'found', member, stickerId })
    } catch (err) {
      setSearchState({
        status: 'error',
        message: err instanceof Error ? err.message : 'An unexpected error occurred',
      })
    }
  }

  return (
    <div className="min-h-screen bg-sbg-black">
      <div className="relative z-10 px-6 py-4">
        <BackButton to="/" label="Back to Home" />
      </div>

      <div className="relative px-4 pb-12">
        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <img src="/sbg-logo-white.svg" alt="SBG Logo" className="h-10 w-10" />
            <div className="text-left">
              <h1 className="font-bold text-sbg-text text-lg leading-tight">
                Student Builder Group
              </h1>
              <p className="text-sbg-text-muted text-xs">PUP Biñan Campus</p>
            </div>
          </div>

          <h2 className="font-bold text-sbg-text text-3xl mb-3">ID Finder</h2>
          <p className="text-sbg-text-muted text-sm mb-8">
            Enter your student number to view your official AWS digital membership ID card.
          </p>

          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="2026-12345-BN-0"
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value)}
                aria-label="Student number"
              />
            </div>
            <Button
              type="submit"
              loading={searchState.status === 'loading'}
              icon={<Search className="w-4 h-4" />}
            >
              Search
            </Button>
          </form>
        </div>
      </div>

      <div className="px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {searchState.status === 'found' && (
            <div className="flex flex-col items-center gap-6">
              <div className="text-center">
                <p className="text-sbg-text-muted text-sm font-mono">
                  Membership ID for{' '}
                  <span className="text-sbg-text">{searchState.member.full_name}</span>
                </p>
              </div>
              <IdCard member={searchState.member} stickerId={searchState.stickerId} />
            </div>
          )}

          {searchState.status === 'not_found' && (
            <div className="flex flex-col items-center gap-3 text-center py-8">
              <UserX className="w-12 h-12 text-sbg-text-muted" />
              <h3 className="font-sans text-sbg-text text-lg font-bold">Not Found</h3>
              <p className="text-sbg-text-muted text-sm">
                No membership record found for student number{' '}
                <span className="text-sbg-text font-mono">{studentNumber}</span>.
              </p>
            </div>
          )}

          {searchState.status === 'not_approved' && (
            <div className="flex flex-col items-center gap-3 text-center py-8">
              <AlertCircle className="w-12 h-12 text-sbg-accent" />
              <h3 className="font-sans text-sbg-text text-lg font-bold">Application Pending</h3>
              <p className="text-sbg-text-muted text-sm">
                {searchState.memberStatus === 'pending' &&
                  'Your application is currently under review. You will be notified once it is processed.'}
                {searchState.memberStatus === 'rejected' &&
                  'Your application was not approved. Please contact the SBG team for more information.'}
                {searchState.memberStatus === 'inactive' &&
                  'Your membership is currently inactive. Please contact the SBG team.'}
                {searchState.memberStatus === 'removed' &&
                  'This membership record has been removed.'}
                {!['pending', 'rejected', 'inactive', 'removed'].includes(searchState.memberStatus) &&
                  'Your membership is not currently active.'}
              </p>
            </div>
          )}

          {searchState.status === 'rate_limited' && (
            <div className="flex flex-col items-center gap-3 text-center py-8">
              <Clock className="w-12 h-12 text-sbg-text-muted" />
              <h3 className="font-sans text-sbg-text text-lg font-bold">Too Many Requests</h3>
              <p className="text-sbg-text-muted text-sm">
                You have made too many search requests. Please wait a minute and try again.
              </p>
            </div>
          )}

          {searchState.status === 'error' && (
            <div className="flex flex-col items-center gap-3 text-center py-8">
              <AlertCircle className="w-12 h-12 text-red-400" />
              <h3 className="font-sans text-sbg-text text-lg font-bold">Error</h3>
              <p className="text-sbg-text-muted text-sm">{searchState.message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MoreHorizontal, Pencil, Plus, Trash2, Users } from 'lucide-react'

import { ApiError, type ListParams } from '../../api'
import { Avatar } from '../../components/common/Avatar'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { DropdownItem, DropdownMenu } from '../../components/common/DropdownMenu'
import { DataTable, type Column } from '../../components/data/DataTable'
import { PageHeader } from '../../components/layout/PageHeader'
import { useAuth } from '../../hooks/useAuth'
import { useConfirm } from '../../hooks/useConfirm'
import { useToast } from '../../hooks/useToast'
import type { User } from '../../types'
import { teamHooks } from './useTeam'

/**
 * Everyone with an account, on one page.
 *
 * An institute has a handful of staff, not a directory, so this does not
 * paginate — a page control over six rows is furniture that gets in the way.
 */
const ALL: ListParams = { page: 1, pageSize: 200, sort: { field: 'name', dir: 'asc' } }

export default function TeamListPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const confirm = useConfirm()
  const { session } = useAuth()

  const query = teamHooks.useList(ALL)
  const remove = teamHooks.useRemove()
  const [busyId, setBusyId] = useState<string | undefined>()

  const members = query.data?.items ?? []

  async function deleteMember(member: User) {
    const confirmed = await confirm({
      title: `Remove ${member.name}?`,
      description:
        'They lose access to the CMS immediately. Content they published stays where it is.',
      confirmLabel: 'Remove',
    })
    if (!confirmed) return

    setBusyId(member.id)
    try {
      await remove.mutateAsync([member.id])
      toast.success(`${member.name} removed.`)
    } catch (error) {
      toast.error('Could not remove', {
        description: error instanceof ApiError ? error.message : undefined,
      })
    } finally {
      setBusyId(undefined)
    }
  }

  const columns: Column<User>[] = [
    {
      id: 'name',
      header: 'Name',
      sortable: true,
      cell: (member) => (
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={member.name} src={member.avatar?.url} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-900">
              {member.name}
              {/* Marked, because removing or demoting yourself is the one
                  mistake on this page you cannot undo from this page. */}
              {member.id === session?.userId && (
                <span className="ml-2 text-xs font-normal text-slate-400">you</span>
              )}
            </p>
            <p className="truncate text-xs text-slate-500">{member.email}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'role',
      header: 'Role',
      sortable: true,
      cell: (member) => (
        <Badge tone={member.role === 'admin' ? 'primary' : 'neutral'}>
          {member.role === 'admin' ? 'Admin' : 'Editor'}
        </Badge>
      ),
    },
    {
      id: 'active',
      header: 'Access',
      cell: (member) =>
        member.active ? (
          <Badge tone="success">Active</Badge>
        ) : (
          <Badge tone="neutral">Suspended</Badge>
        ),
    },
    {
      id: 'actions',
      header: '',
      align: 'right',
      cell: (member) => (
        <DropdownMenu
          trigger={
            <Button variant="ghost" size="sm" aria-label={`Actions for ${member.name}`}>
              <MoreHorizontal className="size-4" />
            </Button>
          }
        >
          <DropdownItem icon={Pencil} onSelect={() => navigate(`/team/${member.id}/edit`)}>
            Edit
          </DropdownItem>
          <DropdownItem
            icon={Trash2}
            tone="danger"
            disabled={member.id === session?.userId || busyId === member.id}
            onSelect={() => void deleteMember(member)}
          >
            Remove
          </DropdownItem>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team"
        description="Who can sign in to this CMS, and what they are allowed to change."
        actions={
          <Link to="/team/new">
            <Button icon={Plus}>Add member</Button>
          </Link>
        }
      />

      <Card flush>
        <DataTable
          rows={members}
          columns={columns}
          getRowId={(member) => member.id}
          loading={query.isLoading}
          caption="CMS accounts with their role and access"
          emptyIcon={Users}
          emptyTitle="No one else has an account"
          emptyDescription="Add the people who will be uploading content. An editor can publish; an admin can also change settings and manage accounts."
        />
      </Card>
    </div>
  )
}

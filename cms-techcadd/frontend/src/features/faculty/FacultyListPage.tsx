import { Link, useNavigate } from 'react-router-dom'
import { Mail, MoreHorizontal, Pencil, Plus, Trash2, Users } from 'lucide-react'

import { ApiError } from '../../api'
import { Avatar } from '../../components/common/Avatar'
import { Badge, ContentStatusBadge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { Card, CardBody, CardHeader } from '../../components/common/Card'
import { DropdownItem, DropdownMenu, DropdownSeparator } from '../../components/common/DropdownMenu'
import { EmptyState } from '../../components/common/EmptyState'
import { FilterBar } from '../../components/data/FilterBar'
import { SortableList } from '../../components/data/SortableList'
import { Alert } from '../../components/feedback/Alert'
import { SkeletonCards } from '../../components/feedback/Skeleton'
import { PageHeader } from '../../components/layout/PageHeader'
import { useConfirm } from '../../hooks/useConfirm'
import { useListParams } from '../../hooks/useListParams'
import { useToast } from '../../hooks/useToast'
import type { Faculty } from '../../types'
import { facultyHooks } from './useFaculty'

export default function FacultyListPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const confirm = useConfirm()

  // Faculty are hand-ordered, so the whole set loads at once.
  const list = useListParams({ defaultSort: { field: 'order', dir: 'asc' }, defaultPageSize: 200 })
  const query = facultyHooks.useList({ ...list.params, pageSize: 200 })
  const update = facultyHooks.useUpdate()
  const remove = facultyHooks.useRemove()

  const members = query.data?.items ?? []
  // Reordering a filtered subset would write misleading positions.
  const canReorder = !list.params.search

  async function persistOrder(ordered: Faculty[]) {
    try {
      await Promise.all(
        ordered.map((member, index) =>
          member.order === index
            ? Promise.resolve(member)
            : update.mutateAsync({ id: member.id, input: { order: index } }),
        ),
      )
    } catch {
      toast.error('Could not save the new order')
    }
  }

  async function deleteMember(member: Faculty) {
    const confirmed = await confirm({
      title: `Remove ${member.name}?`,
      description: 'Their profile is removed from the website immediately.',
      confirmLabel: 'Remove',
    })
    if (!confirmed) return

    try {
      await remove.mutateAsync([member.id])
      toast.success('Faculty member removed.')
    } catch (error) {
      toast.error('Could not remove', {
        description: error instanceof ApiError ? error.message : 'Please try again.',
      })
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty"
        description={
          query.isLoading
            ? 'Loading…'
            : `${members.length} ${members.length === 1 ? 'trainer' : 'trainers'}`
        }
        actions={
          <Link to="/faculty/new">
            <Button icon={Plus}>Add Faculty</Button>
          </Link>
        }
      />

      <Card flush>
        <CardHeader
          title="Trainers"
          subtitle={
            canReorder
              ? 'Order controls how trainers appear on the website'
              : 'Clear the search to reorder trainers'
          }
        />

        <FilterBar
          search={list.search}
          onSearchChange={list.setSearch}
          searchPlaceholder="Search by name, designation or expertise"
        />

        {query.isLoading ? (
          <SkeletonCards count={3} />
        ) : query.error ? (
          <div className="p-5">
            <Alert tone="error" title="Could not load faculty">
              {(query.error as Error).message}
            </Alert>
          </div>
        ) : members.length === 0 ? (
          <EmptyState
            icon={Users}
            title={list.params.search ? 'No matching trainers' : 'No faculty yet'}
            description={
              list.params.search
                ? 'Try a different search term.'
                : 'Add your trainers so they appear on the institute website.'
            }
          />
        ) : (
          <CardBody>
            {canReorder ? (
              <SortableList
                items={members}
                getId={(member) => member.id}
                onReorder={persistOrder}
                renderItem={(member) => (
                  <FacultyRow
                    member={member}
                    onEdit={() => navigate(`/faculty/${member.id}/edit`)}
                    onDelete={() => deleteMember(member)}
                  />
                )}
              />
            ) : (
              <ul className="space-y-2">
                {members.map((member) => (
                  <li
                    key={member.id}
                    className="rounded-lg border border-slate-200 bg-white p-3 pl-9"
                  >
                    <FacultyRow
                      member={member}
                      onEdit={() => navigate(`/faculty/${member.id}/edit`)}
                      onDelete={() => deleteMember(member)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        )}
      </Card>
    </div>
  )
}

function FacultyRow({
  member,
  onEdit,
  onDelete,
}: {
  member: Faculty
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex items-center gap-3">
      <Avatar name={member.name} src={member.photo?.url} />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900">{member.name}</p>
        <p className="truncate text-xs text-slate-500">
          {member.designation}
          {member.experienceYears > 0 && ` · ${member.experienceYears} yrs`}
        </p>
      </div>

      <div className="hidden shrink-0 flex-wrap gap-1 lg:flex">
        {member.expertise.slice(0, 2).map((skill) => (
          <Badge key={skill} tone="neutral">
            {skill}
          </Badge>
        ))}
        {member.expertise.length > 2 && (
          <span className="self-center text-xs text-slate-400">
            +{member.expertise.length - 2}
          </span>
        )}
      </div>

      {member.email && (
        <a
          href={`mailto:${member.email}`}
          aria-label={`Email ${member.name}`}
          className="hidden shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-primary-600 sm:block"
        >
          <Mail size={16} aria-hidden="true" />
        </a>
      )}

      <ContentStatusBadge status={member.status} />

      <DropdownMenu
        trigger={
          <Button variant="ghost" size="sm" aria-label={`Actions for ${member.name}`}>
            <MoreHorizontal size={16} aria-hidden="true" />
          </Button>
        }
      >
        <DropdownItem icon={Pencil} onSelect={onEdit}>
          Edit
        </DropdownItem>
        <DropdownSeparator />
        <DropdownItem icon={Trash2} tone="danger" onSelect={onDelete}>
          Remove
        </DropdownItem>
      </DropdownMenu>
    </div>
  )
}

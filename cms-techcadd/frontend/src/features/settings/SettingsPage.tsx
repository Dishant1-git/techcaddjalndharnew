import { useState } from 'react'
import { Eye, EyeOff, MoreHorizontal, Pencil, Plus, Trash2, UserCog } from 'lucide-react'

import { ApiError } from '../../api'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { Card, CardBody } from '../../components/common/Card'
import { DropdownItem, DropdownMenu, DropdownSeparator } from '../../components/common/DropdownMenu'
import { Modal } from '../../components/common/Modal'
import { DataTable, type Column } from '../../components/data/DataTable'
import { TabPanel, Tabs } from '../../components/data/Tabs'
import { Alert } from '../../components/feedback/Alert'
import { SkeletonTable } from '../../components/feedback/Skeleton'
import { Spinner } from '../../components/feedback/Spinner'
import { FormField } from '../../components/form/FormField'
import { ImageField } from '../../components/form/ImageField'
import { Input } from '../../components/form/Input'
import { Switch } from '../../components/form/Switch'
import { Textarea } from '../../components/form/Textarea'
import { PageHeader } from '../../components/layout/PageHeader'
import { useConfirm } from '../../hooks/useConfirm'
import { useToast } from '../../hooks/useToast'
import type { SiteSettings, SiteStat, User } from '../../types'
import { useSettings, useUpdateSettings } from '../seo/useSeo'
import { createResourceHooks } from '../shared/createResourceHooks'
import { SecurityTab } from './SecurityTab'
import { usersApi } from '../../api'
import type { UserWithTemporaryPassword } from '../../api/resources/users'

const userHooks = createResourceHooks('users', usersApi)

const TABS = [
  { value: 'general', label: 'General' },
  { value: 'profile', label: 'Profile' },
  { value: 'security', label: 'Security' },
  { value: 'users', label: 'Users & Roles' },
  { value: 'notifications', label: 'Notifications' },
  { value: 'integrations', label: 'Integrations' },
]

export default function SettingsPage() {
  const [tab, setTab] = useState('general')
  const settings = useSettings()

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Site configuration, users and integrations" />

      <Card flush>
        <Tabs value={tab} onValueChange={setTab} items={TABS}>
          {settings.isLoading ? (
            <SkeletonTable rows={5} columns={2} />
          ) : settings.error ? (
            <div className="p-5">
              <Alert tone="error" title="Could not load settings">
                {(settings.error as Error).message}
              </Alert>
            </div>
          ) : (
            settings.data && (
              <>
                <TabPanel value="general">
                  <GeneralTab settings={settings.data} />
                </TabPanel>
                <TabPanel value="profile">
                  <ProfileTab settings={settings.data} />
                </TabPanel>
                <TabPanel value="security">
                  <SecurityTab />
                </TabPanel>
                <TabPanel value="users">
                  <UsersTab />
                </TabPanel>
                <TabPanel value="notifications">
                  <NotificationsTab settings={settings.data} />
                </TabPanel>
                <TabPanel value="integrations">
                  <IntegrationsTab settings={settings.data} />
                </TabPanel>
              </>
            )
          )}
        </Tabs>
      </Card>
    </div>
  )
}

/** Shared save bar so each tab behaves identically. */
function SaveBar({
  dirty,
  saving,
  onSave,
  onRevert,
}: {
  dirty: boolean
  saving: boolean
  onSave: () => void
  onRevert: () => void
}) {
  return (
    <div className="flex items-center gap-2 border-t border-slate-100 px-5 py-3">
      <Button disabled={!dirty || saving} onClick={onSave}>
        {saving && <Spinner />}
        Save changes
      </Button>
      {dirty && (
        <Button variant="secondary" onClick={onRevert}>
          Revert
        </Button>
      )}
      {dirty && <p className="ml-auto text-xs text-slate-500">Unsaved changes</p>}
    </div>
  )
}

/**
 * The four figures the homepage and about page print.
 *
 * A plain list rather than four fixed slots: the count is editorial, and the
 * site cycles its ring animation by position, so adding a fifth figure is an
 * editor's decision and needs no code. Rows are edited by index because a stat
 * has no id — it is two strings on the settings row, not a record.
 */
function StatsEditor({
  stats,
  onChange,
}: {
  stats: SiteStat[]
  onChange: (stats: SiteStat[]) => void
}) {
  const set = (index: number, patch: Partial<SiteStat>) =>
    onChange(stats.map((stat, i) => (i === index ? { ...stat, ...patch } : stat)))

  return (
    <div className="rounded-lg border border-slate-200">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-slate-900">Headline figures</p>
          <p className="text-xs text-slate-500">
            Shown on the homepage and the about page. Keep the figure short — it renders large.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => onChange([...stats, { value: '', label: '' }])}
          disabled={stats.length >= 8}
        >
          <Plus className="size-4" />
          Add figure
        </Button>
      </div>

      {stats.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-slate-500">
          No figures yet — the site is showing its built-in ones.
        </p>
      ) : (
        <div className="divide-y divide-slate-100">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-end gap-3 px-4 py-3">
              <FormField label="Figure" className="w-32 shrink-0">
                <Input
                  value={stat.value}
                  onChange={(event) => set(index, { value: event.target.value })}
                  placeholder="15k+"
                />
              </FormField>
              <FormField label="Label" className="flex-1">
                <Input
                  value={stat.label}
                  onChange={(event) => set(index, { label: event.target.value })}
                  placeholder="Students Trained"
                />
              </FormField>
              <Button
                variant="ghost"
                aria-label={`Remove ${stat.label || 'figure'}`}
                onClick={() => onChange(stats.filter((_, i) => i !== index))}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/** Local draft synced from the server copy, with dirty tracking. */
function useDraft<T extends object>(source: T) {
  const [draft, setDraft] = useState<T>(source)
  const [baseline, setBaseline] = useState<T>(source)

  // Re-sync during render rather than in an effect. Query's structural sharing
  // keeps the reference stable unless the data actually changed, so an in-flight
  // edit is only discarded when the server copy genuinely moved on.
  if (baseline !== source) {
    setBaseline(source)
    setDraft(source)
  }

  const dirty = JSON.stringify(draft) !== JSON.stringify(baseline)
  return { draft, setDraft, dirty, revert: () => setDraft(baseline) }
}

/**
 * The social links, in the order they sit in the footer.
 *
 * `website` is last and is the odd one out: it is not a network and the footer
 * does not render an icon for it, but it belongs with the others as a
 * site-wide address.
 */
const SOCIAL_FIELDS = [
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/…' },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/company/…' },
  { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/…' },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@…' },
  { key: 'x', label: 'X', placeholder: 'https://x.com/…' },
  { key: 'website', label: 'Website', placeholder: 'https://techcadd.com' },
] as const

function GeneralTab({ settings }: { settings: SiteSettings }) {
  const update = useUpdateSettings()
  const toast = useToast()
  const { draft, setDraft, dirty, revert } = useDraft(settings)

  return (
    <div>
      <CardBody className="grid gap-5 lg:grid-cols-2">
        <FormField label="Site name" required>
          <Input
            value={draft.siteName}
            onChange={(event) => setDraft({ ...draft, siteName: event.target.value })}
          />
        </FormField>

        <FormField label="Tagline">
          <Input
            value={draft.tagline ?? ''}
            onChange={(event) => setDraft({ ...draft, tagline: event.target.value })}
            placeholder="e.g. Punjab's leading IT training institute"
          />
        </FormField>

        <FormField label="Contact email">
          <Input
            type="email"
            value={draft.contactEmail ?? ''}
            onChange={(event) => setDraft({ ...draft, contactEmail: event.target.value })}
          />
        </FormField>

        <FormField label="Contact phone">
          <Input
            value={draft.contactPhone ?? ''}
            onChange={(event) => setDraft({ ...draft, contactPhone: event.target.value })}
          />
        </FormField>

        <FormField label="Address" className="lg:col-span-2">
          <Textarea
            rows={2}
            value={draft.address ?? ''}
            onChange={(event) => setDraft({ ...draft, address: event.target.value })}
          />
        </FormField>

        <FormField label="Logo">
          <ImageField
            value={draft.logo}
            onChange={(logo) => setDraft({ ...draft, logo })}
            aspect="wide"
          />
        </FormField>

        <FormField label="Favicon">
          <ImageField
            value={draft.favicon}
            onChange={(favicon) => setDraft({ ...draft, favicon })}
            aspect="square"
          />
        </FormField>

        {/*
          Every network the footer can show.

          Only two of these were on this page before, while the row stored six
          and the footer ignored all of them — its links were written into the
          component, so correcting a moved profile meant a deploy. An icon
          appears in the footer only when its address is filled in here, so
          clearing one removes it rather than leaving a dead link.
        */}
        {SOCIAL_FIELDS.map((field) => (
          <FormField key={field.key} label={field.label}>
            <Input
              value={draft.social[field.key] ?? ''}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  social: { ...draft.social, [field.key]: event.target.value },
                })
              }
              placeholder={field.placeholder}
            />
          </FormField>
        ))}

        <div className="lg:col-span-2">
          <StatsEditor
            stats={draft.stats}
            onChange={(stats) => setDraft({ ...draft, stats })}
          />
        </div>
      </CardBody>

      <SaveBar
        dirty={dirty}
        saving={update.isPending}
        onRevert={revert}
        onSave={() =>
          update
            .mutateAsync(draft)
            .then(() => toast.success('Settings saved.'))
            .catch(() => toast.error('Could not save settings'))
        }
      />
    </div>
  )
}

function ProfileTab({ settings }: { settings: SiteSettings }) {
  const update = useUpdateSettings()
  const toast = useToast()
  const { draft, setDraft, dirty, revert } = useDraft(settings.profile)

  return (
    <div>
      <CardBody className="space-y-5">
        <FormField label="Display name" required className="max-w-md">
          <Input
            value={draft.name}
            onChange={(event) => setDraft({ ...draft, name: event.target.value })}
          />
        </FormField>

        <FormField label="Email" className="max-w-md">
          <Input
            type="email"
            value={draft.email}
            onChange={(event) => setDraft({ ...draft, email: event.target.value })}
          />
        </FormField>
      </CardBody>

      <SaveBar
        dirty={dirty}
        saving={update.isPending}
        onRevert={revert}
        onSave={() =>
          update
            .mutateAsync({ profile: draft })
            .then(() => toast.success('Profile saved.'))
            .catch(() => toast.error('Could not save your profile'))
        }
      />
    </div>
  )
}

function NotificationsTab({ settings }: { settings: SiteSettings }) {
  const update = useUpdateSettings()
  const toast = useToast()
  const { draft, setDraft, dirty, revert } = useDraft(settings.notifications)

  const rows = [
    {
      key: 'newEnquiryEmail' as const,
      label: 'New enquiry email',
      description: 'Email the team whenever an enquiry arrives.',
    },
    {
      key: 'dailyEnquiryDigest' as const,
      label: 'Daily enquiry digest',
      description: 'One summary each morning instead of individual emails.',
    },
    {
      key: 'contentPublished' as const,
      label: 'Content published',
      description: 'Notify when a course, page or article goes live.',
    },
  ]

  return (
    <div>
      <CardBody className="max-w-2xl space-y-5">
        {rows.map((row) => (
          <Switch
            key={row.key}
            checked={draft[row.key]}
            onCheckedChange={(checked) => setDraft({ ...draft, [row.key]: checked })}
            label={row.label}
            description={row.description}
          />
        ))}
      </CardBody>

      <SaveBar
        dirty={dirty}
        saving={update.isPending}
        onRevert={revert}
        onSave={() =>
          update
            .mutateAsync({ notifications: draft })
            .then(() => toast.success('Notification preferences saved.'))
            .catch(() => toast.error('Could not save preferences'))
        }
      />
    </div>
  )
}

function IntegrationsTab({ settings }: { settings: SiteSettings }) {
  const update = useUpdateSettings()
  const toast = useToast()
  const { draft, setDraft, dirty, revert } = useDraft(settings.integrations)
  const [revealed, setRevealed] = useState(false)

  return (
    <div>
      <CardBody className="grid max-w-3xl gap-5 sm:grid-cols-2">
        <FormField
          label="WhatsApp number"
          description="Used for the enquiry quick-reply link."
        >
          <Input
            value={draft.whatsappNumber ?? ''}
            onChange={(event) => setDraft({ ...draft, whatsappNumber: event.target.value })}
            placeholder="+91 98765 43210"
          />
        </FormField>

        <FormField label="Analytics ID">
          <Input
            value={draft.analyticsId ?? ''}
            onChange={(event) => setDraft({ ...draft, analyticsId: event.target.value })}
            placeholder="G-XXXXXXXXXX"
          />
        </FormField>

        <FormField
          label="reCAPTCHA secret"
          description="Masked by default so it is not exposed on a shared screen."
          className="sm:col-span-2"
        >
          <Input
            type={revealed ? 'text' : 'password'}
            value={draft.recaptchaSecret ?? ''}
            onChange={(event) => setDraft({ ...draft, recaptchaSecret: event.target.value })}
            suffix={
              <button
                type="button"
                onClick={() => setRevealed((value) => !value)}
                aria-label={revealed ? 'Hide secret' : 'Reveal secret'}
                className="text-slate-400 hover:text-slate-600"
              >
                {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />
        </FormField>
      </CardBody>

      <SaveBar
        dirty={dirty}
        saving={update.isPending}
        onRevert={revert}
        onSave={() =>
          update
            .mutateAsync({ integrations: draft })
            .then(() => toast.success('Integrations saved.'))
            .catch(() => toast.error('Could not save integrations'))
        }
      />
    </div>
  )
}

function UsersTab() {
  const toast = useToast()
  const confirm = useConfirm()

  const query = userHooks.useList({ page: 1, pageSize: 200 })
  const create = userHooks.useCreate()
  const update = userHooks.useUpdate()
  const remove = userHooks.useRemove()

  const [editing, setEditing] = useState<User | 'new' | null>(null)
  const [form, setForm] = useState({ name: '', email: '' })
  const [error, setError] = useState<string | undefined>()

  function openEditor(user: User | 'new') {
    setEditing(user)
    setError(undefined)
    setForm(
      user === 'new'
        ? { name: '', email: '' }
        : { name: user.name, email: user.email },
    )
  }

  async function save() {
    if (!form.name.trim() || !form.email.trim()) {
      setError('Name and email are both required.')
      return
    }

    try {
      if (editing === 'new') {
        const created = (await create.mutateAsync({
          ...form,
          active: true,
        })) as UserWithTemporaryPassword

        // The API generates a password when the form does not collect one, and
        // returns it exactly once. If it scrolled past in a toast that closes
        // itself, the new account would be unreachable — so this one stays up
        // until it is dismissed.
        if (created.temporaryPassword) {
          toast.success('User created.', {
            description: `Temporary password: ${created.temporaryPassword} — copy it now, it cannot be shown again. Ask them to change it after signing in.`,
            duration: null,
          })
          setEditing(null)
          return
        }
      } else if (editing) {
        await update.mutateAsync({ id: editing.id, input: form })
      }

      toast.success('User saved.')
      setEditing(null)
    } catch (caught) {
      if (caught instanceof ApiError && caught.fieldErrors?.email) {
        setError(caught.fieldErrors.email)
        return
      }
      toast.error('Could not save this user')
    }
  }

  const columns: Column<User>[] = [
    {
      id: 'name',
      header: 'User',
      primary: true,
      cell: (user) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-900">{user.name}</p>
          <p className="truncate text-xs text-slate-400">{user.email}</p>
        </div>
      ),
    },
    {
      id: 'active',
      header: 'Status',
      cell: (user) => (
        <Badge tone={user.active ? 'success' : 'neutral'} withDot>
          {user.active ? 'Active' : 'Deactivated'}
        </Badge>
      ),
    },
  ]

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3">
        <p className="text-sm text-slate-500">People who can sign in to this CMS</p>
        <Button size="sm" icon={Plus} onClick={() => openEditor('new')}>
          Invite user
        </Button>
      </div>

      <DataTable
        rows={query.data?.items ?? []}
        columns={columns}
        getRowId={(user) => user.id}
        caption="CMS users and their status"
        loading={query.isLoading}
        error={query.error as Error | null}
        onRetry={() => query.refetch()}
        emptyIcon={UserCog}
        emptyTitle="No users yet"
        emptyDescription="Invite the people who will manage the website."
        rowActions={(user) => (
          <DropdownMenu
            trigger={
              <Button variant="ghost" size="sm" aria-label={`Actions for ${user.name}`}>
                <MoreHorizontal size={16} aria-hidden="true" />
              </Button>
            }
          >
            <DropdownItem icon={Pencil} onSelect={() => openEditor(user)}>
              Edit
            </DropdownItem>
            <DropdownItem
              onSelect={() =>
                update
                  .mutateAsync({ id: user.id, input: { active: !user.active } })
                  .then(() => toast.success(user.active ? 'User deactivated.' : 'User reactivated.'))
                  .catch(() => toast.error('Could not update this user'))
              }
            >
              {user.active ? 'Deactivate' : 'Reactivate'}
            </DropdownItem>
            <DropdownSeparator />
            <DropdownItem
              icon={Trash2}
              tone="danger"
              onSelect={async () => {
                const confirmed = await confirm({
                  title: `Remove ${user.name}?`,
                  description: 'They lose access to the CMS immediately.',
                  confirmLabel: 'Remove',
                })
                if (!confirmed) return
                remove
                  .mutateAsync([user.id])
                  .then(() => toast.success('User removed.'))
                  .catch(() => toast.error('Could not remove this user'))
              }}
            >
              Remove
            </DropdownItem>
          </DropdownMenu>
        )}
      />

      <Modal
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
        title={editing === 'new' ? 'Invite user' : 'Edit user'}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button disabled={create.isPending || update.isPending} onClick={save}>
              {(create.isPending || update.isPending) && <Spinner />}
              Save user
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {error && <Alert tone="error">{error}</Alert>}

          <FormField label="Name" required>
            <Input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
          </FormField>

          <FormField label="Email" required>
            <Input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
          </FormField>

          <p className="text-xs text-slate-500">
            Everyone who signs in to this CMS is an administrator with full access.
          </p>
        </div>
      </Modal>
    </div>
  )
}

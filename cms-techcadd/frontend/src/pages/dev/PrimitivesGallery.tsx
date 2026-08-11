import { useState } from 'react'
import { BookOpen, Download, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'

import { Avatar } from '../../components/common/Avatar'
import { Button } from '../../components/common/Button'
import { Card, CardBody, CardHeader } from '../../components/common/Card'
import { Drawer } from '../../components/common/Drawer'
import { DropdownItem, DropdownMenu, DropdownSeparator } from '../../components/common/DropdownMenu'
import { Modal } from '../../components/common/Modal'
import { Tooltip } from '../../components/common/Tooltip'
import { DataTable, type Column } from '../../components/data/DataTable'
import { FilterBar } from '../../components/data/FilterBar'
import { Pagination } from '../../components/data/Pagination'
import { SortableList } from '../../components/data/SortableList'
import { TabPanel, Tabs } from '../../components/data/Tabs'
import { Alert } from '../../components/feedback/Alert'
import { ProgressBar } from '../../components/feedback/ProgressBar'
import { Skeleton, SkeletonText } from '../../components/feedback/Skeleton'
import { Spinner } from '../../components/feedback/Spinner'
import { Checkbox } from '../../components/form/Checkbox'
import { DatePicker, DateRangePicker } from '../../components/form/DatePicker'
import { FileUpload, type PendingFile } from '../../components/form/FileUpload'
import { FormField } from '../../components/form/FormField'
import { Input } from '../../components/form/Input'
import { MultiSelect } from '../../components/form/MultiSelect'
import { NumberInput } from '../../components/form/NumberInput'
import { RichTextEditor } from '../../components/form/RichTextEditor'
import { Select } from '../../components/form/Select'
import { SlugInput } from '../../components/form/SlugInput'
import { Switch } from '../../components/form/Switch'
import { TagInput } from '../../components/form/TagInput'
import { Textarea } from '../../components/form/Textarea'
import { useConfirm } from '../../hooks/useConfirm'
import { useToast } from '../../hooks/useToast'
import { createId } from '../../lib/id'

interface DemoRow {
  id: string
  name: string
  category: string
  fee: string
}

const demoRows: DemoRow[] = [
  { id: 'a', name: 'Sample row one', category: 'Alpha', fee: '₹1,000' },
  { id: 'b', name: 'Sample row two', category: 'Beta', fee: '₹2,000' },
]

const demoColumns: Column<DemoRow>[] = [
  { id: 'name', header: 'Name', cell: (row) => row.name, sortable: true, primary: true },
  { id: 'category', header: 'Category', cell: (row) => row.category, sortable: true },
  { id: 'fee', header: 'Fee', cell: (row) => row.fee, align: 'right' },
]

const selectOptions = [
  { value: 'web', label: 'Web Development' },
  { value: 'prog', label: 'Programming' },
  { value: 'design', label: 'Design & CAD' },
  { value: 'marketing', label: 'Digital Marketing' },
]

/**
 * Dev-only gallery. Every primitive is mounted here so a runtime bug surfaces
 * before a module depends on it — a component that only compiles is unproven.
 * Not routed in production builds.
 */
export default function PrimitivesGallery() {
  const toast = useToast()
  const confirm = useConfirm()

  const [text, setText] = useState('')
  const [slug, setSlug] = useState('')
  const [tags, setTags] = useState<string[]>(['react'])
  const [multi, setMulti] = useState<string[]>(['web'])
  const [amount, setAmount] = useState<number | ''>(1500)
  const [date, setDate] = useState<string | undefined>()
  const [range, setRange] = useState<{ from?: string; to?: string }>({})
  const [checked, setChecked] = useState(true)
  const [switched, setSwitched] = useState(false)
  const [rich, setRich] = useState('<p>Editable rich text.</p>')
  const [files, setFiles] = useState<PendingFile[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [selected, setSelected] = useState<string[]>([])
  const [items, setItems] = useState([
    { id: '1', label: 'First module' },
    { id: '2', label: 'Second module' },
    { id: '3', label: 'Third module' },
  ])

  return (
    <div className="space-y-6">
      <Alert tone="warning" title="Development gallery">
        Every Phase 0 primitive is mounted here so runtime failures surface early. This route is not
        registered in production builds.
      </Alert>

      <Card flush>
        <CardHeader title="Buttons, avatars, feedback" />
        <CardBody className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button disabled>Disabled</Button>
            <Button size="sm" icon={Download}>
              Small
            </Button>
            <Spinner />
            <Avatar name="techcadd team" />
            <Tooltip content="A hint, never the only source">
              <Button variant="secondary" size="sm">
                Hover me
              </Button>
            </Tooltip>
            <DropdownMenu
              trigger={
                <Button variant="ghost" size="sm" aria-label="Open menu">
                  <MoreHorizontal size={16} />
                </Button>
              }
            >
              <DropdownItem icon={Pencil}>Edit</DropdownItem>
              <DropdownSeparator />
              <DropdownItem icon={Trash2} tone="danger">
                Delete
              </DropdownItem>
            </DropdownMenu>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => toast.success('Saved', { description: 'Auto-dismisses.' })}>
              Success toast
            </Button>
            <Button variant="secondary" onClick={() => toast.error('Failed', { description: 'Persists until dismissed.' })}>
              Error toast
            </Button>
            <Button
              variant="secondary"
              onClick={async () => {
                const ok = await confirm({ title: 'Delete 2 records?', confirmLabel: 'Delete' })
                toast.info(ok ? 'Confirmed' : 'Cancelled')
              }}
            >
              Confirm dialog
            </Button>
            <Button variant="secondary" onClick={() => setModalOpen(true)}>
              Modal
            </Button>
            <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
              Drawer
            </Button>
          </div>

          <ProgressBar value={62} label="Upload progress" showValue />

          <div className="flex items-center gap-4">
            <Skeleton className="size-12 rounded-lg" />
            <SkeletonText className="flex-1" lines={2} />
          </div>
        </CardBody>
      </Card>

      <Card flush>
        <CardHeader title="Form controls" />
        <CardBody className="grid gap-5 md:grid-cols-2">
          <FormField label="Text input" required description="With a leading icon.">
            <Input icon={BookOpen} value={text} onChange={(e) => setText(e.target.value)} placeholder="Course title" />
          </FormField>

          <FormField label="Password">
            <Input type="password" placeholder="••••••••" />
          </FormField>

          <FormField label="Invalid field" error="This slug is already in use.">
            <Input defaultValue="duplicate-value" />
          </FormField>

          <FormField label="Select">
            <Select options={selectOptions} placeholder="All categories" />
          </FormField>

          <FormField label="Multi-select">
            <MultiSelect value={multi} onChange={setMulti} options={selectOptions} maxItems={3} />
          </FormField>

          <FormField label="Tags">
            <TagInput value={tags} onChange={setTags} maxTags={5} />
          </FormField>

          <FormField label="Number">
            <NumberInput value={amount} onChange={setAmount} min={0} prefix="₹" />
          </FormField>

          <FormField label="Slug" description="Tracks the title until edited.">
            <SlugInput value={slug} onChange={setSlug} source={text} baseUrl="techcadd.com/courses/" />
          </FormField>

          <FormField label="Date">
            <DatePicker value={date} onChange={setDate} />
          </FormField>

          <FormField label="Date range">
            <DateRangePicker value={range} onChange={setRange} />
          </FormField>

          <FormField label="Textarea" className="md:col-span-2">
            <Textarea showCount maxLength={160} placeholder="Short description" />
          </FormField>

          <div className="space-y-3 md:col-span-2">
            <Checkbox checked={checked} onCheckedChange={setChecked} label="Featured course" description="Pinned to the homepage." />
            <Switch checked={switched} onCheckedChange={setSwitched} label="Published" description="Visible on the public site." />
          </div>

          <FormField label="Rich text" className="md:col-span-2">
            <RichTextEditor value={rich} onChange={setRich} />
          </FormField>

          <FormField label="File upload" className="md:col-span-2">
            <FileUpload
              files={files}
              onFilesAdded={(added) =>
                setFiles((current) => [
                  ...current,
                  ...added.map((file) => ({ id: createId('file'), file, previewUrl: URL.createObjectURL(file) })),
                ])
              }
              onRemove={(id) => setFiles((current) => current.filter((entry) => entry.id !== id))}
            />
          </FormField>
        </CardBody>
      </Card>

      <Card flush>
        <CardHeader title="Data display" />
        <Tabs
          value={tab}
          onValueChange={setTab}
          items={[
            { value: 'all', label: 'All', badge: demoRows.length },
            { value: 'empty', label: 'Empty state' },
            { value: 'loading', label: 'Loading' },
            { value: 'error', label: 'Error' },
          ]}
        >
          <FilterBar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search rows"
            activeFilters={[{ key: 'status', label: 'Status', value: 'Draft', onRemove: () => undefined }]}
            onClearAll={() => setSearch('')}
          />

          <TabPanel value="all">
            <DataTable
              rows={demoRows}
              columns={demoColumns}
              getRowId={(row) => row.id}
              caption="Two demonstration rows"
              selectedIds={selected}
              onSelectionChange={setSelected}
              sort={{ field: 'name', dir: 'asc' }}
              onSortChange={() => undefined}
              rowActions={() => (
                <DropdownMenu
                  trigger={
                    <Button variant="ghost" size="sm" aria-label="Row actions">
                      <MoreHorizontal size={16} />
                    </Button>
                  }
                >
                  <DropdownItem icon={Pencil}>Edit</DropdownItem>
                  <DropdownItem icon={Trash2} tone="danger">
                    Delete
                  </DropdownItem>
                </DropdownMenu>
              )}
            />
            <Pagination
              page={page}
              pageSize={pageSize}
              total={137}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </TabPanel>

          <TabPanel value="empty">
            <DataTable
              rows={[]}
              columns={demoColumns}
              getRowId={(row) => row.id}
              caption="Empty demonstration table"
              emptyTitle="No records yet"
              emptyDescription="This is the shared empty state."
              emptyIcon={BookOpen}
            />
          </TabPanel>

          <TabPanel value="loading">
            <DataTable rows={[]} columns={demoColumns} getRowId={(row) => row.id} caption="Loading" loading />
          </TabPanel>

          <TabPanel value="error">
            <DataTable
              rows={[]}
              columns={demoColumns}
              getRowId={(row) => row.id}
              caption="Error"
              error={new Error('The request failed. Please try again.')}
              onRetry={() => toast.info('Retry requested')}
            />
          </TabPanel>
        </Tabs>
      </Card>

      <Card flush>
        <CardHeader title="Sortable list" subtitle="Drag the handle, or focus it and use the arrow keys" />
        <CardBody>
          <SortableList
            items={items}
            getId={(item) => item.id}
            onReorder={setItems}
            renderItem={(item) => <span className="text-sm text-slate-700">{item.label}</span>}
          />
        </CardBody>
      </Card>

      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Example modal"
        description="Focus is trapped and restored on close."
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setModalOpen(false)}>Save</Button>
          </>
        }
      >
        <FormField label="A field inside a modal">
          <Input placeholder="Tab order stays inside" />
        </FormField>
      </Modal>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} title="Example drawer" description="Used for enquiry detail.">
        <p className="text-sm text-slate-600">Right-hand panel with the same focus guarantees.</p>
      </Drawer>
    </div>
  )
}

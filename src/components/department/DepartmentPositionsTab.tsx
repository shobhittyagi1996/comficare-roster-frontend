import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { positionsApi, type PositionInput } from '@/api/positions';
import type { Position } from '@/types';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { Field, TextInput } from '@/components/ui/Field';
import SortableHeader, { type SortDir } from '@/components/ui/SortableHeader';

type SortKey = 'name' | 'employees' | 'status';

export default function DepartmentPositionsTab({ departmentId }: { departmentId: string }) {
  const [items, setItems] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Position | null>(null);
  const [form, setForm] = useState<PositionInput>({
    departmentId,
    name: '',
    dateFrom: new Date().toISOString().slice(0, 10),
  });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await positionsApi.list({ departmentId, pageSize: 200 });
      setItems(res.items);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departmentId]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const visible = useMemo(() => {
    const filtered = items.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    const sorted = [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortKey === 'employees') cmp = (a._count?.employees ?? 0) - (b._count?.employees ?? 0);
      else if (sortKey === 'status') cmp = a.status.localeCompare(b.status);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [items, search, sortKey, sortDir]);

  function openCreate() {
    setEditing(null);
    setForm({ departmentId, name: '', dateFrom: new Date().toISOString().slice(0, 10) });
    setModalOpen(true);
  }

  function openEdit(pos: Position) {
    setEditing(pos);
    setForm({ departmentId, name: pos.name, dateFrom: pos.dateFrom.slice(0, 10), status: pos.status });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await positionsApi.update(editing.id, form);
        toast.success('Position updated');
      } else {
        await positionsApi.create(form);
        toast.success('Position created');
      }
      setModalOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(pos: Position) {
    if (!confirm(`Delete area "${pos.name}"?`)) return;
    try {
      await positionsApi.remove(pos.id);
      toast.success('Position deleted');
      load();
    } catch {
      // toast already shown by interceptor
    }
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <TextInput
          placeholder="Search positions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-3.5 w-3.5" /> Add Position
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-surface-offwhite text-xs font-semibold uppercase text-gray-500">
            <tr>
              <th className="px-3 py-2 text-left">
                <SortableHeader label="Name" sortKey="name" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              </th>
              <th className="px-3 py-2 text-left">
                <SortableHeader
                  label="Employees"
                  sortKey="employees"
                  activeKey={sortKey}
                  dir={sortDir}
                  onSort={toggleSort}
                />
              </th>
              <th className="px-3 py-2 text-left">
                <SortableHeader
                  label="Status"
                  sortKey="status"
                  activeKey={sortKey}
                  dir={sortDir}
                  onSort={toggleSort}
                />
              </th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-surface-white">
            {loading && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && visible.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-gray-400">
                  No positions found
                </td>
              </tr>
            )}
            {visible.map((pos) => (
              <tr key={pos.id} className="hover:bg-surface-offwhite">
                <td className="px-3 py-2 font-medium text-gray-800">{pos.name}</td>
                <td className="px-3 py-2 text-gray-500">{pos._count?.employees ?? 0}</td>
                <td className="px-3 py-2">
                  <Badge variant={pos.status === 'ACTIVE' ? 'success' : 'neutral'}>{pos.status}</Badge>
                </td>
                <td className="px-3 py-2 text-right">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(pos)}>
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(pos)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Position' : 'Add Position'} size="sm">
        <form onSubmit={handleSubmit}>
          <Field label="Position Name" required>
            <TextInput required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Effective From" required>
            <TextInput
              type="date"
              required
              value={form.dateFrom}
              onChange={(e) => setForm({ ...form, dateFrom: e.target.value })}
            />
          </Field>
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

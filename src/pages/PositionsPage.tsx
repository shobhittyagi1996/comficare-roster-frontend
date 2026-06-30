import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { positionsApi, type PositionInput } from '@/api/positions';
import { departmentsApi } from '@/api/departments';
import type { Department, Position } from '@/types';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { Field, Select, TextInput } from '@/components/ui/Field';

export default function PositionsPage() {
  const [items, setItems] = useState<Position[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [deptFilter, setDeptFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Position | null>(null);
  const [form, setForm] = useState<PositionInput>({
    departmentId: '',
    name: '',
    dateFrom: new Date().toISOString().slice(0, 10),
  });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [posRes, deptRes] = await Promise.all([
        positionsApi.list({ departmentId: deptFilter || undefined, pageSize: 200 }),
        departmentsApi.list({ pageSize: 100 }),
      ]);
      setItems(posRes.items);
      setDepartments(deptRes.items);
    } finally {
      setLoading(false);
    }
  }, [deptFilter]);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setForm({ departmentId: deptFilter || departments[0]?.id || '', name: '', dateFrom: new Date().toISOString().slice(0, 10) });
    setModalOpen(true);
  }

  function openEdit(pos: Position) {
    setEditing(pos);
    setForm({ departmentId: pos.departmentId, name: pos.name, dateFrom: pos.dateFrom.slice(0, 10) });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await positionsApi.update(editing.id, form);
        toast.success('Area updated');
      } else {
        await positionsApi.create(form);
        toast.success('Area created');
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
      toast.success('Area deleted');
      load();
    } catch {
      // toast already shown
    }
  }

  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-h5 font-bold text-gray-800">Positions</h1>
        <Button onClick={openCreate}>+ Add Position</Button>
      </div>

      <Select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="mb-4 max-w-xs">
        <option value="">All Departments</option>
        {departments.map((d) => (
          <option key={d.id} value={d.id}>
            {d.deptName}
          </option>
        ))}
      </Select>

      <div className="flex-1 overflow-auto rounded-lg border border-gray-200 bg-surface-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-surface-offwhite text-left text-xs font-semibold uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2.5">Position Name</th>
              <th className="px-4 py-2.5">Department</th>
              <th className="px-4 py-2.5">Employees</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  No areas found
                </td>
              </tr>
            )}
            {items.map((pos) => (
              <tr key={pos.id} className="hover:bg-surface-offwhite">
                <td className="px-4 py-2.5 font-medium text-gray-800">{pos.name}</td>
                <td className="px-4 py-2.5 text-gray-500">{pos.department?.deptName}</td>
                <td className="px-4 py-2.5">{pos._count?.employees ?? 0}</td>
                <td className="px-4 py-2.5">
                  <Badge variant={pos.status === 'ACTIVE' ? 'success' : 'neutral'}>{pos.status}</Badge>
                </td>
                <td className="px-4 py-2.5 text-right">
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Position' : 'Add Position'}>
        <form onSubmit={handleSubmit}>
          <Field label="Location" required>
            <Select
              required
              value={form.departmentId}
              onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
            >
              <option value="">Select department...</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.deptName}
                </option>
              ))}
            </Select>
          </Field>
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
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

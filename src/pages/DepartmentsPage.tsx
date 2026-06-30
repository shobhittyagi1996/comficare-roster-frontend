import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { departmentsApi, type DepartmentInput } from '@/api/departments';
import type { Department } from '@/types';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { Field, TextInput } from '@/components/ui/Field';

const emptyForm: DepartmentInput = {
  deptName: '',
  startDate: new Date().toISOString().slice(0, 10),
  address: { addressLine1: '', district: '', state: '', pincode: '', country: 'Australia' },
};

export default function DepartmentsPage() {
  const [items, setItems] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [form, setForm] = useState<DepartmentInput>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await departmentsApi.list({ search, pageSize: 100 });
      setItems(res.items);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(dept: Department) {
    setEditing(dept);
    setForm({
      deptName: dept.deptName,
      startDate: dept.startDate.slice(0, 10),
      description: dept.description,
      timezone: dept.timezone,
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await departmentsApi.update(editing.id, form);
        toast.success('Department updated');
      } else {
        await departmentsApi.create(form);
        toast.success('Department created');
      }
      setModalOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(dept: Department) {
    if (!confirm(`Delete Department "${dept.deptName}"?`)) return;
    try {
      await departmentsApi.remove(dept.id);
      toast.success('Department deleted');
      load();
    } catch {
      // toast already shown by interceptor
    }
  }

  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-h5 font-bold text-gray-800">Departments</h1>
        <Button onClick={openCreate}>+ Add Department</Button>
      </div>

      <TextInput
        placeholder="Search departments..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 max-w-xs"
      />

      <div className="flex-1 overflow-auto rounded-lg border border-gray-200 bg-surface-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-surface-offwhite text-left text-xs font-semibold uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2.5">Department Name</th>
              <th className="px-4 py-2.5">Address</th>
              <th className="px-4 py-2.5">Position</th>
              <th className="px-4 py-2.5">Employees</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  No locations found
                </td>
              </tr>
            )}
            {items.map((dept) => {
              const addr = dept.departmentAddresses?.[0]?.address;
              return (
                <tr key={dept.id} className="hover:bg-surface-offwhite">
                  <td className="px-4 py-2.5 font-medium text-gray-800">{dept.deptName}</td>
                  <td className="px-4 py-2.5 text-gray-500">
                    {addr
                      ? `${addr.addressLine1}, ${addr.district ?? ''} ${addr.state ?? ''} ${addr.pincode ?? ''}`
                      : '—'}
                  </td>
                  <td className="px-4 py-2.5">{dept._count?.positions ?? dept.positions?.length ?? 0}</td>
                  <td className="px-4 py-2.5">{dept._count?.employees ?? 0}</td>
                  <td className="px-4 py-2.5">
                    <Badge variant={dept.status === 'ACTIVE' ? 'success' : 'neutral'}>{dept.status}</Badge>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(dept)}>
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(dept)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Department' : 'Add Department'}
      >
        <form onSubmit={handleSubmit}>
          <Field label="Department Name" required>
            <TextInput
              required
              value={form.deptName}
              onChange={(e) => setForm({ ...form, deptName: e.target.value })}
            />
          </Field>
          <Field label="Start Date" required>
            <TextInput
              type="date"
              required
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </Field>

          {!editing && (
            <>
              <Field label="Address Line 1" required>
                <TextInput
                  required
                  value={form.address?.addressLine1 ?? ''}
                  onChange={(e) =>
                    setForm({ ...form, address: { ...form.address!, addressLine1: e.target.value } })
                  }
                />
              </Field>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Suburb/District">
                  <TextInput
                    value={form.address?.district ?? ''}
                    onChange={(e) =>
                      setForm({ ...form, address: { ...form.address!, district: e.target.value } })
                    }
                  />
                </Field>
                <Field label="State">
                  <TextInput
                    value={form.address?.state ?? ''}
                    onChange={(e) =>
                      setForm({ ...form, address: { ...form.address!, state: e.target.value } })
                    }
                  />
                </Field>
                <Field label="Postcode">
                  <TextInput
                    value={form.address?.pincode ?? ''}
                    onChange={(e) =>
                      setForm({ ...form, address: { ...form.address!, pincode: e.target.value } })
                    }
                  />
                </Field>
              </div>
            </>
          )}

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

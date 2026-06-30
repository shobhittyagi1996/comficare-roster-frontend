import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { employeesApi, type EmployeeInput } from '@/api/employees';
import { departmentsApi } from '@/api/departments';
import { positionsApi } from '@/api/positions';
import type { Department, Employee, EmployeeRole, Position } from '@/types';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { Field, Select, TextInput } from '@/components/ui/Field';

const ROLES: EmployeeRole[] = ['EMPLOYEE', 'SUPERVISOR', 'LOCATION_MANAGER', 'ADVISOR', 'ADMIN'];

const emptyForm: EmployeeInput = {
  firstName: '',
  lastName: '',
  deptId: '',
  positionId: '',
  role: 'EMPLOYEE',
  dateFrom: new Date().toISOString().slice(0, 10),
};

export default function EmployeesPage() {
  const [items, setItems] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [deptFilter, setDeptFilter] = useState('');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [createLogin, setCreateLogin] = useState(false);
  const [form, setForm] = useState<EmployeeInput>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [empRes, deptRes] = await Promise.all([
        employeesApi.list({ departmentId: deptFilter || undefined, search: search || undefined, pageSize: 200 }),
        departmentsApi.list({ pageSize: 100 }),
      ]);
      setItems(empRes.items);
      setDepartments(deptRes.items);
    } finally {
      setLoading(false);
    }
  }, [deptFilter, search]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!form.deptId) {
      setPositions([]);
      return;
    }
    positionsApi.list({ departmentId: form.deptId, pageSize: 100 }).then((res) => setPositions(res.items));
  }, [form.deptId]);

  function openCreate() {
    setCreateLogin(false);
    setForm(emptyForm);
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await employeesApi.create(createLogin ? form : { ...form, user: undefined });
      toast.success('Employee created');
      setModalOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(emp: Employee) {
    if (!confirm(`Remove employee "${emp.firstName} ${emp.lastName}"?`)) return;
    try {
      await employeesApi.remove(emp.id);
      toast.success('Employee removed');
      load();
    } catch {
      // toast already shown
    }
  }

  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-h5 font-bold text-gray-800">Employees</h1>
        <Button onClick={openCreate}>+ Add Employee</Button>
      </div>

      <div className="mb-4 flex gap-3">
        <TextInput placeholder="Search by name..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <Select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="max-w-xs">
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.deptName}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex-1 overflow-auto rounded-lg border border-gray-200 bg-surface-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-surface-offwhite text-left text-xs font-semibold uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2.5">Employee Name</th>
              <th className="px-4 py-2.5">Department</th>
              <th className="px-4 py-2.5">Position</th>
              <th className="px-4 py-2.5">Role</th>
              <th className="px-4 py-2.5">Phone</th>
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
                  No employees found
                </td>
              </tr>
            )}
            {items.map((emp) => (
              <tr key={emp.id} className="hover:bg-surface-offwhite">
                <td className="px-4 py-2.5 font-medium text-gray-800">
                  {emp.firstName} {emp.lastName}
                </td>
                <td className="px-4 py-2.5 text-gray-500">{emp.department?.deptName}</td>
                <td className="px-4 py-2.5 text-gray-500">{emp.position?.name}</td>
                <td className="px-4 py-2.5">
                  <Badge variant="primary">{emp.role}</Badge>
                </td>
                <td className="px-4 py-2.5 text-gray-500">{emp.phoneNo ?? '—'}</td>
                <td className="px-4 py-2.5 text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(emp)}>
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Employee">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="First Name" required>
              <TextInput required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            </Field>
            <Field label="Last Name" required>
              <TextInput required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
            </Field>
          </div>

          <Field label="Location" required>
            <Select
              required
              value={form.deptId}
              onChange={(e) => setForm({ ...form, deptId: e.target.value, positionId: '' })}
            >
              <option value="">Select location...</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.deptName}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Area" required>
            <Select
              required
              disabled={!form.deptId}
              value={form.positionId}
              onChange={(e) => setForm({ ...form, positionId: e.target.value })}
            >
              <option value="">Select area...</option>
              {positions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Role">
              <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as EmployeeRole })}>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Phone">
              <TextInput value={form.phoneNo ?? ''} onChange={(e) => setForm({ ...form, phoneNo: e.target.value })} />
            </Field>
          </div>

          <Field label="Start Date" required>
            <TextInput type="date" required value={form.dateFrom} onChange={(e) => setForm({ ...form, dateFrom: e.target.value })} />
          </Field>

          <label className="mb-3 flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" checked={createLogin} onChange={(e) => setCreateLogin(e.target.checked)} />
            Create a login account for this employee
          </label>

          {createLogin && (
            <div className="rounded-lg border border-gray-200 bg-surface-offwhite p-3">
              <Field label="Username" required>
                <TextInput
                  required
                  value={form.user?.userName ?? ''}
                  onChange={(e) => setForm({ ...form, user: { ...form.user!, userName: e.target.value } })}
                />
              </Field>
              <Field label="Email" required>
                <TextInput
                  type="email"
                  required
                  value={form.user?.email ?? ''}
                  onChange={(e) => setForm({ ...form, user: { ...form.user!, email: e.target.value } })}
                />
              </Field>
              <Field label="Temporary Password" required>
                <TextInput
                  type="password"
                  required
                  minLength={8}
                  value={form.user?.password ?? ''}
                  onChange={(e) => setForm({ ...form, user: { ...form.user!, password: e.target.value } })}
                />
              </Field>
            </div>
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

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Pencil } from 'lucide-react';
import { departmentsApi, type DepartmentInput } from '@/api/departments';
import type { Department } from '@/types';
import Sheet from '@/components/ui/Sheet';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Field, Select, TextArea, TextInput } from '@/components/ui/Field';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import DepartmentPositionsTab from './DepartmentPositionsTab';
import DepartmentEmployeesTab from './DepartmentEmployeesTab';

const emptyForm: DepartmentInput = {
  deptName: '',
  status: 'ACTIVE',
  startDate: new Date().toISOString().slice(0, 10),
  timezone: '',
  description: '',
  address: { addressLine1: '', addressLine2: '', district: '', state: '', pincode: '', country: 'Australia' },
};

interface Props {
  open: boolean;
  onClose: () => void;
  departmentId: string | null;
  onSaved: () => void;
}

export default function DepartmentPanel({ open, onClose, departmentId, onSaved }: Props) {
  const isCreate = departmentId === null;
  const [mode, setMode] = useState<'view' | 'edit'>(isCreate ? 'edit' : 'view');
  const [detail, setDetail] = useState<Department | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [form, setForm] = useState<DepartmentInput>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (!open) return;
    setActiveTab('details');
    if (departmentId) {
      setMode('view');
      setLoadingDetail(true);
      departmentsApi
        .get(departmentId)
        .then((d) => {
          setDetail(d);
          const addr = d.departmentAddresses?.[0]?.address;
          setForm({
            deptName: d.deptName,
            status: d.status,
            startDate: d.startDate.slice(0, 10),
            timezone: d.timezone ?? '',
            description: d.description ?? '',
            address: {
              addressLine1: addr?.addressLine1 ?? '',
              addressLine2: addr?.addressLine2 ?? '',
              district: addr?.district ?? '',
              state: addr?.state ?? '',
              pincode: addr?.pincode ?? '',
              country: addr?.country ?? 'Australia',
            },
          });
        })
        .finally(() => setLoadingDetail(false));
    } else {
      setMode('edit');
      setDetail(null);
      setForm(emptyForm);
    }
  }, [open, departmentId]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (departmentId) {
        const updated = await departmentsApi.update(departmentId, form);
        setDetail(updated);
        toast.success('Department updated');
        setMode('view');
      } else {
        await departmentsApi.create(form);
        toast.success('Department created');
        onSaved();
        onClose();
        return;
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!departmentId || !detail) return;
    if (!confirm(`Delete department "${detail.deptName}"?`)) return;
    try {
      await departmentsApi.remove(departmentId);
      toast.success('Department deleted');
      onSaved();
      onClose();
    } catch {
      // backend returns a clear 409 message (e.g. has positions/employees), shown via toast already
    }
  }

  function handleCancelEdit() {
    if (isCreate) {
      onClose();
      return;
    }
    if (detail) {
      const addr = detail.departmentAddresses?.[0]?.address;
      setForm({
        deptName: detail.deptName,
        status: detail.status,
        startDate: detail.startDate.slice(0, 10),
        timezone: detail.timezone ?? '',
        description: detail.description ?? '',
        address: {
          addressLine1: addr?.addressLine1 ?? '',
          addressLine2: addr?.addressLine2 ?? '',
          district: addr?.district ?? '',
          state: addr?.state ?? '',
          pincode: addr?.pincode ?? '',
          country: addr?.country ?? 'Australia',
        },
      });
    }
    setMode('view');
  }

  const addr = detail?.departmentAddresses?.[0]?.address;

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={isCreate ? 'Add Department' : detail?.deptName ?? 'Department'}
      subtitle={!isCreate && detail ? `${detail._count?.positions ?? 0} positions · ${detail._count?.employees ?? 0} employees` : undefined}
      width="lg"
    >
      {loadingDetail ? (
        <div className="py-10 text-center text-gray-400">Loading...</div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="positions">Positions</TabsTrigger>
            <TabsTrigger value="employees">Employees</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <form onSubmit={handleSave}>
              {mode === 'view' && (
                <div className="mb-4 flex justify-end">
                  <Button type="button" size="sm" variant="secondary" onClick={() => setMode('edit')}>
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                </div>
              )}

              {mode === 'view' ? (
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <ViewField label="Department Name" value={detail?.deptName} />
                  <ViewField label="Status" value={<Badge variant={detail?.status === 'ACTIVE' ? 'success' : 'neutral'}>{detail?.status}</Badge>} />
                  <ViewField label="Start Date" value={detail?.startDate?.slice(0, 10)} />
                  <ViewField label="Timezone" value={detail?.timezone || '—'} />
                  <ViewField label="Description" value={detail?.description || '—'} span2 />
                  <ViewField
                    label="Address"
                    span2
                    value={
                      addr
                        ? `${addr.addressLine1}${addr.addressLine2 ? ', ' + addr.addressLine2 : ''}, ${addr.district ?? ''} ${addr.state ?? ''} ${addr.pincode ?? ''}`
                        : '—'
                    }
                  />
                </dl>
              ) : (
                <>
                  <Field label="Department Name" required>
                    <TextInput
                      required
                      value={form.deptName}
                      onChange={(e) => setForm({ ...form, deptName: e.target.value })}
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Status">
                      <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                      </Select>
                    </Field>
                    <Field label="Start Date" required>
                      <TextInput
                        type="date"
                        required
                        value={form.startDate}
                        onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      />
                    </Field>
                  </div>
                  <Field label="Timezone">
                    <TextInput
                      placeholder="e.g. Australia/Melbourne"
                      value={form.timezone ?? ''}
                      onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                    />
                  </Field>
                  <Field label="Description">
                    <TextArea
                      rows={2}
                      value={form.description ?? ''}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  </Field>

                  <div className="mt-4 mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Address
                  </div>
                  <Field label="Address Line 1" required>
                    <TextInput
                      required
                      value={form.address?.addressLine1 ?? ''}
                      onChange={(e) => setForm({ ...form, address: { ...form.address!, addressLine1: e.target.value } })}
                    />
                  </Field>
                  <Field label="Address Line 2">
                    <TextInput
                      value={form.address?.addressLine2 ?? ''}
                      onChange={(e) => setForm({ ...form, address: { ...form.address!, addressLine2: e.target.value } })}
                    />
                  </Field>
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Suburb/District">
                      <TextInput
                        value={form.address?.district ?? ''}
                        onChange={(e) => setForm({ ...form, address: { ...form.address!, district: e.target.value } })}
                      />
                    </Field>
                    <Field label="State">
                      <TextInput
                        value={form.address?.state ?? ''}
                        onChange={(e) => setForm({ ...form, address: { ...form.address!, state: e.target.value } })}
                      />
                    </Field>
                    <Field label="Postcode">
                      <TextInput
                        value={form.address?.pincode ?? ''}
                        onChange={(e) => setForm({ ...form, address: { ...form.address!, pincode: e.target.value } })}
                      />
                    </Field>
                  </div>

                  <div className="mt-5 flex justify-between gap-2">
                    <div>
                      {!isCreate && (
                        <Button type="button" variant="danger" size="sm" onClick={handleDelete}>
                          Delete Department
                        </Button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="secondary" size="sm" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                      <Button type="submit" size="sm" disabled={saving}>
                        {saving ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </form>
          </TabsContent>

          <TabsContent value="positions">
            {isCreate ? (
              <div className="py-10 text-center text-gray-400">Save the department first to add positions.</div>
            ) : (
              <DepartmentPositionsTab departmentId={departmentId} />
            )}
          </TabsContent>

          <TabsContent value="employees">
            {isCreate ? (
              <div className="py-10 text-center text-gray-400">Save the department first to view employees.</div>
            ) : (
              <DepartmentEmployeesTab departmentId={departmentId} />
            )}
          </TabsContent>
        </Tabs>
      )}
    </Sheet>
  );
}

function ViewField({ label, value, span2 }: { label: string; value?: React.ReactNode; span2?: boolean }) {
  return (
    <div className={span2 ? 'col-span-2' : undefined}>
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="mt-0.5 text-gray-800">{value ?? '—'}</dd>
    </div>
  );
}

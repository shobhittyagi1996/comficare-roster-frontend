import { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Field, Select, TextArea, TextInput } from '@/components/ui/Field';
import type { Employee, Position, RosterLineItem } from '@/types';
import type { RosterLineItemInput } from '@/api/rosters';
import { toISODate } from '@/utils/date';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: RosterLineItemInput) => Promise<void>;
  onDelete?: () => Promise<void>;
  date: string;
  positionId?: string;
  presetEmployeeId?: string | null;
  employees: Employee[];
  positions: Position[];
  days: Date[];
  existing?: RosterLineItem | null;
}

export default function ShiftModal({
  open,
  onClose,
  onSave,
  onDelete,
  date,
  positionId,
  presetEmployeeId,
  employees,
  positions,
  days,
  existing,
}: Props) {
  const [form, setForm] = useState<RosterLineItemInput>({
    date,
    startTime: '07:00',
    endTime: '15:00',
    mealBreakMinutes: 30,
    employeeId: presetEmployeeId ?? null,
    positionId: positionId ?? '',
    shiftType: '',
    comment: '',
    isEmptyShift: false,
    isOpenShift: false,
    openShiftRequiresApproval: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existing) {
      setForm({
        date: existing.date.slice(0, 10),
        startTime: existing.startTime,
        endTime: existing.endTime,
        mealBreakMinutes: existing.mealBreakMinutes,
        employeeId: existing.employeeId,
        positionId: existing.positionId ?? positionId ?? '',
        shiftType: existing.shiftType ?? '',
        comment: existing.comment ?? '',
        isEmptyShift: existing.isEmptyShift,
        isOpenShift: existing.isOpenShift,
        openShiftRequiresApproval: existing.openShiftRequiresApproval,
      });
    } else {
      setForm((f) => ({
        ...f,
        date,
        positionId: positionId ?? '',
        employeeId: presetEmployeeId ?? null,
        comment: '',
        shiftType: '',
      }));
    }
  }, [existing, date, positionId, presetEmployeeId, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={existing ? 'Edit Shift' : 'Add Shift'} size="sm">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date" required>
            <Select required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}>
              {days.map((d) => (
                <option key={toISODate(d)} value={toISODate(d)}>
                  {d.toLocaleDateString('en-AU', { weekday: 'short', day: '2-digit', month: 'short' })}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Area" required>
            <Select
              required
              value={form.positionId ?? ''}
              onChange={(e) => setForm({ ...form, positionId: e.target.value })}
            >
              <option value="" disabled>
                Select area...
              </option>
              {positions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Start Time" required>
            <TextInput
              type="time"
              required
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            />
          </Field>
          <Field label="End Time" required>
            <TextInput
              type="time"
              required
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            />
          </Field>
        </div>

        <Field label="Meal Break (minutes)">
          <TextInput
            type="number"
            min={0}
            value={form.mealBreakMinutes ?? 0}
            onChange={(e) => setForm({ ...form, mealBreakMinutes: Number(e.target.value) })}
          />
        </Field>

        <Field label="Employee">
          <Select
            value={form.employeeId ?? ''}
            disabled={form.isOpenShift || form.isEmptyShift}
            onChange={(e) => setForm({ ...form, employeeId: e.target.value || null })}
          >
            <option value="">Unassigned</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.firstName} {emp.lastName}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Shift Type">
          <TextInput
            placeholder="e.g. AM, PM, NT"
            value={form.shiftType ?? ''}
            onChange={(e) => setForm({ ...form, shiftType: e.target.value })}
          />
        </Field>

        <Field label="Additional Info / Comment">
          <TextArea
            rows={2}
            value={form.comment ?? ''}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
          />
        </Field>

        <div className="mb-3 flex flex-wrap gap-4 text-xs text-gray-600">
          <label className="flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={form.isEmptyShift}
              onChange={(e) => setForm({ ...form, isEmptyShift: e.target.checked, employeeId: null })}
            />
            Empty shift
          </label>
          <label className="flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={form.isOpenShift}
              onChange={(e) => setForm({ ...form, isOpenShift: e.target.checked, employeeId: null })}
            />
            Open shift
          </label>
          <label className="flex items-center gap-1.5">
            <input
              type="checkbox"
              disabled={!form.isOpenShift}
              checked={form.openShiftRequiresApproval}
              onChange={(e) => setForm({ ...form, openShiftRequiresApproval: e.target.checked })}
            />
            Requires approval
          </label>
        </div>

        <div className="mt-4 flex justify-between gap-2">
          <div>
            {existing && onDelete && (
              <Button type="button" variant="danger" size="sm" onClick={onDelete}>
                Delete
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

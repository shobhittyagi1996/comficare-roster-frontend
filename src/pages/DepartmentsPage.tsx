import { Fragment, useEffect, useMemo, useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { departmentsApi } from '@/api/departments';
import type { Department } from '@/types';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Select, TextInput } from '@/components/ui/Field';
import SortableHeader, { type SortDir } from '@/components/ui/SortableHeader';
import DepartmentPanel from '@/components/department/DepartmentPanel';

type SortKey = 'name' | 'positions' | 'employees' | 'status';
type GroupBy = 'none' | 'status';

export default function DepartmentsPage() {
  const [items, setItems] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [groupBy, setGroupBy] = useState<GroupBy>('none');

  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await departmentsApi.list({ search, pageSize: 100 });
      setItems(res.items.filter((d) => !d.isRootDepartment));
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  function openCreate() {
    setSelectedId(null);
    setPanelOpen(true);
  }

  function openView(dept: Department) {
    setSelectedId(dept.id);
    setPanelOpen(true);
  }

  const sorted = useMemo(() => {
    const copy = [...items];
    copy.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name') cmp = a.deptName.localeCompare(b.deptName);
      else if (sortKey === 'positions') cmp = (a._count?.positions ?? 0) - (b._count?.positions ?? 0);
      else if (sortKey === 'employees') cmp = (a._count?.employees ?? 0) - (b._count?.employees ?? 0);
      else if (sortKey === 'status') cmp = a.status.localeCompare(b.status);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [items, sortKey, sortDir]);

  const groups = useMemo(() => {
    if (groupBy === 'none') return [{ label: null as string | null, items: sorted }];
    const map = new Map<string, Department[]>();
    for (const d of sorted) {
      if (!map.has(d.status)) map.set(d.status, []);
      map.get(d.status)!.push(d);
    }
    return [...map.entries()].map(([label, items]) => ({ label, items }));
  }, [sorted, groupBy]);

  return (
    <div className="flex h-full flex-col bg-surface-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-h5 font-bold text-gray-800">Departments</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add Department
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <TextInput
          placeholder="Search departments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={groupBy} onChange={(e) => setGroupBy(e.target.value as GroupBy)} className="w-44">
          <option value="none">No grouping</option>
          <option value="status">Group by Status</option>
        </Select>
      </div>

      <div className="flex-1 overflow-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-surface-offwhite text-left text-xs font-semibold uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2.5">
                <SortableHeader label="Department Name" sortKey="name" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              </th>
              <th className="px-4 py-2.5">Address</th>
              <th className="px-4 py-2.5">
                <SortableHeader label="Positions" sortKey="positions" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              </th>
              <th className="px-4 py-2.5">
                <SortableHeader label="Employees" sortKey="employees" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              </th>
              <th className="px-4 py-2.5">
                <SortableHeader label="Status" sortKey="status" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              </th>
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
                  No departments found
                </td>
              </tr>
            )}
            {!loading &&
              groups.map((group) => (
                <Fragment key={group.label ?? 'all'}>
                  {group.label && (
                    <tr>
                      <td colSpan={5} className="bg-surface-offwhite px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
                        {group.label} ({group.items.length})
                      </td>
                    </tr>
                  )}
                  {group.items.map((dept) => {
                    const addr = dept.departmentAddresses?.[0]?.address;
                    return (
                      <tr
                        key={dept.id}
                        onClick={() => openView(dept)}
                        className="cursor-pointer hover:bg-surface-offwhite"
                      >
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
                      </tr>
                    );
                  })}
                </Fragment>
              ))}
          </tbody>
        </table>
      </div>

      <DepartmentPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        departmentId={selectedId}
        onSaved={load}
      />
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { employeesApi } from '@/api/employees';
import type { Employee } from '@/types';
import Badge from '@/components/ui/Badge';
import { TextInput } from '@/components/ui/Field';
import SortableHeader, { type SortDir } from '@/components/ui/SortableHeader';

type SortKey = 'name' | 'position' | 'role';

export default function DepartmentEmployeesTab({ departmentId }: { departmentId: string }) {
  const [items, setItems] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  useEffect(() => {
    setLoading(true);
    employeesApi
      .list({ departmentId, pageSize: 500 })
      .then((res) => setItems(res.items))
      .finally(() => setLoading(false));
  }, [departmentId]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const visible = useMemo(() => {
    const filtered = items.filter((e) =>
      `${e.firstName} ${e.lastName}`.toLowerCase().includes(search.toLowerCase())
    );
    const sorted = [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name') cmp = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      else if (sortKey === 'position') cmp = (a.position?.name ?? '').localeCompare(b.position?.name ?? '');
      else if (sortKey === 'role') cmp = a.role.localeCompare(b.role);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [items, search, sortKey, sortDir]);

  return (
    <div>
      <div className="mb-3">
        <TextInput
          placeholder="Search employees..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
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
                  label="Position"
                  sortKey="position"
                  activeKey={sortKey}
                  dir={sortDir}
                  onSort={toggleSort}
                />
              </th>
              <th className="px-3 py-2 text-left">
                <SortableHeader label="Role" sortKey="role" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              </th>
              <th className="px-3 py-2 text-left">Phone</th>
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
                  No employees found
                </td>
              </tr>
            )}
            {visible.map((emp) => (
              <tr key={emp.id} className="hover:bg-surface-offwhite">
                <td className="px-3 py-2 font-medium text-gray-800">
                  {emp.firstName} {emp.lastName}
                </td>
                <td className="px-3 py-2 text-gray-500">{emp.position?.name ?? '—'}</td>
                <td className="px-3 py-2">
                  <Badge variant="primary">{emp.role}</Badge>
                </td>
                <td className="px-3 py-2 text-gray-500">{emp.phoneNo ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

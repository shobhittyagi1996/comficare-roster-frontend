import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import DepartmentsPage from '@/pages/DepartmentsPage';
import PositionsPage from '@/pages/PositionsPage';
import EmployeesPage from '@/pages/EmployeesPage';
import RosterPage from '@/pages/RosterPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/roster" replace />} />
          <Route path="/roster" element={<RosterPage />} />
          <Route path="/departments" element={<DepartmentsPage />} />
          <Route path="/positions" element={<PositionsPage />} />
          <Route path="/employees" element={<EmployeesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export type EmployeeRole = 'ADMIN' | 'SUPERVISOR' | 'EMPLOYEE' | 'LOCATION_MANAGER' | 'ADVISOR';
export type RosterStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
export type SwapStatus = 'PENDING' | 'APPROVED';

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  error?: string;
  details?: unknown;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Address {
  id: string;
  type: 'HOME' | 'WORK' | 'BILLING' | 'MAILING';
  addressLine1: string;
  addressLine2?: string | null;
  pincode?: string | null;
  district?: string | null;
  state?: string | null;
  country: string;
  contactNo?: string | null;
}

export interface DepartmentAddress {
  addressId: string;
  address: Address;
}

export interface Department {
  id: string;
  deptName: string;
  description?: string | null;
  startDate: string;
  endDate?: string | null;
  parentDeptId?: string | null;
  isRootDepartment: boolean;
  status: string;
  timezone?: string | null;
  departmentAddresses?: DepartmentAddress[];
  positions?: Position[];
  _count?: { positions: number; employees: number };
}

export interface Position {
  id: string;
  departmentId: string;
  name: string;
  description?: string | null;
  status: string;
  reportToId?: string | null;
  isHead: boolean;
  dateFrom: string;
  dateTo?: string | null;
  department?: { id: string; deptName: string };
  _count?: { employees: number };
}

export interface Employee {
  id: string;
  positionId: string;
  deptId: string;
  firstName: string;
  lastName: string;
  preferredName?: string | null;
  phoneNo?: string | null;
  gender?: string | null;
  role: EmployeeRole;
  dateFrom: string;
  dateTo?: string | null;
  position?: { id: string; name: string };
  department?: { id: string; deptName: string };
}

export interface RosterLineItem {
  id: string;
  rosterId: string;
  date: string;
  startTime: string;
  endTime: string;
  mealBreakMinutes?: number | null;
  employeeId?: string | null;
  positionId?: string | null;
  shiftType?: string | null;
  comment?: string | null;
  isEmptyShift: boolean;
  isOpenShift: boolean;
  openShiftRequiresApproval: boolean;
  employee?: { id: string; firstName: string; lastName: string } | null;
  position?: { id: string; name: string } | null;
}

export interface Roster {
  id: string;
  departmentId: string;
  startDate: string;
  endDate: string;
  rosterStatus: RosterStatus;
  swapStatus?: SwapStatus | null;
  department?: { id: string; deptName: string };
  lineItems: RosterLineItem[];
}

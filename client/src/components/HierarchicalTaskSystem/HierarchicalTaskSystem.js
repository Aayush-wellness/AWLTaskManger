import { useState, useEffect } from 'react';
import axios from '../../config/axios';
import DepartmentMasterTable from './DepartmentMasterTable';
import EmployeeDirectoryTable from './EmployeeDirectoryTable';
import './HierarchicalTaskSystem.css';

const HierarchicalTaskSystem = () => {
  const [level, setLevel] = useState(1); // 1: Departments, 2: Employees
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch departments on mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get('/api/departments');
      
      // Enrich departments with employee count
      const enrichedDepts = await Promise.all(
        res.data.map(async (dept) => {
          try {
            const empRes = await axios.get(`/api/users/department/${dept._id}`);
            return {
              ...dept,
              employeeCount: empRes.data.length
            };
          } catch {
            return { ...dept, employeeCount: 0 };
          }
        })
      );
      
      setDepartments(enrichedDepts);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
      setError('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeesForDepartment = async (dept) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`/api/users/department/${dept._id}`);
      setEmployees(res.data);
      setSelectedDepartment(dept);
      setLevel(2);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
      setError('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDepartments = () => {
    setLevel(1);
    setSelectedDepartment(null);
    setEmployees([]);
  };

  if (loading && level === 1) {
    return <div className="hierarchical-system loading">Loading departments...</div>;
  }

  if (error) {
    return <div className="hierarchical-system error">{error}</div>;
  }

  return (
    <div className="hierarchical-system">
      {level === 1 && (
        <DepartmentMasterTable
          departments={departments}
          onSelectDepartment={fetchEmployeesForDepartment}
          onDepartmentsUpdate={fetchDepartments}
        />
      )}

      {level === 2 && selectedDepartment && (
        <EmployeeDirectoryTable
          department={selectedDepartment}
          employees={employees}
          onBack={handleBackToDepartments}
          loading={loading}
        />
      )}
    </div>
  );
};

export default HierarchicalTaskSystem;

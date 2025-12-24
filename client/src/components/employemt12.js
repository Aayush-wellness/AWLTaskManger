// import React, { useMemo, useState, useCallback } from 'react';
// import {
//   MaterialReactTable,
//   useMaterialReactTable,
// } from 'material-react-table';
// import { Plus, Edit, Trash2, UserPlus } from 'lucide-react';

// // Employee data - simplified without hierarchy
// export const data = [
//   {
//     id: '5ymtrc',
//     firstName: 'Henry',
//     lastName: 'Lynch',
//     email: 'Camden.Macejkovic@yahoo.com',
//     department: 'Engineering',
//     position: 'Manager',
//     joiningDate: '2023-01-15',
//     managerId: null,
//   },
//   {
//     id: 'wzxj9m',
//     firstName: 'Mckenna',
//     lastName: 'Friesen',
//     email: 'Veda_Feeney@yahoo.com',
//     department: 'Marketing',
//     position: 'Employee',
//     joiningDate: '2023-02-20',
//     managerId: null,
//   },
// ];

// const EmployeeTable = () => {
//   // State for managing employees data
//   const [employeesData, setEmployeesData] = useState(data);
//   const [showEmployeeModal, setShowEmployeeModal] = useState(false);
//   const [employeeModalType, setEmployeeModalType] = useState('add'); // 'add' or 'edit'
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [employeeFormData, setEmployeeFormData] = useState({
//     firstName: '',
//     lastName: '',
//     email: '',
//     department: '',
//     joiningDate: '',
//     position: ''
//   });

//   // Employee CRUD functions
//   const handleAddEmployee = useCallback(() => {
//     setEmployeeModalType('add');
//     setSelectedEmployee(null);
//     setEmployeeFormData({
//       firstName: '',
//       lastName: '',
//       email: '',
//       department: '',
//       joiningDate: '',
//       position: ''
//     });
//     setShowEmployeeModal(true);
//   }, []);

//   const handleEditEmployee = useCallback((employee) => {
//     setEmployeeModalType('edit');
//     setSelectedEmployee(employee);
//     setEmployeeFormData({
//       firstName: employee.firstName,
//       lastName: employee.lastName,
//       email: employee.email,
//       department: employee.department || '',
//       joiningDate: employee.joiningDate || '',
//       position: employee.position || (employee.managerId ? 'Employee' : 'Manager')
//     });
//     setShowEmployeeModal(true);
//   }, []);

//   const handleDeleteEmployee = useCallback((employeeId) => {
//     if (window.confirm('Are you sure you want to delete this employee?')) {
//       setEmployeesData(employeesData.filter(emp => emp.id !== employeeId));
//     }
//   }, [employeesData]);

//   const handleEmployeeSubmit = (e) => {
//     e.preventDefault();
//     if (employeeModalType === 'add') {
//       const newEmployee = {
//         id: Date.now().toString(),
//         firstName: employeeFormData.firstName,
//         lastName: employeeFormData.lastName,
//         email: employeeFormData.email,
//         department: employeeFormData.department,
//         joiningDate: employeeFormData.joiningDate,
//         position: employeeFormData.position,
//         managerId: employeeFormData.position.toLowerCase().includes('employee') ? 'manager' : null,
//       };
//       setEmployeesData([...employeesData, newEmployee]);
//     } else {
//       setEmployeesData(employeesData.map(emp => 
//         emp.id === selectedEmployee.id 
//           ? {
//               ...emp,
//               firstName: employeeFormData.firstName,
//               lastName: employeeFormData.lastName,
//               email: employeeFormData.email,
//               department: employeeFormData.department,
//               joiningDate: employeeFormData.joiningDate,
//               position: employeeFormData.position,
//               managerId: employeeFormData.position.toLowerCase().includes('employee') ? 'manager' : null,
//             }
//           : emp
//       ));
//     }
//     setShowEmployeeModal(false);
//   };

//   const handleEmployeeInputChange = (field, value) => {
//     setEmployeeFormData({ ...employeeFormData, [field]: value });
//   };

//   const columns = useMemo(
//     () => [
//       {
//         accessorKey: 'name',
//         header: 'Name',
//         size: 180,
//         Cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}`,
//       },
//       {
//         accessorKey: 'email',
//         header: 'Email',
//         size: 220,
//       },
//       {
//         accessorKey: 'position',
//         header: 'Role',
//         size: 120,
//         Cell: ({ row }) => row.original.position || (row.original.managerId ? 'Employee' : 'Manager'),
//       },
//       {
//         accessorKey: 'department',
//         header: 'Department',
//         size: 120,
//         Cell: ({ row }) => row.original.department || 'Engineering',
//       },
//       {
//         accessorKey: 'joiningDate',
//         header: 'Joining Date',
//         size: 130,
//         Cell: ({ row }) => row.original.joiningDate || '2023-01-15',
//       },
//       {
//         accessorKey: 'actions',
//         header: 'Actions',
//         size: 150,
//         enableSorting: false,
//         Cell: ({ row }) => (
//           <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
//             <button
//               onClick={() => handleEditEmployee(row.original)}
//               style={{
//                 padding: '6px',
//                 background: 'transparent',
//                 color: 'black',
//                 border: 'none',
//                 borderRadius: '0px',
//                 cursor: 'pointer',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 boxShadow: 'none'
//               }}
//               title="Edit Employee"
//             >
//               <Edit size={14} />
//             </button>
//             <button
//               onClick={() => handleDeleteEmployee(row.original.id)}
//               style={{
//                 padding: '6px',
//                 background: 'transparent',
//                 color: 'black',
//                 border: 'none',
//                 borderRadius: '0px',
//                 cursor: 'pointer',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 boxShadow: 'none'
//               }}
//               title="Delete Employee"
//             >
//               <Trash2 size={14} />
//             </button>
//           </div>
//         ),
//       },
//     ],
//     [handleEditEmployee, handleDeleteEmployee],
//   );

//   // All employees data (no hierarchy filtering needed)
//   const rootData = useMemo(() => employeesData, [employeesData]);

//   const table = useMaterialReactTable({
//     columns,
//     data: rootData,
//     enableExpanding: true,
//     renderTopToolbarCustomActions: () => (
//       <button
//         onClick={handleAddEmployee}
//         style={{
//           padding: '8px 12px',
//           background: 'transparent',
//           color: 'black',
//           border: 'none',
//           borderRadius: '0px',
//           cursor: 'pointer',
//           margin: '8px',
//           display: 'flex',
//           alignItems: 'center',
//           gap: '6px',
//           boxShadow: 'none'
//         }}
//         title="Add New Employee"
//       >
//         <UserPlus size={16} />
//         Add Employee
//       </button>
//     ),
//     renderDetailPanel: ({ row }) => (
//       <EmployeeDetailTable 
//         employee={row.original}
//       />
//     ),
//     muiTableBodyRowProps: {
//       sx: {
//         '&:hover': {
//           backgroundColor: 'transparent',
//         },
//       },
//     },
//     muiTableProps: {
//       sx: {
//         tableLayout: 'fixed',
//         width: '100%',
//       },
//     },
//     muiTableHeadCellProps: {
//       sx: {
//         textAlign: 'left',
//         padding: '16px',
//         fontWeight: '600',
//         color: '#374151',
//         borderBottom: '1px solid #e2e8f0',
//         fontSize: '14px',
//         lineHeight: '1.5',
//       },
//     },
//     muiTableBodyCellProps: {
//       sx: {
//         textAlign: 'left',
//         padding: '16px',
//         borderBottom: '1px solid #f1f5f9',
//         overflow: 'hidden',
//         textOverflow: 'ellipsis',
//         whiteSpace: 'nowrap',
//         fontSize: '14px',
//         lineHeight: '1.5',
//       },
//     },
//   });

//   return (
//     <>
//       <MaterialReactTable table={table} />
      
//       {/* Employee Modal */}
//       {showEmployeeModal && (
//         <div style={{
//           position: 'fixed',
//           top: 0,
//           left: 0,
//           right: 0,
//           bottom: 0,
//           backgroundColor: 'rgba(0, 0, 0, 0.5)',
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'center',
//           zIndex: 1000
//         }}>
//           <div style={{
//             background: 'white',
//             borderRadius: '8px',
//             padding: '24px',
//             width: '500px',
//             maxHeight: '80vh',
//             overflow: 'auto'
//           }}>
//             <h2 style={{ 
//               margin: '0 0 20px 0', 
//               color: '#374151',
//               fontSize: '18px',
//               fontWeight: '600'
//             }}>
//               {employeeModalType === 'add' ? 'Add New Employee' : 'Edit Employee'}
//             </h2>
            
//             <form onSubmit={handleEmployeeSubmit}>
//               <div style={{ marginBottom: '16px' }}>
//                 <label style={{ 
//                   display: 'block', 
//                   marginBottom: '6px', 
//                   fontWeight: '500',
//                   color: '#374151'
//                 }}>
//                   First Name *
//                 </label>
//                 <input
//                   type="text"
//                   value={employeeFormData.firstName}
//                   onChange={(e) => handleEmployeeInputChange('firstName', e.target.value)}
//                   required
//                   placeholder="Enter first name"
//                   style={{
//                     width: '100%',
//                     padding: '8px 12px',
//                     border: '1px solid #d1d5db',
//                     borderRadius: '4px',
//                     fontSize: '14px'
//                   }}
//                 />
//               </div>

//               <div style={{ marginBottom: '16px' }}>
//                 <label style={{ 
//                   display: 'block', 
//                   marginBottom: '6px', 
//                   fontWeight: '500',
//                   color: '#374151'
//                 }}>
//                   Last Name *
//                 </label>
//                 <input
//                   type="text"
//                   value={employeeFormData.lastName}
//                   onChange={(e) => handleEmployeeInputChange('lastName', e.target.value)}
//                   required
//                   placeholder="Enter last name"
//                   style={{
//                     width: '100%',
//                     padding: '8px 12px',
//                     border: '1px solid #d1d5db',
//                     borderRadius: '4px',
//                     fontSize: '14px'
//                   }}
//                 />
//               </div>

//               <div style={{ marginBottom: '16px' }}>
//                 <label style={{ 
//                   display: 'block', 
//                   marginBottom: '6px', 
//                   fontWeight: '500',
//                   color: '#374151'
//                 }}>
//                   Email *
//                 </label>
//                 <input
//                   type="email"
//                   value={employeeFormData.email}
//                   onChange={(e) => handleEmployeeInputChange('email', e.target.value)}
//                   required
//                   placeholder="Enter email address"
//                   style={{
//                     width: '100%',
//                     padding: '8px 12px',
//                     border: '1px solid #d1d5db',
//                     borderRadius: '4px',
//                     fontSize: '14px'
//                   }}
//                 />
//               </div>

//               <div style={{ marginBottom: '16px' }}>
//                 <label style={{ 
//                   display: 'block', 
//                   marginBottom: '6px', 
//                   fontWeight: '500',
//                   color: '#374151'
//                 }}>
//                   Department *
//                 </label>
//                 <input
//                   type="text"
//                   value={employeeFormData.department}
//                   onChange={(e) => handleEmployeeInputChange('department', e.target.value)}
//                   required
//                   placeholder="Enter department (e.g., Engineering, Marketing, HR)"
//                   style={{
//                     width: '100%',
//                     padding: '8px 12px',
//                     border: '1px solid #d1d5db',
//                     borderRadius: '4px',
//                     fontSize: '14px'
//                   }}
//                 />
//               </div>

//               <div style={{ marginBottom: '16px' }}>
//                 <label style={{ 
//                   display: 'block', 
//                   marginBottom: '6px', 
//                   fontWeight: '500',
//                   color: '#374151'
//                 }}>
//                   Role *
//                 </label>
//                 <input
//                   type="text"
//                   value={employeeFormData.position}
//                   onChange={(e) => handleEmployeeInputChange('position', e.target.value)}
//                   required
//                   placeholder="Enter role (e.g., Manager, Employee, Developer)"
//                   style={{
//                     width: '100%',
//                     padding: '8px 12px',
//                     border: '1px solid #d1d5db',
//                     borderRadius: '4px',
//                     fontSize: '14px'
//                   }}
//                 />
//               </div>

//               <div style={{ marginBottom: '20px' }}>
//                 <label style={{ 
//                   display: 'block', 
//                   marginBottom: '6px', 
//                   fontWeight: '500',
//                   color: '#374151'
//                 }}>
//                   Joining Date *
//                 </label>
//                 <input
//                   type="date"
//                   value={employeeFormData.joiningDate}
//                   onChange={(e) => handleEmployeeInputChange('joiningDate', e.target.value)}
//                   required
//                   style={{
//                     width: '100%',
//                     padding: '8px 12px',
//                     border: '1px solid #d1d5db',
//                     borderRadius: '4px',
//                     fontSize: '14px'
//                   }}
//                 />
//               </div>

//               <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
//                 <button
//                   type="button"
//                   onClick={() => setShowEmployeeModal(false)}
//                   style={{
//                     padding: '8px 16px',
//                     background: '#6b7280',
//                     color: 'white',
//                     border: 'none',
//                     borderRadius: '4px',
//                     cursor: 'pointer',
//                     fontSize: '14px',
//                     fontWeight: '500'
//                   }}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   style={{
//                     padding: '8px 16px',
//                     background: '#3b82f6',
//                     color: 'white',
//                     border: 'none',
//                     borderRadius: '4px',
//                     cursor: 'pointer',
//                     fontSize: '14px',
//                     fontWeight: '500'
//                   }}
//                 >
//                   {employeeModalType === 'add' ? 'Add Employee' : 'Update Employee'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// // Employee Detail Table Component - Table format instead of cards
// const EmployeeDetailTable = ({ employee }) => {
//   const [showModal, setShowModal] = useState(false);
//   const [modalType, setModalType] = useState('project'); // 'project', 'heading', 'edit-project', 'edit-heading'
//   const [selectedSection, setSelectedSection] = useState(null);
//   const [selectedProject, setSelectedProject] = useState(null);
//   const [formData, setFormData] = useState({
//     project: '',
//     task: '',
//     startDate: '',
//     endDate: '',
//     remark: '',
//     heading: ''
//   });

//   // Sample data with sections - in real app this would come from API
//   const [sectionsData, setSectionsData] = useState([
//     {
//       id: 1,
//       type: 'heading',
//       heading: 'Development Projects',
//       items: [
//         { 
//           id: 1, 
//           project: 'Website Redesign',
//           task: 'Complete project documentation',
//           startDate: '2024-12-01',
//           endDate: '2024-12-20',
//           remark: 'Working on final documentation phase'
//         },
//         { 
//           id: 2, 
//           project: 'Mobile App',
//           task: 'Review code submissions',
//           startDate: '2024-12-10',
//           endDate: '2024-12-18',
//           remark: 'Pending review from senior developer'
//         }
//       ]
//     },
//     {
//       id: 2,
//       type: 'heading', 
//       heading: 'Infrastructure Projects',
//       items: [
//         { 
//           id: 3, 
//           project: 'Database Migration',
//           task: 'Team meeting preparation',
//           startDate: '2024-12-12',
//           endDate: '2024-12-15',
//           remark: 'Meeting completed successfully'
//         },
//         { 
//           id: 4, 
//           project: 'API Development',
//           task: 'Update system requirements',
//           startDate: '2024-12-15',
//           endDate: '2024-12-22',
//           remark: 'Requirements analysis in progress'
//         }
//       ]
//     }
//   ]);

//   const handleAddHeading = () => {
//     setModalType('heading');
//     setSelectedSection(null);
//     setSelectedProject(null);
//     setFormData({
//       project: '',
//       task: '',
//       startDate: '',
//       endDate: '',
//       remark: '',
//       heading: ''
//     });
//     setShowModal(true);
//   };

//   const handleEditHeading = (section) => {
//     setModalType('edit-heading');
//     setSelectedSection(section.id);
//     setSelectedProject(null);
//     setFormData({
//       project: '',
//       task: '',
//       startDate: '',
//       endDate: '',
//       remark: '',
//       heading: section.heading
//     });
//     setShowModal(true);
//   };

//   const handleAddProject = (sectionId) => {
//     setModalType('project');
//     setSelectedSection(sectionId);
//     setSelectedProject(null);
//     setFormData({
//       project: '',
//       task: '',
//       startDate: '',
//       endDate: '',
//       remark: '',
//       heading: ''
//     });
//     setShowModal(true);
//   };

//   const handleEditProject = (sectionId, project) => {
//     setModalType('edit-project');
//     setSelectedSection(sectionId);
//     setSelectedProject(project.id);
//     setFormData({
//       project: project.project,
//       task: project.task,
//       startDate: project.startDate,
//       endDate: project.endDate,
//       remark: project.remark,
//       heading: ''
//     });
//     setShowModal(true);
//   };

//   const handleDeleteProject = (sectionId, projectId) => {
//     if (window.confirm('Are you sure you want to delete this project?')) {
//       setSectionsData(sectionsData.map(section => 
//         section.id === sectionId 
//           ? { ...section, items: section.items.filter(item => item.id !== projectId) }
//           : section
//       ));
//     }
//   };

//   const handleDeleteSection = (sectionId) => {
//     if (window.confirm('Are you sure you want to delete this entire section?')) {
//       setSectionsData(sectionsData.filter(section => section.id !== sectionId));
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (modalType === 'heading') {
//       const newSection = {
//         id: Date.now(),
//         type: 'heading',
//         heading: formData.heading,
//         items: []
//       };
//       setSectionsData([...sectionsData, newSection]);
//     } else if (modalType === 'edit-heading') {
//       setSectionsData(sectionsData.map(section => 
//         section.id === selectedSection 
//           ? { ...section, heading: formData.heading }
//           : section
//       ));
//     } else if (modalType === 'project') {
//       const newProject = {
//         id: Date.now(),
//         project: formData.project,
//         task: formData.task,
//         startDate: formData.startDate,
//         endDate: formData.endDate,
//         remark: formData.remark
//       };
//       setSectionsData(sectionsData.map(section => 
//         section.id === selectedSection 
//           ? { ...section, items: [...section.items, newProject] }
//           : section
//       ));
//     } else if (modalType === 'edit-project') {
//       setSectionsData(sectionsData.map(section => 
//         section.id === selectedSection 
//           ? { 
//               ...section, 
//               items: section.items.map(item => 
//                 item.id === selectedProject 
//                   ? {
//                       ...item,
//                       project: formData.project,
//                       task: formData.task,
//                       startDate: formData.startDate,
//                       endDate: formData.endDate,
//                       remark: formData.remark
//                     }
//                   : item
//               )
//             }
//           : section
//       ));
//     }
//     setShowModal(false);
//   };

//   const handleInputChange = (field, value) => {
//     setFormData({ ...formData, [field]: value });
//   };

//   return (
//     <div style={{ 
//       padding: '0', 
//       background: 'white', 
//       margin: '0',
//       width: '100%'
//     }}>

      
//       {/* Tasks Table - Matching Material React Table structure */}
//       <div style={{ padding: '0 16px', marginTop: '0px' }}>
//         <table style={{ 
//           width: '100%', 
//           borderCollapse: 'collapse', 
//           background: 'white',
//           tableLayout: 'fixed',
//           marginLeft: '0px',
//           marginRight: '0px'
//         }}>
//         <colgroup>
//           <col style={{ width: '180px' }} />
//           <col style={{ width: '220px' }} />
//           <col style={{ width: '120px' }} />
//           <col style={{ width: '120px' }} />
//           <col style={{ width: '130px' }} />
//           <col style={{ width: '150px' }} />
//         </colgroup>
//         <thead>
//           <tr style={{ background: 'white' }}>
//             <th style={{ 
//               padding: '16px', 
//               textAlign: 'left', 
//               fontWeight: '600', 
//               color: '#374151', 
//               borderBottom: '1px solid #e2e8f0',
//               fontSize: '14px',
//               lineHeight: '1.5'
//             }}>
//               Project
//             </th>
//             <th style={{ 
//               padding: '16px', 
//               textAlign: 'left', 
//               fontWeight: '600', 
//               color: '#374151', 
//               borderBottom: '1px solid #e2e8f0',
//               fontSize: '14px',
//               lineHeight: '1.5'
//             }}>
//               Task
//             </th>
//             <th style={{ 
//               padding: '16px', 
//               textAlign: 'left', 
//               fontWeight: '600', 
//               color: '#374151', 
//               borderBottom: '1px solid #e2e8f0',
//               fontSize: '14px',
//               lineHeight: '1.5'
//             }}>
//               Start Date
//             </th>
//             <th style={{ 
//               padding: '16px 24px', 
//               textAlign: 'left', 
//               fontWeight: '600', 
//               color: '#374151', 
//               borderBottom: '1px solid #e2e8f0',
//               fontSize: '14px',
//               lineHeight: '1.5'
//             }}>
//               End Date
//             </th>
//             <th style={{ 
//               padding: '16px', 
//               textAlign: 'left', 
//               fontWeight: '600', 
//               color: '#374151', 
//               borderBottom: '1px solid #e2e8f0',
//               fontSize: '14px',
//               lineHeight: '1.5'
//             }}>
//               Remark
//             </th>
//             <th style={{ 
//               padding: '16px', 
//               textAlign: 'right', 
//               fontWeight: '600', 
//               color: '#374151', 
//               borderBottom: '1px solid #e2e8f0',
//               fontSize: '14px',
//               lineHeight: '1.5'
//             }}>
//               Actions
//             </th>
//           </tr>
//         </thead>
//         <tbody>
//           {/* Add New Heading Row */}
//           <tr style={{ borderBottom: '1px solid #f1f5f9', background: 'white' }}>
//             <td colSpan="5" style={{ 
//               padding: '16px', 
//               color: '#374151',
//               fontSize: '14px',
//               lineHeight: '1.5',
//               fontWeight: '500'
//             }}>
//               Add New Heading
//             </td>
//             <td style={{ 
//               padding: '16px', 
//               textAlign: 'right'
//             }}>
//               <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
//                 <button
//                   onClick={handleAddHeading}
//                   style={{
//                     padding: '6px',
//                     background: 'transparent',
//                     color: 'black',
//                     border: 'none',
//                     borderRadius: '0px',
//                     cursor: 'pointer',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     boxShadow: 'none'
//                   }}
//                   title="Add New Heading"
//                 >
//                   <Plus size={14} />
//                 </button>
//               </div>
//             </td>
//           </tr>
          
//           {/* Sections with Headings and Projects */}
//           {sectionsData.map((section) => (
//             <React.Fragment key={section.id}>
//               {/* Section Heading Row */}
//               <tr style={{ borderBottom: '2px solid #e2e8f0', background: 'white' }}>
//                 <td colSpan="5" style={{ 
//                   padding: '16px', 
//                   color: '#1f2937',
//                   fontSize: '16px',
//                   lineHeight: '1.5',
//                   fontWeight: '700'
//                 }}>
//                   {section.heading}
//                 </td>
//                 <td style={{ 
//                   padding: '16px', 
//                   textAlign: 'right'
//                 }}>
//                   <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
//                     <button
//                       onClick={() => handleAddProject(section.id)}
//                       style={{
//                         padding: '6px',
//                         background: 'transparent',
//                         color: 'black',
//                         border: 'none',
//                         borderRadius: '0px',
//                         cursor: 'pointer',
//                         display: 'flex',
//                         alignItems: 'center',
//                         justifyContent: 'center',
//                         boxShadow: 'none'
//                       }}
//                       title="Add Project"
//                     >
//                       <Plus size={14} />
//                     </button>
//                     <button
//                       onClick={() => handleEditHeading(section)}
//                       style={{
//                         padding: '6px',
//                         background: 'transparent',
//                         color: 'black',
//                         border: 'none',
//                         borderRadius: '0px',
//                         cursor: 'pointer',
//                         display: 'flex',
//                         alignItems: 'center',
//                         justifyContent: 'center',
//                         boxShadow: 'none'
//                       }}
//                       title="Edit Heading"
//                     >
//                       <Edit size={14} />
//                     </button>
//                     <button
//                       onClick={() => handleDeleteSection(section.id)}
//                       style={{
//                         padding: '6px',
//                         background: 'transparent',
//                         color: 'black',
//                         border: 'none',
//                         borderRadius: '0px',
//                         cursor: 'pointer',
//                         display: 'flex',
//                         alignItems: 'center',
//                         justifyContent: 'center',
//                         boxShadow: 'none'
//                       }}
//                       title="Delete Section"
//                     >
//                       <Trash2 size={14} />
//                     </button>
//                   </div>
//                 </td>
//               </tr>
              
//               {/* Projects under this heading */}
//               {section.items.map((project) => (
//                 <tr key={project.id} style={{ borderBottom: '1px solid #f1f5f9', background: 'white' }}>
//                   <td style={{ 
//                     padding: '16px 16px 16px 32px', // Indent projects under heading
//                     color: '#374151', 
//                     fontWeight: '500',
//                     fontSize: '14px',
//                     lineHeight: '1.5',
//                     overflow: 'hidden',
//                     textOverflow: 'ellipsis',
//                     whiteSpace: 'nowrap'
//                   }}>
//                     • {project.project}
//                   </td>
//                   <td style={{ 
//                     padding: '16px', 
//                     color: '#374151',
//                     fontSize: '14px',
//                     lineHeight: '1.5',
//                     overflow: 'hidden',
//                     textOverflow: 'ellipsis',
//                     whiteSpace: 'nowrap'
//                   }}>
//                     {project.task}
//                   </td>
//                   <td style={{ 
//                     padding: '16px', 
//                     color: '#374151',
//                     fontSize: '14px',
//                     lineHeight: '1.5',
//                     overflow: 'hidden',
//                     textOverflow: 'ellipsis',
//                     whiteSpace: 'nowrap'
//                   }}>
//                     {project.startDate}
//                   </td>
//                   <td style={{ 
//                     padding: '16px', 
//                     color: '#374151',
//                     fontSize: '14px',
//                     lineHeight: '1.5',
//                     overflow: 'hidden',
//                     textOverflow: 'ellipsis',
//                     whiteSpace: 'nowrap'
//                   }}>
//                     {project.endDate}
//                   </td>
//                   <td style={{ 
//                     padding: '16px', 
//                     color: '#6b7280',
//                     fontSize: '14px',
//                     lineHeight: '1.5',
//                     overflow: 'hidden',
//                     textOverflow: 'ellipsis',
//                     whiteSpace: 'nowrap'
//                   }}>
//                     {project.remark}
//                   </td>
//                   <td style={{ 
//                     padding: '16px', 
//                     textAlign: 'right'
//                   }}>
//                     <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
//                       <button
//                         onClick={() => handleEditProject(section.id, project)}
//                         style={{
//                           padding: '6px',
//                           background: 'transparent',
//                           color: 'black',
//                           border: 'none',
//                           borderRadius: '0px',
//                           cursor: 'pointer',
//                           display: 'flex',
//                           alignItems: 'center',
//                           justifyContent: 'center',
//                           boxShadow: 'none'
//                         }}
//                         title="Edit Project"
//                       >
//                         <Edit size={14} />
//                       </button>
//                       <button
//                         onClick={() => handleDeleteProject(section.id, project.id)}
//                         style={{
//                           padding: '6px',
//                           background: 'transparent',
//                           color: 'black',
//                           border: 'none',
//                           borderRadius: '0px',
//                           cursor: 'pointer',
//                           display: 'flex',
//                           alignItems: 'center',
//                           justifyContent: 'center',
//                           boxShadow: 'none'
//                         }}
//                         title="Delete Project"
//                       >
//                         <Trash2 size={14} />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </React.Fragment>
//           ))}
//         </tbody>
//         </table>
//       </div>

//       {/* Modal for Add/Edit Task */}
//       {showModal && (
//         <div style={{
//           position: 'fixed',
//           top: 0,
//           left: 0,
//           right: 0,
//           bottom: 0,
//           backgroundColor: 'rgba(0, 0, 0, 0.5)',
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'center',
//           zIndex: 1000
//         }}>
//           <div style={{
//             background: 'white',
//             borderRadius: '8px',
//             padding: '24px',
//             width: '500px',
//             maxHeight: '80vh',
//             overflow: 'auto'
//           }}>
//             <h2 style={{ 
//               margin: '0 0 20px 0', 
//               color: '#374151',
//               fontSize: '18px',
//               fontWeight: '600'
//             }}>
//               {modalType === 'heading' ? 'Add New Heading' : 
//                modalType === 'edit-heading' ? 'Edit Heading' :
//                modalType === 'project' ? 'Add New Project' : 'Edit Project'}
//             </h2>
            
//             <form onSubmit={handleSubmit}>
//               {(modalType === 'heading' || modalType === 'edit-heading') ? (
//                 <div style={{ marginBottom: '20px' }}>
//                   <label style={{ 
//                     display: 'block', 
//                     marginBottom: '6px', 
//                     fontWeight: '500',
//                     color: '#374151'
//                   }}>
//                     Heading Name *
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.heading}
//                     onChange={(e) => handleInputChange('heading', e.target.value)}
//                     required
//                     placeholder="Enter heading name (e.g., Development Projects)"
//                     style={{
//                       width: '100%',
//                       padding: '8px 12px',
//                       border: '1px solid #d1d5db',
//                       borderRadius: '4px',
//                       fontSize: '14px'
//                     }}
//                   />
//                 </div>
//               ) : (
//                 <>
//                   <div style={{ marginBottom: '16px' }}>
//                     <label style={{ 
//                       display: 'block', 
//                       marginBottom: '6px', 
//                       fontWeight: '500',
//                       color: '#374151'
//                     }}>
//                       Project *
//                     </label>
//                     <input
//                       type="text"
//                       value={formData.project}
//                       onChange={(e) => handleInputChange('project', e.target.value)}
//                       required
//                       placeholder="Enter project name"
//                       style={{
//                         width: '100%',
//                         padding: '8px 12px',
//                         border: '1px solid #d1d5db',
//                         borderRadius: '4px',
//                         fontSize: '14px'
//                       }}
//                     />
//                   </div>

//                   <div style={{ marginBottom: '16px' }}>
//                     <label style={{ 
//                       display: 'block', 
//                       marginBottom: '6px', 
//                       fontWeight: '500',
//                       color: '#374151'
//                     }}>
//                       Task *
//                     </label>
//                     <input
//                       type="text"
//                       value={formData.task}
//                       onChange={(e) => handleInputChange('task', e.target.value)}
//                       required
//                       placeholder="Enter task description"
//                       style={{
//                         width: '100%',
//                         padding: '8px 12px',
//                         border: '1px solid #d1d5db',
//                         borderRadius: '4px',
//                         fontSize: '14px'
//                       }}
//                     />
//                   </div>

//                   <div style={{ marginBottom: '16px' }}>
//                     <label style={{ 
//                       display: 'block', 
//                       marginBottom: '6px', 
//                       fontWeight: '500',
//                       color: '#374151'
//                     }}>
//                       Start Date *
//                     </label>
//                     <input
//                       type="date"
//                       value={formData.startDate}
//                       onChange={(e) => handleInputChange('startDate', e.target.value)}
//                       required
//                       style={{
//                         width: '100%',
//                         padding: '8px 12px',
//                         border: '1px solid #d1d5db',
//                         borderRadius: '4px',
//                         fontSize: '14px'
//                       }}
//                     />
//                   </div>

//                   <div style={{ marginBottom: '16px' }}>
//                     <label style={{ 
//                       display: 'block', 
//                       marginBottom: '6px', 
//                       fontWeight: '500',
//                       color: '#374151'
//                     }}>
//                       End Date *
//                     </label>
//                     <input
//                       type="date"
//                       value={formData.endDate}
//                       onChange={(e) => handleInputChange('endDate', e.target.value)}
//                       required
//                       style={{
//                         width: '100%',
//                         padding: '8px 12px',
//                         border: '1px solid #d1d5db',
//                         borderRadius: '4px',
//                         fontSize: '14px'
//                       }}
//                     />
//                   </div>

//                   <div style={{ marginBottom: '16px' }}>
//                     <label style={{ 
//                       display: 'block', 
//                       marginBottom: '6px', 
//                       fontWeight: '500',
//                       color: '#374151'
//                     }}>
//                       Remark
//                     </label>
//                     <textarea
//                       value={formData.remark}
//                       onChange={(e) => handleInputChange('remark', e.target.value)}
//                       rows="3"
//                       placeholder="Enter any remarks or notes"
//                       style={{
//                         width: '100%',
//                         padding: '8px 12px',
//                         border: '1px solid #d1d5db',
//                         borderRadius: '4px',
//                         fontSize: '14px',
//                         resize: 'vertical'
//                       }}
//                     />
//                   </div>
//                 </>
//               )}

//               <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
//                 <button
//                   type="button"
//                   onClick={() => setShowModal(false)}
//                   style={{
//                     padding: '8px 16px',
//                     background: '#6b7280',
//                     color: 'white',
//                     border: 'none',
//                     borderRadius: '4px',
//                     cursor: 'pointer',
//                     fontSize: '14px',
//                     fontWeight: '500'
//                   }}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   style={{
//                     padding: '8px 16px',
//                     background: '#3b82f6',
//                     color: 'white',
//                     border: 'none',
//                     borderRadius: '4px',
//                     cursor: 'pointer',
//                     fontSize: '14px',
//                     fontWeight: '500'
//                   }}
//                 >
//                   {modalType === 'heading' ? 'Add Heading' : 
//                    modalType === 'edit-heading' ? 'Update Heading' :
//                    modalType === 'project' ? 'Add Project' : 'Update Project'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default EmployeeTable;
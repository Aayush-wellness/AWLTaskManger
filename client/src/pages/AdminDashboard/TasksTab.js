import HierarchicalTaskSystem from '../../components/HierarchicalTaskSystem';

const TasksTab = ({
  tasks,
  employees,
  departments,
  projects,
  lastUpdated,
  isRefreshing,
  onRefresh,
  onManualRefresh
}) => {
  return (
    <div className="tasks-tab-wrapper">
      <HierarchicalTaskSystem />
    </div>
  );
};

export default TasksTab;

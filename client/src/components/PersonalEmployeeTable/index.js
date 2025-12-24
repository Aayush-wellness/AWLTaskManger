import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import PersonalEmployeeTable from './PersonalEmployeeTable';

const queryClient = new QueryClient();

const PersonalEmployeeTableWithProvider = () => (
  <QueryClientProvider client={queryClient}>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <PersonalEmployeeTable />
    </LocalizationProvider>
  </QueryClientProvider>
);

export default PersonalEmployeeTableWithProvider;

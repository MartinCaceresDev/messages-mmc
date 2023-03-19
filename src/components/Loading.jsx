import CircularProgress from '@mui/material/CircularProgress';

export function Loading() {
  return (
    <div className='bg-gray-900 h-screen flex justify-center items-center'>
      <CircularProgress />
    </div>
  );
}

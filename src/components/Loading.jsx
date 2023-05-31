import CircularProgress from '@mui/material/CircularProgress';

export function Loading({ isPage }) {

  return (
    <div className={`flex justify-center items-center h-full w-full ${isPage && 'bg-slate-900 h-screen'}`} >
      <CircularProgress />
    </div>
  );
}

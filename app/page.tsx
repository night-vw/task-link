import React from 'react';
import dynamic from 'next/dynamic';

// ローディングコンポーネント
const Loading = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
  </div>
);

const TaskMap = () => {
  const Map = React.useMemo(
    () =>
      dynamic(() => import('@/components/Map'), {
        loading: Loading, // ここでローディングコンポーネントを指定
        ssr: false,
      }),
    []
  );

  return (
    <div className="text-2xl mt-16 md:mt-0">
      <Map />
    </div>
  );
};

export default TaskMap;

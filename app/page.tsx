import React from 'react';
import dynamic from 'next/dynamic';

// ローディングコンポーネント
const Loading = () => (
  <div className="flex flex-col justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
    <p className="mt-4 text-zinc-600">マップを読み込み中...</p>
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

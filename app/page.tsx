import React from "react";
import dynamic from "next/dynamic";
const TaskMap = async () => {
  const Map = React.useMemo(
    () =>
      dynamic(() => import("@/components/Map"), {
        loading: () => <p>A map is loading</p>,
        ssr: false,
      }),
    []
  );
  return (
    <div className="text-2xl mt-100 mt-16 md:mt-0">
      <Map />
    </div>
  )
}

export default TaskMap
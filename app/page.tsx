import React from "react";
import dynamic from "next/dynamic";
const TaskMap = async () => {
  const supabase = createServerComponentClient({ cookies }) ;
  const {data:user} = await supabase.auth.getSession();
  const session = user.session;
  console.log(session);

  return (
    <div className="text-2xl mt-100 mt-16 md:mt-0">
      <Map />
    </div>
  )
}

export default TaskMap

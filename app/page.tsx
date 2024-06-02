    
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from 'next/headers';

function TaskMap() {
  const supabase = createServerComponentClient({ cookies }) ;
  return (
    <div className="text-2xl mt-100 mt-16 md:mt-0">
      <p>TaskMap</p>
  </div>
  )
}

export default TaskMap

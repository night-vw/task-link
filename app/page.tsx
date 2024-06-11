import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from 'next/headers';

const TaskMap = async () => {
  const supabase = createServerComponentClient({ cookies }) ;
  const {data:user} = await supabase.auth.getSession();
  const session = user.session;
  //console.log(session);

  return (
    <div className="text-2xl mt-100 mt-16 md:mt-0">
      <p>{session ? "ログイン中" : "ログアウト中"} </p>
  </div>
  )
}

export default TaskMap

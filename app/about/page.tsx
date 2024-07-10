import { supabaseServer } from "@/utils/supabaseServer";

const TaskList = async () => {
  const supabase = supabaseServer();
  const {data:user} = await supabase.auth.getSession();
  const session = user.session;
  //console.log(session);
  return (
    <div className="text-2xl mt-100 mt-16 md:mt-0">
      <p>{session ? "ログイン中" : "ログアウト中"} </p>
  </div>
  )
}

export default TaskList
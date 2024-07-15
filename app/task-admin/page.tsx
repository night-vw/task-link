"use client";
import { useEffect, useState } from 'react';
import { Switch } from "@/components/ui/switch";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const supabase = createClientComponentClient();

// タスクの型定義
type Task = {
  id: number;
  name: string;
  priority: string;
  deadline: string | null;
  completed: boolean;
};

// ページネーション用のタスク数
const TASKS_PER_PAGE_DEFAULT = 9; // デフォルトの1ページに表示するタスク数

const TaskAdminPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [modalAction, setModalAction] = useState<"complete" | "delete">("complete");
  const [isLoading, setIsLoading] = useState(true); // ローディング状態を追加
  const [tasksPerPage, setTasksPerPage] = useState(TASKS_PER_PAGE_DEFAULT); // 1ページに表示するタスク数
  const [userId, setUserId] = useState<string | null>(null); // ユーザーID用の状態

  // SupabaseからユーザーIDを取得する関数
  const fetchUserId = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.error('Error fetching user ID:', error);
      return;
    }

    setUserId(user?.id || null);
  };

  // Supabaseからタスクを取得する関数
  const fetchTasks = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('map_task')
      .select('id, task_name, priority, deadline_date, task_completed')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching tasks:', error);
      return;
    }
  
    const priorityOrder: { [key: string]: number } = { '高': 3, '中': 2, '低': 1 };
    const fetchedTasks: Task[] = data.map((task: any) => ({
      id: task.id,
      name: task.task_name,
      priority: task.priority,
      deadline: task.deadline_date || 'なし',
      completed: task.task_completed,
    }));
  
    fetchedTasks.sort((a, b) => {
      return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    });
  
    setTasks(fetchedTasks);
    setIsLoading(false); // ローディング終了
  };
  
  useEffect(() => {
    fetchUserId().then(fetchTasks);
  
    // 画面の高さに応じてTASKS_PER_PAGEを設定する
    const updateTasksPerPage = () => {
      if(window.innerHeight < 700) {
        setTasksPerPage(6);          
      }
      else if (window.innerHeight <= 850) {
        setTasksPerPage(8);
      }else  {
        setTasksPerPage(9);
      }
    };
  
    updateTasksPerPage();
    window.addEventListener('resize', updateTasksPerPage);
  
    document.body.style.overflow = 'auto'; // ページのロード時にスクロールを有効にする
  
    return () => {
      window.removeEventListener('resize', updateTasksPerPage);
    };
  }, [userId]);
  

  // タスクの完了状態を切り替える関数
  const toggleTaskCompletion = async (taskId: number) => {
    const taskToComplete = tasks.find(task => task.id === taskId);
    if (taskToComplete && userId) {
      const { error } = await supabase
        .from('map_task')
        .update({ task_completed: true })
        .eq('id', taskId);
      
      if (error) {
        console.error('Error updating task:', error);
        return;
      }

      const { error: insertError } = await supabase
        .from('completed_tasks')
        .insert({ task_name: taskToComplete.name, user_id: userId });

      if (insertError) {
        console.error('Error inserting into completed_tasks:', insertError);
        return;
      }

      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, completed: true } : task
      ));

      toast.success('タスクを完了しました', {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        className: 'text-base font-black',
      });
    }
    setShowModal(false); // モーダルを閉じる
    setSelectedTaskId(null);
  };

  // タスクを削除する関数
  const deleteTask = async (taskId: number) => {
    const { error: deleteError1 } = await supabase
      .from('map_task')
      .delete()
      .eq('id', taskId)
      .eq('user_id', userId);
    
    const { error: deleteError2 } = await supabase
      .from('completed_tasks')
      .delete()
      .eq('task_name', tasks.find(task => task.id === taskId)?.name)
      .eq('user_id', userId);
    
    if (deleteError1 || deleteError2) {
      console.error('Error deleting task:', deleteError1 || deleteError2);
      return;
    }

    setTasks(tasks.filter(task => task.id !== taskId));
    setShowModal(false); // モーダルを閉じる
    setSelectedTaskId(null);
  };

  // タスク完了の確認ダイアログを表示する関数
  const confirmCompletion = (taskId: number) => {
    setSelectedTaskId(taskId);
    setModalAction("complete");
    setShowModal(true);
  };

  // タスク削除の確認ダイアログを表示する関数
  const confirmDeletion = (taskId: number) => {
    setSelectedTaskId(taskId);
    setModalAction("delete");
    setShowModal(true);
  };

  // 画面表示用のタスクリストを取得する関数
  const getCurrentTasks = (): Task[] => {
    const filteredTasks = tasks.filter(task => task.completed === isCompleted);
    const startIndex = (currentPage - 1) * tasksPerPage;
    return filteredTasks.slice(startIndex, startIndex + tasksPerPage);
  };

  // スイッチ切り替え時の処理
  const handleSwitchChange = (checked: boolean) => {
    setIsCompleted(checked);
    setCurrentPage(1); // Switchを切り替えたときにページをリセット
  };

  // 前のページに移動する処理
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // 次のページに移動する処理
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const totalPages = Math.max(1, Math.ceil(tasks.filter(task => task.completed === isCompleted).length / tasksPerPage));
  const currentTasks = getCurrentTasks();

  // 画面の横幅に応じてタスク名を省略する関数
  const truncateTaskName = (name: string): string => {
    const maxLength = window.innerWidth <= 400 ? 10 : 15;
    return name.length > maxLength ? `${name.substring(0, maxLength)}…` : name;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-2xl">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-zinc-600">タスク情報を取得中...</p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <main className="flex flex-col items-center justify-start w-full flex-1 px-4 sm:px-6 md:px-8 text-center mt-8">
        <h1 className="text-2xl sm:text-4xl md:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 mt-10">タスク管理</h1>
        <div className="flex flex-col items-center mb-4 sm:mb-6">
          <span className="mb-2 text-lg sm:text-2xl md:text-xl lg:text-2xl">{isCompleted ? '完了タスク' : '未完了タスク'}</span>
          <Switch checked={isCompleted} onCheckedChange={handleSwitchChange} />
        </div>
        <div className="overflow-x-auto w-full max-w-3xl">
          <table className="table-auto w-full">
            <thead>
              <tr>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-base md:text-base lg:text-xl font-bold">タスク名</th>
                {!(isCompleted) && <th className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-base md:text-base lg:text-xl font-bold">優先度</th>}
                {!(isCompleted) && <th className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-base md:text-base lg:text-xl font-bold">期限</th>}
                {!(isCompleted) && <th className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-base md:text-base lg:text-xl font-bold">完了ボタン</th>}
                {isCompleted && <th className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-base md:text-base lg:text-xl font-bold">タスク完了日付</th>}
                {isCompleted && <th className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-base md:text-base lg:text-xl font-bold">削除</th>}
              </tr>
            </thead>
            <tbody>
              {currentTasks.map((task: Task) => (
                <tr key={task.id}>
                  <td className="border px-2 sm:px-4 py-2 sm:py-3 text-sm sm:text-xl md:text-xl lg:text-2xl font-bold whitespace-nowrap">{truncateTaskName(task.name)}</td>
                  {!(task.completed) && <td className="border px-2 sm:px-4 py-2 sm:py-3 text-sm sm:text-xl md:text-xl lg:text-2xl font-bold whitespace-nowrap">{task.priority}</td>}
                  {!(task.completed) &&<td className="border px-2 sm:px-4 py-2 sm:py-3 text-sm sm:text-xl md:text-xl lg:text-2xl font-bold whitespace-nowrap">{task.deadline}</td>}
                      {task.completed ?
                       '' : 
                       (
                        <td className="border px-2 sm:px-4 py-2 sm:py-3">
                       <button
                      onClick={() => confirmCompletion(task.id)}
                      className="px-2 text-sm lg:text-lg sm:px-4 py-1 sm:py-2 md:px-3 md:py-1 lg:px-4 lg:py-2 bg-green-500 text-white rounded"
                    >完了</button>
                    </td>)}
                  {isCompleted && <td className="border px-2 sm:px-4 py-2 sm:py-3 text-sm sm:text-xl md:text-xl lg:text-2xl font-bold">{new Date().toLocaleDateString()}</td>}
                  {isCompleted && <td className="border px-2 sm:px-4 py-2 sm:py-3">
                    <button
                      onClick={() => confirmDeletion(task.id)}
                      className="px-2 sm:px-4 py-1 sm:py-2 md:px-3 md:py-1 lg:px-4 lg:py-2 bg-red-500 text-white rounded"
                    >
                      削除
                    </button>
                  </td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      {totalPages >= 1 && (
        <div className="relative flex items-center justify-center mb-8 mt-10">
          {currentPage > 1 && (
            <button
              className="absolute -left-20 px-4 py-2 bg-blue-500 text-white rounded"
              onClick={handlePrevPage}
            >
              ←
            </button>
          )}
          <span className="text-lg sm:text-xl md:text-lg lg:text-xl mx-4">
            {currentPage} / {totalPages}
          </span>
          {currentPage < totalPages && (
            <button
              className="absolute -right-20 px-4 py-2 bg-blue-500 text-white rounded"
              onClick={handleNextPage}
            >
              →
            </button>
          )}
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 md:pl-72">
          <div className="bg-white rounded-lg p-8 shadow-lg text-center">
            <h2 className="text-xl sm:text-2xl md:text-xl lg:text-2xl font-bold mb-4">
              {modalAction === "complete" ? "完了確認" : "削除確認"}
            </h2>
            <p className="text-lg sm:text-xl md:text-lg lg:text-xl mb-8">
              {modalAction === "complete" ? "このタスクを完了しますか？" : "このタスクを削除しますか？"}
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded"
              >
                閉じる
              </button>
              <button
                onClick={() => modalAction === "complete" ? toggleTaskCompletion(selectedTaskId!) : deleteTask(selectedTaskId!)}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                {modalAction === "complete" ? "完了" : "削除"}
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default TaskAdminPage;

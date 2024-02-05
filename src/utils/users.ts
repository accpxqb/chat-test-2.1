import { supabase } from '@utils/supabaseClient';

let lastSaveTimestamp = 0;
//保存用户chats到users ChatPanel
export const saveUserChats = async (chats, userid) => {
    const currentTimestamp = Date.now();

    // 检查距上一次保存是否已经过了 1秒
    if (currentTimestamp - lastSaveTimestamp >= 1000) {
        // 执行保存操作
        // ...
        if (!userid) {
            console.log('未提供用户信息，不执行插入操作');
            return;
        }
        let updateChats = JSON.parse(JSON.stringify(chats));
        updateChats.forEach(chat => {
            chat.messages = []
        });
        const { data, error } = await supabase
            .from('users')
            .update([
                {
                    ChatPanel: JSON.stringify(updateChats),
                },
            ])
            .match({ id: userid }); // Specify the condition to match the row(s) you want to update

        if (error) {
            console.error('Error updating user:', error.message);
        } else {
            console.log('user updated successfully:', data);
        }
        // 更新上一次保存的时间戳
        lastSaveTimestamp = currentTimestamp;
    } else {
        console.log("一秒内已经执行过 saveUserChats，跳过此次执行。");
    }


}
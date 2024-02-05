 import { supabase } from '@utils/supabaseClient';
 

//保存用户chats到users ChatPanel
export const saveUserChats = async (chats,userid) => {
    if (!userid) {
        console.log('未提供用户信息，不执行插入操作');
        return;
    }
    chats.forEach(chat => {
        chat.message=[]
    });
    const { data, error } = await supabase
        .from('users')
        .update([
            {
                ChatPanel: JSON.stringify(chats),
            },
        ])
        .match({ id: userid }); // Specify the condition to match the row(s) you want to update

    if (error) {
        console.error('Error updating user:', error.message);
    } else {
        console.log('user updated successfully:', data);
    }
}
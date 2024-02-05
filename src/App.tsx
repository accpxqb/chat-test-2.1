import React, { useEffect, useState } from 'react';
import useStore from '@store/store';
import i18n from './i18n';
import Chat from '@components/Chat';
import Menu from '@components/Menu';
import SignIn from './Signin'; // Adjust the path as necessary
import useInitialiseNewChat from '@hooks/useInitialiseNewChat';
import { ChatInterface } from '@type/chat'; // Adjust import paths as necessary
import { Theme } from '@type/theme';
import ApiPopup from '@components/ApiPopup';
import Toast from '@components/Toast';
import { supabase } from '@utils/supabaseClient'; // Adjust the import path as necessary
import sensitiveWords from '@utils/sensitive_words_lines.json';
 



interface User {
  id: string; // UUID from Supabase auth
  aud: string; // Audience from Supabase auth
  role?: string; // Role from Supabase auth, optional as it might not always be present
  email?: string; // User's email, optional as it might not always be present
  email_confirmed_at?: string; // Optional, might not always be present
  created_at?: string; // User creation time, optional
  last_sign_in_at?: string; // Last sign-in time, optional
  full_name?: string; // Optional, from your custom table
  avatar_url?: string; // Optional, from your custom table
  billing_address?: object; // JSONB, optional
  payment_method?: object; // JSONB, optional
  token_number?: number; // Optional, from your custom table
  consumed_token?: number; // Optional, from your custom table
  app_metadata?: { provider?: string; providers?: string[] }; // Metadata, optional
}
function App() {
  const { user, setUser, setTokenNumber, setConsumedToken } = useStore(state => ({
    user: state.user,
    setUser: state.setUser,
    setTokenNumber: state.setTokenNumber,
    setConsumedToken: state.setConsumedToken
  }));
  const [isLoading, setLoading] = useState(true); // New loading state

  const initialiseNewChat = useInitialiseNewChat();
  const setChats = useStore((state) => state.setChats);
  const setTheme = useStore((state) => state.setTheme);
  const setApiKey = useStore((state) => state.setApiKey);
  const setCurrentChatIndex = useStore((state) => state.setCurrentChatIndex);

  useEffect(() => {
    document.documentElement.lang = i18n.language;
    i18n.on('languageChanged', (lng) => {
      document.documentElement.lang = lng;
    });
  }, []);

  useEffect(() => {
    useStore.getState().setSensitiveWords(sensitiveWords);
  }, []);
  const fetchTokensFromSupabase = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('token_number, consumed_token')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setTokenNumber(data.token_number);
      setConsumedToken(data.consumed_token);
    } catch (error) {
      console.error('Error fetching total number from Supabase:', error);
    }
  };
  //获取用户信息
  const getUser = async (userId) => {
    console.log(userId)
    try {
      const { data, error } = await supabase
        .from('users')  // 替换为你的实际表名
        .select()
        .eq('id', userId)  // 根据 user_id 进行查询
      if (error) {
        throw error;
      }
      console.log('用户:', data);  
      selectHistoryList(userId,JSON.parse(data[0].ChatPanel) )
    } catch (error) {
      console.error('查询出错:', error);
    }
  }
  //加载历史记录  
  const selectHistoryList = async (userId,chats) => {
    console.log(userId)
    try {
      const { data, error } = await supabase
        .from('conversation_history')  // 替换为你的实际表名
        .select()
        .eq('user_id', userId)  // 根据 user_id 进行查询
      if (error) {
        throw error;
      }
      console.log('查询结果:', data);
      

      //根据session_id 分组
      const groupedData = data.reduce((groups, item) => {
        const group = groups.find(g => g.session_id === item.session_id);

        if (group) {
          group.items.push(item);
        } else {
          groups.push({ session_id: item.session_id, items: [item] });
        }

        return groups;
      }, []);
      console.log(groupedData)
      if(!chats){
          chats = useStore.getState().chats;
      }
      console.log(chats)
      if (chats && groupedData.length > 0) {
        groupedData.forEach(session => {
          if (chats[session.session_id]) {
            chats[session.session_id].messages = []
            session.items.forEach((msg: { role: any; content: any; }) => {
              // console.log(msg)
              chats[session.session_id].messages.push({ role: msg.role, content: msg.content })
            })
          }


        })
        setChats(chats);
      }


      console.log(chats)


    } catch (error) {
      console.error('查询出错:', error);
    }
  }


  useEffect(() => {
    if (user && !isLoading) {
      // legacy local storage
      const oldChats = localStorage.getItem('chats');
      console.log("oldChats", oldChats)
      getUser(user.id)


      const apiKey = localStorage.getItem('apiKey');
      const theme = localStorage.getItem('theme');

      if (apiKey) {
        setApiKey(apiKey);
        localStorage.removeItem('apiKey');
      }

      if (theme) {
        setTheme(theme as Theme);
        localStorage.removeItem('theme');
      }

      if (oldChats) {
        try {
          const chats: ChatInterface[] = JSON.parse(oldChats);
          if (chats.length > 0) {
            setChats(chats);
            setCurrentChatIndex(0);
          } else {
            initialiseNewChat();
          }
        } catch (e: unknown) {
          console.log(e);
          initialiseNewChat();
        }
        localStorage.removeItem('chats');
      } else {
        const chats = useStore.getState().chats;
        console.log(chats)
        console.log(useStore.getState())

        const currentChatIndex = useStore.getState().currentChatIndex;
        if (!chats || chats.length === 0) {
          initialiseNewChat();
        }
        if (
          chats &&
          !(currentChatIndex >= 0 && currentChatIndex < chats.length)
        ) {
          setCurrentChatIndex(0);
        }
      }
      fetchTokensFromSupabase(user.id);
    }
  }, [user, isLoading]);

  if (!user || isLoading) {
    return <SignIn onUserSignedIn={(signedInUser) => {
      // Ensure signedInUser has the correct structure or convert it to match User type
      // For example, if signedInUser is of a different type, map its properties to your User type
      const userToSet: User = {
        id: signedInUser.id,
        aud: signedInUser.aud,
        role: signedInUser.role || '', // Default value if role is undefined
        email: signedInUser.email || '', // Default value if email is undefined
        email_confirmed_at: signedInUser.email_confirmed_at || '',
        created_at: signedInUser.created_at || '',
        last_sign_in_at: signedInUser.last_sign_in_at || '',
        full_name: signedInUser.full_name || '', // Assuming these are directly on signedInUser
        avatar_url: signedInUser.avatar_url || '',
        billing_address: signedInUser.billing_address || {},
        payment_method: signedInUser.payment_method || {},
        token_number: signedInUser.token_number || 0,
        consumed_token: signedInUser.consumed_token || 0,
        app_metadata: signedInUser.app_metadata || { provider: '', providers: [] }
      };
      setUser(userToSet); // Set user in store with the right structure
      setLoading(false);
    }} />;
  }

  return (
    <div className='overflow-hidden w-full h-full relative'>
      <Menu />
      <Chat />
      <ApiPopup />
      <Toast />
    </div>
  );
}

export default App;

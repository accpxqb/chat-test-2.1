import React from 'react';
import useStore from '@store/store';
import { MessageInterface } from '@type/chat';
import { generateDefaultChat } from '@constants/chat';

const useInitialiseNewChat = () => {
  // console.log('useInitialiseNewChat')
  // console.log(useStore)
  const setChats = useStore((state) => state.setChats);
  const setCurrentChatIndex = useStore((state) => state.setCurrentChatIndex);

  const initialiseNewChat = () => {
    setChats([generateDefaultChat()]);
    setCurrentChatIndex(0);
  };

  return initialiseNewChat;
};

export default useInitialiseNewChat;

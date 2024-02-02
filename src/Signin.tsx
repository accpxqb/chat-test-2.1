// SignIn.tsx
import React, { useState } from 'react';
import { supabase } from '@utils/supabaseClient';
import { style } from 'typestyle';

// Define your User interface
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

// Updated styles using TypeStyle
const welcomeMessageClass = style({
  fontSize: '16px', // Adjust font size for readability
  lineHeight: '1.8', // Increase line height for better text flow
  color: '#555', // Maintain a comfortable reading color
  marginTop: '10px', // Adjust top margin
  marginBottom: '20px', // Adjust bottom margin
  maxWidth: '600px', // Maintain a readable text width
  textAlign: 'justify', // Justify the text for a clean look
  textIndent: '2em', // Indent the first line for a classic look
  padding: '0 10px', // Add some padding for space around the text
});
const containerClass = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  padding: '20px',
  backgroundColor: '#ffffff',
  boxSizing: 'border-box',
});

const headerClass = style({
  fontSize: '32px', // Larger font size for the header
  fontWeight: 'bold', // Make the header bold
  textAlign: 'center',
  color: '#333',
  marginBottom: '10px',
});

const formClass = style({
  display: 'flex',
  flexDirection: 'column',
  width: '300px',
  alignItems: 'center',
  boxShadow: '0px 0px 10px rgba(0,0,0,0.1)',
  padding: '20px',
  borderRadius: '8px',
  backgroundColor: '#f9f9f9',
  marginTop: '20px', // Add space between text and form
});

const inputClass = style({
  margin: '10px 0',
  padding: '10px',
  width: '100%',
  borderRadius: '5px',
  border: '1px solid #ddd',
});

const buttonClass = style({
  padding: '10px 20px',
  backgroundColor: '#4CAF50',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  marginTop: '20px',
  width: '100%',
  fontSize: '16px',
});
const signUpButtonClass = style({
  marginTop: '10px',
  textDecoration: 'underline',
  cursor: 'pointer',
  color: '#4CAF50',
  background: 'none',
  border: 'none',
  padding: 0,
  fontSize: '16px',
});
const errorClass = style({
  color: 'red',
  margin: '10px 0',
});

// SignIn component
interface SignInProps {
  onUserSignedIn: (user: User) => void;
}


function SignIn({ onUserSignedIn }: SignInProps) {
  // const [email, setEmail] = useState('platformaiyang@gmail.com');
  // const [password, setPassword] = useState('integrityyang123');
  const [email, setEmail] = useState('platformaiyang@gmail.com');
  const [password, setPassword] = useState('integrityyang123');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    console.log("handleSubmit")
    e.preventDefault();
    setErrorMessage('');

    try {

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw new Error(error.message);

      if (data.user) {
        onUserSignedIn(data.user as User);
        // insertUser(data.user)
      }
    } catch (error) {
      const err = error as Error;
      console.error('Sign-in error:', err);
      setErrorMessage(err.message);
    }
  };
  const handleSignUp = async () => {
    // window.location.href = 'https://price.tokenai.chat/';


    // // 使用 remove 方法删除用户数据
    // const { data, error } = await supabase_auth
    //   .from('users')
    //   .delete()
    //   .eq('email', "user@example.com");

    // if (error) {
    //   console.error('Error deleting user:', error.message);
    // } else {
    //   console.log('User deleted successfully:', data);
    // }
     

    // 新增用户 
    console.log("handleSignUp")
 
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });
    if (error) {
      console.error('Error creating user:', error.message);
    } else {
      console.log('User created successfully:', data);
      // insertUser(data.user)
    }
    
  };

  // 新增数据
  const insertUser = async (user?:any) => {
    try {
      console.log(user)  
      if (!user) {
        console.log('未提供用户信息，不执行插入操作');
        return;
      }
      const {app_metadata,...nuser} = user
      const isDuplicate = await checkDuplicate(user.email??"");
      if (isDuplicate) {
        console.log('邮箱已存在');
        return;
      }


      // 数据不重复，执行插入操作
      const dataToInsert = {
        id: user.id,
        aud: user.aud,
        role:user.role,
        email:user.email,
        email_confirmed_at:user.email_confirmed_at,
        last_sign_in_at:user.last_sign_in_at,
        full_name:user.full_name,
        avatar_url:user.avatar_url,
        billing_address:user.billing_address,
        payment_method:user.payment_method,
        token_number:user.token_number??1000,
        consumed_token:user.consumed_token,
      };

      const { data, error } = await supabase
        .from('users')
        .upsert([dataToInsert])
        .select();

      if (error) {
        throw error;
      }

      console.log('插入成功:', data);
    } catch (error) {
      console.error('插入失败:', error);
    }
  };
  // 插入数据之前检查字段是否重复
  const checkDuplicate = async (email:string) => {
    try {
      // 查询是否已存在相同的值
      const { data, error } = await supabase
        .from('users')
        .select()
        .eq('email', email);

      if (error) {
        throw error;
      }

      // 如果已存在相同的值，返回 true；否则返回 false
      return data.length > 0;
    } catch (error) {
      console.error('查询失败:', error);
      return false; // 查询失败时，默认为不重复
    }
  };
  return (
    <div className={containerClass}>
      <h1 className={headerClass}>TokenAI, 您的智能伙伴</h1>
      <p className={welcomeMessageClass}>
        在这里，您可以体验ChatGPT的卓越能力，让它助您一臂之力，无论是在学习、工作，还是日常生活中，我们的平台不仅提供通用的智能对话体验，更专注于打造个性化服务。您将有机会接触多种专业领域的GPT应用，包括：
        <br /><br />
        私人医生GPT：为您提供健康咨询和生活方式指导。<br />
        个人人生导师GPT：助您规划人生，提供职业发展和个人成长的建议。<br />
        个人伴侣GPT（女朋友/男朋友）：为您带来贴心的日常陪伴和情感交流。<br />
        职业规划GPT：协助您制定职业目标，规划未来职业道路。<br />
        家教GPT：帮助您（或您的孩子）更好的学习。<br />
        <br />
        在套肯人工智能平台，我们致力于将最新的技术和人工智能的温度结合起来，为您打造一个更智能、更贴心的数字生活伙伴。让我们一起探索人工智能的无限可能！
      </p>
      {errorMessage && <p className={errorClass}>{errorMessage}</p>}
      <form onSubmit={handleSubmit} className={formClass}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={inputClass}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className={inputClass} 
        />
        <button type="submit" className={buttonClass}>登录</button>
        <button type="button" onClick={handleSignUp} className={signUpButtonClass}>注册</button>
      </form>
    </div>
  );
}

export default SignIn;

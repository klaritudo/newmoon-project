import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const GameStatusContext = createContext();

export const useGameStatus = () => {
  const context = useContext(GameStatusContext);
  if (!context) {
    throw new Error('useGameStatus must be used within GameStatusProvider');
  }
  return context;
};

export const GameStatusProvider = ({ children }) => {
  const [gamingUsers, setGamingUsers] = useState(new Set());
  const { socket } = useSelector((state) => state.socket);
  const currentUser = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (!socket) return;

    // 게임 시작/종료 이벤트 수신
    const handleGameStart = (data) => {
      console.log('[GameStatus] 게임 시작:', data);
      setGamingUsers(prev => new Set([...prev, data.userId]));
    };

    const handleGameEnd = (data) => {
      console.log('[GameStatus] 게임 종료:', data);
      setGamingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    };

    socket.on('game:started', handleGameStart);
    socket.on('game:ended', handleGameEnd);

    return () => {
      socket.off('game:started', handleGameStart);
      socket.off('game:ended', handleGameEnd);
    };
  }, [socket]);

  // 현재 게임 중인 사용자가 있는지 확인
  const hasGamingUsers = gamingUsers.size > 0;
  
  // 특정 사용자가 게임 중인지 확인
  const isUserGaming = (userId) => gamingUsers.has(userId);
  
  // 현재 로그인한 사용자가 게임 중인지 (유저 페이지용)
  const isCurrentUserGaming = currentUser && gamingUsers.has(currentUser.id);

  const value = {
    gamingUsers,
    hasGamingUsers,
    isUserGaming,
    isCurrentUserGaming,
  };

  return (
    <GameStatusContext.Provider value={value}>
      {children}
    </GameStatusContext.Provider>
  );
};
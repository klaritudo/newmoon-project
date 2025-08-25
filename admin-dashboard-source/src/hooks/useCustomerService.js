import { useState, useEffect, useCallback } from 'react';
import customerServiceApi from '../services/customerServiceApi';
import socketService from '../services/socketService';
import { useNotification } from '../contexts/NotificationContext';

/**
 * 고객센터 관련 데이터 및 WebSocket 이벤트 관리 훅
 */
// 상태 매핑 함수들 - 새로운 enum 값 지원
const getStatusLabel = (status) => {
  const statusMap = {
    // 새로운 enum 값들
    'requesting': '문의 중',
    'waiting': '대기',
    'replied': '답변완료',
    'no_reply': '미답변완료',
    // 호환성을 위한 이전 값들
    'unread': '미읽음',
    'read': '읽음',
    'pending': '대기',
    'completed': '완료'
  };
  return statusMap[status] || status;
};

const getStatusColor = (status) => {
  const colorMap = {
    // 새로운 enum 값들
    'requesting': 'warning',
    'waiting': 'info',
    'replied': 'success',
    'no_reply': 'default',
    // 호환성을 위한 이전 값들
    'unread': 'error',
    'read': 'primary',
    'pending': 'warning',
    'completed': 'info'
  };
  return colorMap[status] || 'default';
};

const getInquiryTypeLabel = (type) => {
  const typeMap = {
    'general': '일반문의',
    'deposit': '입금문의',
    'withdrawal': '출금문의',
    'game': '게임문의',
    'account': '계정문의',
    'other': '기타문의'
  };
  return typeMap[type] || type;
};

// API 응답 데이터를 프론트엔드 형식으로 변환
const transformMessageData = (message) => {
  // API에서 snake_case로 반환되는 필드들 처리
  const senderType = message.sender_type || message.senderType;
  const inquiryType = message.inquiry_type || message.inquiryType;
  const senderUsername = message.sender_username || message.senderUsername;
  const senderName = message.sender_name || message.senderName;
  const createdAt = message.created_at || message.createdAt;
  const readAt = message.read_at || message.readAt;
  const parentAgents = message.parent_agents || message.parentAgents || [];
  
  return {
    // 기본 정보
    id: message.id,
    title: message.title,
    content: message.content,
    
    // 발신자 정보
    username: senderUsername,
    nickname: senderName,
    memberInfo: senderUsername && senderName ? `${senderUsername}\n${senderName}` : senderUsername || senderName || '',
    
    // 상위 에이전트 정보
    superAgent: parentAgents,
    
    // 회원 타입 객체 구조로 변환
    memberType: {
      id: senderType,
      label: senderType === 'user' ? '회원' : '에이전트',
      color: senderType === 'user' ? 'primary' : 'secondary',
      variant: 'outlined'
    },
    
    // 문의 유형 객체 구조로 변환
    inquiryType: {
      id: inquiryType,
      label: getInquiryTypeLabel(inquiryType),
      color: 'info',
      variant: 'outlined'
    },
    
    // 상태 객체 구조로 변환 - API에서 이미 처리된 status 사용
    status: {
      id: message.status,
      label: getStatusLabel(message.status),
      color: getStatusColor(message.status),
      variant: 'outlined'
    },
    
    // 원본 status 값도 보존 (액션 버튼 표시 조건용)
    statusValue: message.status,
    actualStatus: message.actual_status || message.status,
    
    // 날짜 형식 통일 - 날짜와 시간 모두 포함
    createdDate: createdAt || null,
    readDate: readAt || null,
    createdAt: createdAt,
    updatedAt: message.updated_at || message.updatedAt,
    
    // 읽음 상태
    isRead: message.is_read || message.isRead || false,
    // 답변 수
    replyCount: message.reply_count || message.replyCount || 0,
    // 첨부파일 수
    attachmentCount: message.attachment_count || message.attachmentCount || 0
  };
};

// 보낸 문의용 transform 함수
const transformSentMessageData = (message) => {
  // API에서 반환되는 필드들
  const recipientType = message.recipient_type || message.recipientType;
  const recipientUsername = message.recipientUsername || message.recipient_username;
  const totalRecipients = message.totalRecipients || message.total_recipients || 1;
  const readRecipients = message.readRecipients || message.read_recipients || 0;
  const createdAt = message.createdAt || message.created_at;
  
  // 수신자 정보 구성
  let recipientCountData = {
    firstRecipient: recipientUsername || recipientType || 'unknown',
    total: totalRecipients,
    read: readRecipients
  };
  
  // 읽음 상태 구성
  const unreadRecipients = totalRecipients - readRecipients;
  
  let readStatusData = {
    read: readRecipients,
    unread: unreadRecipients,
    total: totalRecipients,
    hasUnread: unreadRecipients > 0
  };
  
  // 상태에 따른 추가 정보
  if (message.status === 'sending') {
    readStatusData.sending = true;
  } else if (message.status === 'failed') {
    readStatusData.failed = true;
  }
  
  return {
    id: message.id,
    // 제목과 내용
    subject: message.title,
    content: message.content,
    
    // 수신자 유형
    recipientType: recipientType,
    recipientTypeInfo: {
      value: recipientType,
      label: recipientType === 'all' ? '전체' : 
             recipientType === 'agent' ? '에이전트' :
             recipientType === 'line' ? '라인' :
             recipientType === 'member' ? '회원' : '선택',
      color: recipientType === 'all' ? 'primary' :
             recipientType === 'agent' ? 'secondary' :
             recipientType === 'line' ? 'info' :
             recipientType === 'member' ? 'success' : 'warning',
      variant: 'outlined'
    },
    
    // 상태
    status: message.status,
    statusInfo: {
      value: message.status,
      label: message.status === 'completed' ? '발송완료' :
             message.status === 'sending' ? '발송중' : '발송실패',
      color: message.status === 'completed' ? 'success' :
             message.status === 'sending' ? 'warning' : 'error',
      variant: 'outlined'
    },
    
    // 수신자 수와 읽음 상태
    recipientCount: recipientCountData,
    readStatus: readStatusData,
    hasUnreadMessages: unreadRecipients > 0 && message.status === 'completed',
    
    // 날짜 형식 통일
    sentDate: createdAt ? new Date(createdAt).toLocaleString('ko-KR') : null,
    
    // 발송자 정보
    senderInfo: {
      name: '관리자',
      role: 'admin'
    }
  };
};

const useCustomerService = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unreadStats, setUnreadStats] = useState({
    userInquiries: 0,
    agentInquiries: 0,
    total: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 1000,
    total: 0,
    totalPages: 0
  });

  const { showNotification, handleRefresh } = useNotification();

  // 알림음 재생 함수
  const playNotificationSound = useCallback(() => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBCyAyfPincMQDfa///+fWfipbODzTfipgm8EB076qHKnWfipbODzTfipgm8EB076qHKnWfipbODzTfipgm8EB076qHKnWfipbODzTfipgm8EB076qHKnWfipbODzTfipgm8EB076qHKnWfipbODzTfipgm8EB076qHKnWfipbODzTfipgm8EB076qHKnWfipbODzTfipgm8EB076qHKnWfipbODzTfipgm8EB076qHKnWfipbODzTfipgm8EB076qHKnWfipbODzTfipgm8EB076qHKnWfipbODzTfipgm8EB076qHKnWfipbODzTfipgm8EB076qHKnWfipbODzTfipgm8EB076qHKnWfipbODzTfipgm8EB076qHKnWfipbODzTfipgm8EB076qHKnWfipbODzTfipgm8EB076qHKnWfipbODzTfipgm8EB076qHKnWfipbODzTfipgm8EB076qHKnWfipbODzTfipgm8EB076qHKnWfipbODzTfipgm8EB076qHKn');
    audio.volume = 0.5;
    audio.play().catch(e => console.log('알림음 재생 실패:', e));
  }, []);

  // 문의 목록 조회
  const fetchMessages = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await customerServiceApi.getMessages({
        page: pagination.page,
        limit: pagination.limit,
        ...params
      });

      console.log('API 응답:', response);

      if (response.success) {
        console.log('문의 데이터 원본:', response.data);
        
        // 데이터 변환 적용
        const transformedMessages = Array.isArray(response.data) 
          ? response.data.map(transformMessageData)
          : [];
        
        console.log('변환된 문의 데이터:', transformedMessages);
        setMessages(transformedMessages);
        
        // 페이지네이션 정보 업데이트
        if (response.pagination) {
          setPagination(prev => ({
            ...prev,
            total: response.pagination.total,
            totalPages: response.pagination.totalPages
          }));
        }
      } else {
        console.error('API 응답 실패:', response);
        setMessages([]);
      }
    } catch (err) {
      console.error('API 에러:', err);
      setError(err.message || '문의 목록을 불러오는데 실패했습니다.');
      showNotification('문의 목록을 불러오는데 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, showNotification]);

  // 읽지 않은 문의 수 조회
  const fetchUnreadStats = useCallback(async () => {
    try {
      const response = await customerServiceApi.getUnreadStats();
      if (response.success) {
        setUnreadStats(response.data);
      }
    } catch (err) {
      console.error('읽지 않은 문의 수 조회 실패:', err);
    }
  }, []);

  // 문의 상태 변경
  const updateMessageStatus = useCallback(async (id, status) => {
    console.log('[useCustomerService] updateMessageStatus 호출:', { id, status });
    try {
      const response = await customerServiceApi.updateMessageStatus(id, status);
      console.log('[useCustomerService] API 응답:', response);
      
      if (response.success) {
        // 서버에서 반환된 메시지를 transformMessageData로 변환
        if (response.data) {
          const transformedMessage = transformMessageData(response.data);
          console.log('[useCustomerService] 변환된 메시지:', transformedMessage);
          
          // 로컬 상태 업데이트 - 변환된 메시지로 완전히 교체
          setMessages(prev => {
            const updated = prev.map(msg => 
              msg.id === id ? transformedMessage : msg
            );
            console.log('[useCustomerService] 업데이트된 messages 배열:', updated);
            return updated;
          });
          
          // allMessages도 업데이트 (전체문의 탭에서 사용)
          setAllMessages(prev => {
            const updated = prev.map(msg => 
              msg.id === id ? transformedMessage : msg
            );
            console.log('[useCustomerService] 업데이트된 allMessages 배열:', updated);
            return updated;
          });
        } else {
          console.log('[useCustomerService] 서버가 데이터를 반환하지 않음, 전체 새로고침');
          // 서버가 데이터를 반환하지 않는 경우 전체 목록 새로고침
          await fetchMessages();
        }
        
        showNotification('상태가 변경되었습니다.', 'success');
        
        // 읽지 않은 수 다시 조회
        if (status === 'read' || status === 'completed') {
          fetchUnreadStats();
        }
      }
    } catch (err) {
      console.error('[useCustomerService] updateMessageStatus 에러:', err);
      showNotification('상태 변경에 실패했습니다.', 'error');
      // 에러 발생 시 에러를 다시 throw하여 호출한 컴포넌트에서 처리할 수 있도록 함
      throw err;
    }
  }, [showNotification, fetchUnreadStats, fetchMessages]);

  // 문의 삭제
  const deleteMessage = useCallback(async (id) => {
    try {
      const response = await customerServiceApi.deleteMessage(id);
      if (response.success) {
        // 로컬 상태에서 제거
        setMessages(prev => prev.filter(msg => msg.id !== id));
        
        // allMessages에서도 제거 (전체문의 탭에서 사용)
        setAllMessages(prev => prev.filter(msg => msg.id !== id));
        
        showNotification('문의가 삭제되었습니다.', 'success');
        
        // fetchMessages() 호출 제거 - 로컬 상태 업데이트만으로 충분
      }
    } catch (err) {
      showNotification('문의 삭제에 실패했습니다.', 'error');
      throw err; // 에러를 throw하여 호출한 컴포넌트에서 처리 가능
    }
  }, [showNotification]);

  // WebSocket 이벤트 핸들러
  const handleNewCustomerInquiry = useCallback((data) => {
    console.log('새 고객 문의:', data);
    
    // 알림음 재생
    playNotificationSound();
    
    // 알림 표시
    showNotification(`새 문의: ${data.title}`, 'info');
    
    // 목록 새로고침
    fetchMessages();
    
    // 읽지 않은 수 업데이트
    fetchUnreadStats();
  }, [playNotificationSound, showNotification, fetchMessages, fetchUnreadStats]);

  // WebSocket 연결 및 이벤트 리스너 설정
  useEffect(() => {
    const setupSocket = async () => {
      const socket = await socketService.connect();
      if (socket) {
        // 새 문의 이벤트 리스너 - NotificationPanel과 동일한 이벤트명 사용
        socketService.on('customer:service:new', handleNewCustomerInquiry);
        
        // 상태 변경 이벤트 리스너 추가
        socketService.on('customer:service:status:changed', (data) => {
          console.log('[WebSocket] 고객센터 상태 변경:', data);
          fetchMessages(); // 메시지 목록 새로고침
        });
      }
    };

    setupSocket();

    // 클린업
    return () => {
      socketService.off('customer:service:new', handleNewCustomerInquiry);
      socketService.off('customer:service:status:changed');
    };
  }, [handleNewCustomerInquiry]);

  // 초기 데이터 로드 - 별도 useEffect로 분리
  useEffect(() => {
    fetchMessages();
    fetchUnreadStats();
  }, [fetchMessages, fetchUnreadStats]);

  // 페이지 변경
  const changePage = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  // 페이지당 항목 수 변경
  const changeLimit = useCallback((newLimit) => {
    setPagination(prev => ({ ...prev, page: 1, limit: newLimit }));
  }, []);

  // 보낸 문의 목록 조회
  const [sentMessages, setSentMessages] = useState([]);
  const [sentLoading, setSentLoading] = useState(false);
  
  const fetchSentMessages = useCallback(async (params = {}) => {
    setSentLoading(true);
    
    try {
      const response = await customerServiceApi.getSentMessages({
        page: pagination.page,
        limit: pagination.limit,
        ...params
      });

      if (response.success) {
        const transformedSentMessages = Array.isArray(response.data) 
          ? response.data.map(transformSentMessageData)
          : [];
        setSentMessages(transformedSentMessages);
      }
    } catch (err) {
      console.error('보낸 문의 조회 실패:', err);
      setSentMessages([]);
    } finally {
      setSentLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  // 문의 보내기
  const sendMessage = useCallback(async (messageData) => {
    try {
      const response = await customerServiceApi.sendMessage(messageData);
      if (response.success) {
        showNotification('문의가 전송되었습니다.', 'success');
        // 보낸 문의 목록 새로고침
        fetchSentMessages();
        return { success: true };
      }
      return { success: false, error: response.message };
    } catch (err) {
      showNotification('문의 전송에 실패했습니다.', 'error');
      return { success: false, error: err.message };
    }
  }, [showNotification, fetchSentMessages]);

  // 문의 답변하기
  const replyToMessage = useCallback(async (replyData) => {
    try {
      const { messageId, content } = replyData;
      const response = await customerServiceApi.replyToMessage(messageId, { content });
      if (response.success) {
        showNotification('답변이 등록되었습니다.', 'success');
        // 메시지 목록 새로고침
        fetchMessages();
        fetchSentMessages(); // 보낸문의도 새로고침
        return { success: true };
      }
      return { success: false, error: response.message };
    } catch (err) {
      showNotification('답변 등록에 실패했습니다.', 'error');
      return { success: false, error: err.message };
    }
  }, [showNotification, fetchMessages, fetchSentMessages]);

  // 전체 문의 목록 조회 (받은문의 + 보낸문의 통합)
  const [allMessages, setAllMessages] = useState([]);
  const [allLoading, setAllLoading] = useState(false);
  
  const fetchAllMessages = useCallback(async (params = {}) => {
    setAllLoading(true);
    
    try {
      const response = await customerServiceApi.getAllMessages({
        page: pagination.page,
        limit: pagination.limit,
        ...params
      });

      if (response.success) {
        // 통합 데이터 변환
        const transformedMessages = Array.isArray(response.data) 
          ? response.data.map(msg => {
              const baseTransformed = transformMessageData(msg);
              
              // direction 필드 추가
              baseTransformed.direction = msg.direction;
              baseTransformed.directionInfo = {
                value: msg.direction,
                label: msg.direction === 'sent' ? '보낸' : '받은',
                color: msg.direction === 'sent' ? 'primary' : 'secondary',
                variant: 'outlined'
              };
              
              // 관련 회원 정보 추가
              if (msg.direction === 'sent') {
                baseTransformed.recipientUsername = msg.related_username;
                baseTransformed.recipientNickname = msg.related_nickname;
              }
              
              return baseTransformed;
            })
          : [];
        
        setAllMessages(transformedMessages);
        
        if (response.pagination) {
          setPagination(prev => ({
            ...prev,
            total: response.pagination.total,
            totalPages: response.pagination.totalPages
          }));
        }
      }
    } catch (err) {
      console.error('전체 문의 조회 실패:', err);
      setAllMessages([]);
      showNotification('전체 문의 목록을 불러오는데 실패했습니다.', 'error');
    } finally {
      setAllLoading(false);
    }
  }, [pagination.page, pagination.limit, showNotification]);

  // 보낸 문의 재발송
  const resendMessage = useCallback(async (id) => {
    try {
      const response = await customerServiceApi.resendMessage(id);
      if (response.success) {
        showNotification('문의가 재발송되었습니다.', 'success');
        // 보낸 문의 목록 새로고침
        fetchSentMessages();
        return { success: true };
      }
      return { success: false, error: response.message };
    } catch (err) {
      showNotification('문의 재발송에 실패했습니다.', 'error');
      return { success: false, error: err.message };
    }
  }, [showNotification, fetchSentMessages]);

  // 보낸 문의 취소
  const cancelMessage = useCallback(async (id) => {
    try {
      const response = await customerServiceApi.cancelMessage(id);
      if (response.success) {
        showNotification('문의가 취소되었습니다.', 'success');
        // 보낸 문의 목록 새로고침
        fetchSentMessages();
        return { success: true };
      }
      return { success: false, error: response.message };
    } catch (err) {
      showNotification('문의 취소에 실패했습니다.', 'error');
      return { success: false, error: err.message };
    }
  }, [showNotification, fetchSentMessages]);

  return {
    messages,
    sentMessages,
    allMessages,
    loading,
    sentLoading,
    allLoading,
    error,
    unreadStats,
    pagination,
    fetchMessages,
    fetchSentMessages,
    fetchAllMessages,
    fetchUnreadStats,
    updateMessageStatus,
    deleteMessage,
    sendMessage,
    replyToMessage,
    resendMessage,
    cancelMessage,
    changePage,
    changeLimit,
    refreshData: () => {
      fetchMessages();
      fetchSentMessages();
      fetchUnreadStats();
    }
  };
};

export default useCustomerService;
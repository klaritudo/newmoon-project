import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  Collapse, 
  Box, 
  Paper, 
  Typography,
  TextField,
  CircularProgress,
  Alert
} from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import { usePermission } from '../../hooks/usePermission';
import apiService from '../../services/api';
import DepositSection from './DepositSection';
import WithdrawalSection from './WithdrawalSection';

/**
 * 에이전트 요청 패널 컴포넌트
 * 하위 관리자가 상위 관리자에게 요청을 보낼 수 있는 버튼들
 */
const AgentRequestPanel = () => {
  const { canUseButton } = usePermission();
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const [isCompact, setIsCompact] = useState(window.innerWidth <= 800);
  
  // 확장 상태 관리
  const [expandedSection, setExpandedSection] = useState(null); // 'deposit' | 'withdrawal' | null
  
  // 1단계, 2단계가 아닌 경우에만 요청 버튼 표시
  const showRequestButtons = user && user.agent_level_id !== 1 && user.agent_level_id !== 2;

  // 화면 크기 변경 감지
  React.useEffect(() => {
    const handleResize = () => {
      setIsCompact(window.innerWidth <= 800);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 요청 버튼 클릭 핸들러
  const handleRequest = async (requestType) => {
    try {
      const response = await apiService.agentRequests.create({
        request_type: requestType,
        message: `${requestType} 요청합니다.`,
        details: {
          requested_at: new Date().toISOString()
        }
      });
      
      if (response.data.success) {
        // TODO: 성공 메시지 표시
        console.log(`${requestType} 요청이 성공적으로 전송되었습니다.`);
        
        // 에이전트문의 카운트 자동으로 WebSocket을 통해 업데이트됨
      } else {
        console.error('요청 실패:', response.data.error);
      }
    } catch (error) {
      console.error('요청 전송 중 오류:', error);
    }
  };

  // 입금신청 버튼 클릭 핸들러
  const handleDepositClick = () => {
    setExpandedSection(expandedSection === 'deposit' ? null : 'deposit');
  };

  // 출금신청 버튼 클릭 핸들러
  const handleWithdrawalClick = () => {
    setExpandedSection(expandedSection === 'withdrawal' ? null : 'withdrawal');
  };

  // 버튼을 표시하지 않는 경우 null 반환
  if (!showRequestButtons) {
    return null;
  }

  return (
    <div
      className="agent-request-panel"
      style={{
        width: '100%',
        backgroundColor: '#ffffff', // 배경색을 흰색으로 변경하여 더 잘 보이도록
        padding: '12px 16px',
        borderBottom: '1px solid #e9ecef',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '8px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          maxWidth: '1200px',
          margin: '0 auto'
        }}
      >
        
        {canUseButton('입금신청') && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<AttachMoneyIcon />}
            onClick={handleDepositClick}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontSize: isCompact ? '11px' : '12px',
              padding: isCompact ? '4px 8px' : '6px 12px',
              borderColor: '#E5E7EB',
              color: '#6B7280',
              backgroundColor: '#ffffff',
              '&:hover': {
                borderColor: '#1BC5BD',
                backgroundColor: '#C9F7F5',
                color: '#1BC5BD'
              }
            }}
          >
            입금신청
          </Button>
        )}
        
        {canUseButton('출금신청') && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<MoneyOffIcon />}
            onClick={handleWithdrawalClick}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontSize: isCompact ? '11px' : '12px',
              padding: isCompact ? '4px 8px' : '6px 12px',
              borderColor: '#E5E7EB',
              color: '#6B7280',
              backgroundColor: '#ffffff',
              '&:hover': {
                borderColor: '#F64E60',
                backgroundColor: '#FFE2E5',
                color: '#F64E60'
              }
            }}
          >
            출금신청
          </Button>
        )}
        
        {canUseButton('문의하기') && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<HelpOutlineIcon />}
            onClick={() => {
              // 고객센터 페이지의 문의하기 탭으로 이동
              navigate('/customer-service/messages', { state: { activeTab: 3 } });
            }}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontSize: isCompact ? '11px' : '12px',
              padding: isCompact ? '4px 8px' : '6px 12px',
              borderColor: '#E5E7EB',
              color: '#6B7280',
              backgroundColor: '#ffffff',
              '&:hover': {
                borderColor: '#FFA800',
                backgroundColor: '#FFF4DE',
                color: '#FFA800'
              }
            }}
          >
            문의하기
          </Button>
        )}
      </div>
      
      {/* 입금신청 확장 섹션 */}
      <Collapse in={expandedSection === 'deposit'} timeout="auto" unmountOnExit>
        <Box sx={{ p: 2, borderTop: '1px solid #e9ecef' }}>
          <DepositSection 
            user={user} 
            onClose={() => setExpandedSection(null)}
          />
        </Box>
      </Collapse>
      
      {/* 출금신청 확장 섹션 */}
      <Collapse in={expandedSection === 'withdrawal'} timeout="auto" unmountOnExit>
        <Box sx={{ p: 2, borderTop: '1px solid #e9ecef' }}>
          <WithdrawalSection 
            user={user} 
            onClose={() => setExpandedSection(null)}
          />
        </Box>
      </Collapse>
    </div>
  );
};

export default AgentRequestPanel;
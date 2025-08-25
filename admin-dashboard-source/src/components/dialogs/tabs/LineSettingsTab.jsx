import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Button,
  Alert,
  Chip,
  Stack,
  CircularProgress 
} from '@mui/material';
import { Settings, AccountTree, Warning } from '@mui/icons-material';
import apiService from '../../../services/api';
import useDynamicTypes from '../../../hooks/useDynamicTypes';

const LineSettingsTab = ({ member, onSave }) => {
  const [parentAgents, setParentAgents] = useState([]);
  const [selectedParentId, setSelectedParentId] = useState(member?.parent_id || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const { types, getTypeInfo } = useDynamicTypes();

  // 가능한 상위 에이전트 목록 조회
  useEffect(() => {
    loadParentAgents();
  }, [member]);

  const loadParentAgents = async () => {
    if (!member) return;
    
    try {
      setLoading(true);
      // 현재 회원의 하위 회원 ID 목록 조회
      const childrenResponse = await apiService.members.getChildren(member.id);
      const childrenIds = childrenResponse.data?.data?.map(child => child.id) || [];
      
      // 전체 회원 목록 조회
      const response = await apiService.members.getAll();
      const allMembers = response.data?.data || [];
      
      // 현재 회원과 하위 회원들을 제외한 회원 필터링
      const excludeIds = [member.id, ...childrenIds];
      
      // 같은 레벨의 다른 회원들만 선택 가능 (소속 변경만 가능, 레벨 변경 불가)
      const availableParents = allMembers.filter(m => 
        !excludeIds.includes(m.id) && 
        m.agent_level_id === member.agent_level_id - 1 // 정확히 한 단계 위 레벨만
      );
      
      setParentAgents(availableParents);
      setSelectedParentId(member.parent_id || '');
    } catch (err) {
      console.error('상위 에이전트 조회 실패:', err);
      setError('상위 에이전트 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleParentChange = (event) => {
    setSelectedParentId(event.target.value);
    setError(null);
    setSuccess(false);
  };

  const handleSave = async () => {
    if (!selectedParentId || selectedParentId === member.parent_id) {
      setError('변경할 상위 에이전트를 선택해주세요.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // 회원의 상위 에이전트 변경
      await apiService.members.update(member.id, {
        parent_id: selectedParentId
      });
      
      setSuccess(true);
      
      // 상위 컴포넌트에 변경사항 전달
      if (onSave) {
        onSave({
          ...member,
          parent_id: selectedParentId
        });
      }
      
      // 3초 후 성공 메시지 숨기기
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (err) {
      console.error('상위 에이전트 변경 실패:', err);
      setError('상위 에이전트 변경에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 현재 상위 에이전트 정보
  const currentParent = parentAgents.find(p => p.id === member?.parent_id);
  
  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Settings />
        <Typography variant="h6">라인설정</Typography>
      </Box>
      
      {/* 현재 계층 정보 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>현재 소속 정보</Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            현재 단계
          </Typography>
          <Chip 
            label={member?.type?.label || '미지정'}
            size="small"
            sx={{
              backgroundColor: member?.type?.backgroundColor || '#e0e0e0',
              borderColor: member?.type?.borderColor || '#757575',
              border: '1px solid'
            }}
          />
        </Box>
        
        {currentParent && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              현재 상위 에이전트
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip 
                label={currentParent.type?.label || '미지정'}
                size="small"
                sx={{
                  backgroundColor: currentParent.type?.backgroundColor || '#e0e0e0',
                  borderColor: currentParent.type?.borderColor || '#757575',
                  border: '1px solid'
                }}
              />
              <Typography variant="body2">
                {currentParent.username}
                {currentParent.nickname && ` (${currentParent.nickname})`}
              </Typography>
            </Stack>
          </Box>
        )}
      </Paper>

      {/* 상위 에이전트 변경 */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <AccountTree />
          <Typography variant="subtitle2">상위 에이전트 변경</Typography>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            상위 에이전트가 성공적으로 변경되었습니다.
          </Alert>
        )}
        
        <Alert severity="warning" icon={<Warning />} sx={{ mb: 2 }}>
          주의: 소속 변경은 같은 레벨 내에서만 가능합니다.
          정확히 한 단계 위 레벨의 에이전트만 선택할 수 있습니다.
          레벨을 변경하려면 관리자에게 문의하세요.
        </Alert>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>새로운 상위 에이전트</InputLabel>
              <Select
                value={selectedParentId}
                onChange={handleParentChange}
                label="새로운 상위 에이전트"
                disabled={parentAgents.length === 0}
              >
                <MenuItem value="">
                  <em>선택하세요</em>
                </MenuItem>
                {parentAgents.map((agent) => (
                  <MenuItem key={agent.id} value={agent.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        label={agent.type?.label || '미지정'}
                        size="small"
                        sx={{
                          backgroundColor: agent.type?.backgroundColor || '#e0e0e0',
                          borderColor: agent.type?.borderColor || '#757575',
                          border: '1px solid',
                          height: '20px'
                        }}
                      />
                      <Typography>
                        {agent.username}
                        {agent.nickname && ` (${agent.nickname})`}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {parentAgents.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                변경 가능한 상위 에이전트가 없습니다.
              </Typography>
            )}
            
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={loading || !selectedParentId || selectedParentId === member?.parent_id}
              fullWidth
            >
              변경사항 저장
            </Button>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default LineSettingsTab; 
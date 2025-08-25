import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  Chip,
  Grid,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  CircularProgress,
  Alert
} from '@mui/material';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import {
  ExpandMore,
  ChevronRight,
  Person,
  AccountTree,
  TrendingUp,
  AttachMoney,
  Group
} from '@mui/icons-material';
import useDynamicTypes from '../../../hooks/useDynamicTypes';
import apiService from '../../../services/api';

const TreeViewTab = ({ selectedAgent, formatCurrency }) => {
  const { types, getTypeById } = useDynamicTypes();
  const [selectedNode, setSelectedNode] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState([]);
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 실제 회원 데이터 가져오기
  const loadMemberHierarchy = async () => {
    console.log('loadMemberHierarchy called with selectedAgent:', selectedAgent);
    console.log('selectedAgent type:', typeof selectedAgent);
    console.log('selectedAgent keys:', selectedAgent ? Object.keys(selectedAgent) : 'null');
    
    if (!selectedAgent?.id) {
      console.log('No selectedAgent.id found');
      console.log('selectedAgent structure:', JSON.stringify(selectedAgent, null, 2));
      setError('회원 정보가 올바르지 않습니다.');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // 현재 회원의 하위 회원들 가져오기
      console.log('Calling getChildren API with ID:', selectedAgent.id);
      const childrenResponse = await apiService.members.getChildren(selectedAgent.id);
      console.log('Children response:', childrenResponse);
      const children = childrenResponse.data?.data || childrenResponse.data || [];
      
      // 트리 데이터 구성
      const createNode = (member) => {
        // API에서 받은 agent_level 정보 사용
        const typeInfo = {
          name: member.agent_level_name || '',
          label: member.agent_level_label || '',
          backgroundColor: member.agent_level_bg_color || member.backgroundColor || '#f5f5f5',
          borderColor: member.agent_level_border_color || member.borderColor || '#666'
        };
        
        return {
          id: String(member.id), // Convert to string for TreeItem
          name: member.username,
          nickname: member.nickname,
          level: member.agent_level_id,
          typeInfo,
          stats: {
            totalMembers: member.total_members || member.totalMembers || 0,
            activeMembers: member.active_members || member.activeMembers || 0,
            totalDeposit: member.total_deposit || member.totalDeposit || member.deposit || 0,
            totalWithdraw: member.total_withdraw || member.totalWithdraw || member.withdrawal || 0,
            profit: member.profit || member.profitLoss?.total || 0,
            commission: member.commission || member.rollingAmount || 0,
            balance: member.balance || 0,
            holding_money: member.holding_money || member.gameMoney || 0
          },
          childrenCount: 0, // 자식 수를 별도로 추적
          children: []
        };
      };
      
      // 현재 회원을 루트로 하는 트리 구성
      const rootNode = createNode(selectedAgent);
      
      // 하위 회원들 추가 (재귀적으로 각 자식의 자식들도 가져와야 함)
      const loadChildrenRecursively = async (parentNode, parentMember) => {
        try {
          const childResponse = await apiService.members.getChildren(parentMember.id);
          const childrenData = childResponse.data?.data || childResponse.data || [];
          
          for (const child of childrenData) {
            const childNode = createNode(child);
            parentNode.children.push(childNode);
            
            // 재귀적으로 손자 회원들도 로드
            await loadChildrenRecursively(childNode, child);
          }
        } catch (err) {
          console.log(`Failed to load children for member ${parentMember.id}:`, err);
        }
      };
      
      // 직계 자식들 로드
      rootNode.children = children.map(child => createNode(child));
      rootNode.childrenCount = children.length;
      
      // 각 자식의 하위 회원들도 재귀적으로 로드
      for (let i = 0; i < rootNode.children.length; i++) {
        const childNode = rootNode.children[i];
        const childMember = children[i];
        await loadChildrenRecursively(childNode, childMember);
      }
      
      // 전체 하위 회원 수 계산 함수
      const calculateTotalMembers = (node) => {
        let total = node.children.length;
        for (const child of node.children) {
          total += calculateTotalMembers(child);
        }
        node.stats.totalMembers = total;
        node.childrenCount = node.children.length;
        return total;
      };
      
      // 루트부터 전체 회원 수 계산
      calculateTotalMembers(rootNode);
      
      console.log('Tree data created:', rootNode);
      console.log('Direct children count:', rootNode.children.length);
      
      setTreeData(rootNode);
      // 루트 노드만 기본으로 확장
      setExpandedNodes([rootNode.id]);
      
    } catch (err) {
      console.error('Failed to load member hierarchy:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        config: err.config,
        requestURL: err.config?.url,
        errorResponse: err.response?.data?.error
      });
      
      // 구체적인 에러 메시지 설정
      if (err.response?.status === 404) {
        setError('회원의 하위 조직 정보를 찾을 수 없습니다.');
      } else if (err.response?.status === 401) {
        setError('권한이 없습니다. 다시 로그인해주세요.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('네트워크 연결 오류가 발생했습니다.');
      } else {
        setError('회원 계층 정보를 불러오는데 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (types && Object.keys(types).length > 0 && selectedAgent) {
      loadMemberHierarchy();
    }
  }, [selectedAgent, types]);

  const handleNodeToggle = (event, nodeIds) => {
    setExpandedNodes(nodeIds);
  };

  const handleNodeSelect = (event, nodeId) => {
    const findNode = (node, id) => {
      if (node.id === id) return node;
      for (const child of node.children) {
        const found = findNode(child, id);
        if (found) return found;
      }
      return null;
    };

    if (treeData && nodeId) {
      const selectedId = Array.isArray(nodeId) ? nodeId[0] : nodeId;
      const node = findNode(treeData, selectedId);
      setSelectedNode(node);
    }
  };

  const renderTreeNode = (node) => {
    const typeInfo = node.typeInfo || { label: '일반', color: '#666', backgroundColor: '#f5f5f5', borderColor: '#ccc' };
    
    return (
      <TreeItem
        key={node.id}
        itemId={node.id}
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
            <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.75rem' }}>
              {node.name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {node.name}
              </Typography>
              {node.nickname && (
                <Typography variant="caption" color="text.secondary">
                  ({node.nickname})
                </Typography>
              )}
            </Box>
            <Chip
              label={typeInfo.name || typeInfo.label || '일반'}
              size="small"
              sx={{
                backgroundColor: `${typeInfo.backgroundColor || typeInfo.bgColor || '#f5f5f5'} !important`,
                color: `${typeInfo.borderColor || typeInfo.color || '#666'} !important`,
                border: `1px solid ${typeInfo.borderColor || typeInfo.color || '#666'} !important`,
                fontSize: '0.7rem',
                height: 20,
                mr: 1,
                fontWeight: 400,
                '& .MuiChip-label': {
                  color: `${typeInfo.borderColor || typeInfo.color || '#666'} !important`
                }
              }}
            />
            <Typography variant="caption" color="text.secondary">
              (하위: {node.stats.totalMembers}명)
            </Typography>
          </Box>
        }
      >
        {node.children.map(child => renderTreeNode(child))}
      </TreeItem>
    );
  };

  const renderNodeDetails = (node) => {
    if (!node) return null;

    const typeInfo = node.typeInfo || { label: '일반', color: '#666', backgroundColor: '#f5f5f5', borderColor: '#ccc' };

    return (
      <Card elevation={2}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ width: 40, height: 40, mr: 2 }}>
              {node.name.charAt(0)}
            </Avatar>
            <Box>
              <Box>
                <Typography variant="h6">{node.name}</Typography>
                {node.nickname && (
                  <Typography variant="body2" color="text.secondary">
                    {node.nickname}
                  </Typography>
                )}
              </Box>
              <Chip
                label={typeInfo.name || typeInfo.label || '일반'}
                size="small"
                sx={{
                  backgroundColor: `${typeInfo.backgroundColor || typeInfo.bgColor || '#f5f5f5'} !important`,
                  color: `${typeInfo.borderColor || typeInfo.color || '#666'} !important`,
                  border: `1px solid ${typeInfo.borderColor || typeInfo.color || '#666'} !important`,
                  fontSize: '0.8rem',
                  fontWeight: 400,
                  '& .MuiChip-label': {
                    color: `${typeInfo.borderColor || typeInfo.color || '#666'} !important`
                  }
                }}
              />
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Group fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="하위 회원수"
                    secondary={`${node.stats.totalMembers}명`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Person fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="직계 자식수"
                    secondary={`${node.childrenCount || node.children.length}명`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <AccountTree fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="하위 조직"
                    secondary={`${node.children.length}개`}
                  />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} sm={6}>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <TrendingUp fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="총 입금액"
                    secondary={formatCurrency ? `${formatCurrency(node.stats.totalDeposit)}원` : `${node.stats.totalDeposit}원`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <TrendingUp fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="총 출금액"
                    secondary={formatCurrency ? `${formatCurrency(node.stats.totalWithdraw)}원` : `${node.stats.totalWithdraw}원`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <AttachMoney fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="수익"
                    secondary={
                      <Typography
                        variant="body2"
                        color={node.stats.profit >= 0 ? 'success.main' : 'error.main'}
                      >
                        {formatCurrency ? `${formatCurrency(Math.abs(node.stats.profit))}원` : `${Math.abs(node.stats.profit)}원`}
                        {node.stats.profit >= 0 ? ' 수익' : ' 손실'}
                      </Typography>
                    }
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              커미션: {formatCurrency ? `${formatCurrency(node.stats.commission)}원` : `${node.stats.commission}원`}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }
  
  if (!treeData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">회원 계층 정보를 불러오는 중입니다...</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>조직 구조</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 2, height: 600, overflow: 'auto' }}>
            <Typography variant="subtitle1" gutterBottom>
              조직 트리
            </Typography>
            <SimpleTreeView
              slots={{
                collapseIcon: ExpandMore,
                expandIcon: ChevronRight,
              }}
              expandedItems={expandedNodes}
              selectedItems={selectedNode?.id ? [selectedNode.id] : []}
              onExpandedItemsChange={handleNodeToggle}
              onSelectedItemsChange={handleNodeSelect}
              sx={{
                flexGrow: 1,
                maxWidth: '100%',
                overflowY: 'auto',
              }}
            >
              {renderTreeNode(treeData)}
            </SimpleTreeView>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 2, height: 600, overflow: 'auto' }}>
            <Typography variant="subtitle1" gutterBottom>
              선택된 에이전트 정보
            </Typography>
            {selectedNode ? (
              renderNodeDetails(selectedNode)
            ) : (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '80%',
                color: 'text.secondary'
              }}>
                <Typography>
                  트리에서 에이전트를 선택하세요
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TreeViewTab; 
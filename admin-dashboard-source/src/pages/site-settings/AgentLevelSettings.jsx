import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Chip,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ColorLens as ColorLensIcon
} from '@mui/icons-material';
import { HexColorPicker } from 'react-colorful';
import '../../styles/agentLevelSettings.css';

// 액션과 선택자 가져오기
import { 
  fetchAgentLevels, 
  createAgentLevel, 
  updateAgentLevel, 
  deleteAgentLevel,
  selectAllLevels,
  selectLevelStatus,
  selectLevelError,
  setLevels
} from '../../features/agentLevels/agentLevelsSlice';

// 권한 관련 액션과 선택자 가져오기
import { 
  fetchRoles,
  selectAllRoles 
} from '../../features/permissions/permissionsSlice';

// React Query 훅 가져오기
import { 
  useAgentLevels, 
  useCreateAgentLevel, 
  useUpdateAgentLevel, 
  useDeleteAgentLevel,
  useDeleteMultipleAgentLevels,
  sortLevelsByLevelAndCreatedAt
} from '../../features/agentLevels/useAgentLevels';

// 탭 패널 컴포넌트
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`agent-level-tabpanel-${index}`}
      aria-labelledby={`agent-level-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3, overflow: 'visible' }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// 기본 단계 데이터
const defaultLevels = [
  { id: 1, name: '슈퍼', level: 1, permission: '슈퍼관리자', createdAt: '2023-01-01', backgroundColor: '#e8f5e9', borderColor: '#2e7d32' },
  { id: 2, name: '본사', level: 2, permission: '관리자', createdAt: '2023-01-01', backgroundColor: '#e3f2fd', borderColor: '#1565c0' },
  { id: 3, name: '부본사', level: 3, permission: '관리자', createdAt: '2023-01-01', backgroundColor: '#f1f8e9', borderColor: '#558b2f' },
  { id: 4, name: '마스터총판', level: 4, permission: '에이전트', createdAt: '2023-01-01', backgroundColor: '#e8f5e9', borderColor: '#2e7d32' },
  { id: 5, name: '총판', level: 5, permission: '에이전트', createdAt: '2023-01-01', backgroundColor: '#e3f2fd', borderColor: '#1565c0' },
  { id: 6, name: '매장', level: 6, permission: '에이전트', createdAt: '2023-01-01', backgroundColor: '#fff3e0', borderColor: '#e65100' },
  { id: 7, name: '회원Lv1', level: 7, permission: '회원', createdAt: '2023-01-01', backgroundColor: '#f3e5f5', borderColor: '#7b1fa2' },
  { id: 8, name: '회원Lv2', level: 8, permission: '회원', createdAt: '2023-01-01', backgroundColor: '#e8eaf6', borderColor: '#303f9f' },
  { id: 9, name: '회원Lv3', level: 9, permission: '회원', createdAt: '2023-01-01', backgroundColor: '#e0f7fa', borderColor: '#00838f' },
  { id: 10, name: '회원Lv4', level: 10, permission: '회원', createdAt: '2023-01-01', backgroundColor: '#fce4ec', borderColor: '#c2185b' },
  { id: 11, name: '회원Lv5', level: 11, permission: '회원', createdAt: '2023-01-01', backgroundColor: '#fff8e1', borderColor: '#ff8f00' },
];

// 색상 옵션을 카테고리별로 그룹화
const colorCategories = [
  {
    name: '기본 색상',
    colors: [
      { name: '초록색', backgroundColor: '#e8f5e9', borderColor: '#2e7d32' },
      { name: '파란색', backgroundColor: '#e3f2fd', borderColor: '#1565c0' },
      { name: '빨간색', backgroundColor: '#ffebee', borderColor: '#c62828' },
      { name: '주황색', backgroundColor: '#fff3e0', borderColor: '#e65100' },
      { name: '보라색', backgroundColor: '#f3e5f5', borderColor: '#7b1fa2' },
      { name: '노란색', backgroundColor: '#fff8e1', borderColor: '#ff8f00' },
      { name: '회색', backgroundColor: '#f5f5f5', borderColor: '#424242' },
      { name: '남색', backgroundColor: '#e8eaf6', borderColor: '#303f9f' },
      { name: '청록색', backgroundColor: '#e0f7fa', borderColor: '#00838f' },
      { name: '자주색', backgroundColor: '#e1bee7', borderColor: '#6a1b9a' },
      { name: '연두색', backgroundColor: '#f1f8e9', borderColor: '#558b2f' },
      { name: '하늘색', backgroundColor: '#e1f5fe', borderColor: '#0277bd' },
      { name: '분홍색', backgroundColor: '#fce4ec', borderColor: '#c2185b' },
      { name: '갈색', backgroundColor: '#efebe9', borderColor: '#4e342e' },
      { name: '민트색', backgroundColor: '#e0f2f1', borderColor: '#00695c' },
      { name: '라벤더', backgroundColor: '#ede7f6', borderColor: '#4527a0' },
      { name: '코랄', backgroundColor: '#ffccbc', borderColor: '#e64a19' },
      { name: '올리브', backgroundColor: '#f0f4c3', borderColor: '#9e9d24' },
      { name: '청남색', backgroundColor: '#bbdefb', borderColor: '#1976d2' },
      { name: '라임색', backgroundColor: '#dcedc8', borderColor: '#7cb342' }
    ]
  }
];

// 모든 색상을 하나의 배열로 변환 (기존 코드와의 호환성 유지)
const colorOptions = colorCategories.flatMap(category => category.colors);

// 기본 권한 데이터
const defaultPermissions = [
  { id: 1, name: '슈퍼관리자' },
  { id: 2, name: '관리자' },
  { id: 3, name: '에이전트' },
  { id: 4, name: '회원' },
];

const AgentLevelSettings = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux 상태 가져오기
  const levels = useSelector(selectAllLevels);
  const status = useSelector(selectLevelStatus);
  const error = useSelector(selectLevelError);
  const roles = useSelector(selectAllRoles);
  
  // React Query 훅 사용
  const { data: levelsData, isLoading: isLoadingLevels } = useAgentLevels();
  const createLevelMutation = useCreateAgentLevel();
  const updateLevelMutation = useUpdateAgentLevel();
  const deleteLevelMutation = useDeleteAgentLevel();
  const deleteMultipleLevelsMutation = useDeleteMultipleAgentLevels();
  
  // React Query 데이터가 변경될 때 Redux 상태 업데이트
  useEffect(() => {
    if (levelsData) {
      dispatch(setLevels(levelsData));
    }
  }, [levelsData, dispatch]);
  
  // 상태 관리
  const [tabValue, setTabValue] = useState(0);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [multiDeleteConfirmOpen, setMultiDeleteConfirmOpen] = useState(false);
  const [replacementLevelId, setReplacementLevelId] = useState('');
  const [currentLevel, setCurrentLevel] = useState({
    name: '',
    level: '',
    permission: '',
    backgroundColor: '#e8f5e9',
    borderColor: '#2e7d32'
  });
  const [permissions, setPermissions] = useState(defaultPermissions);
  const [colorSearchText, setColorSearchText] = useState('');
  
  // 색상 선택기 상태
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);
  const [customBackgroundColor, setCustomBackgroundColor] = useState('#e8f5e9');

  // 서버에서 데이터 로드
  useEffect(() => {
    dispatch(fetchAgentLevels());
    dispatch(fetchRoles());
  }, [dispatch]);

  // 역할 데이터가 변경될 때 권한 목록 업데이트
  useEffect(() => {
    if (roles && roles.length > 0) {
      const permissionsFromRoles = roles.map(role => ({
        id: role.id,
        name: role.name
      }));
      setPermissions(permissionsFromRoles);
    }
  }, [roles]);

  // currentLevel이 변경될 때 커스텀 색상 상태 업데이트
  useEffect(() => {
    setCustomBackgroundColor(currentLevel.backgroundColor);
  }, [currentLevel.backgroundColor]);

  // 탭 변경 핸들러
  const handleTabChange = (event, newValue) => {
    if (newValue === 1) {
      // 권한설정 탭으로 이동
      navigate('/site-settings/permissions');
    } else {
      setTabValue(newValue);
    }
  };

  // 체크박스 핸들러
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedLevels(levels.map(level => level.id));
    } else {
      setSelectedLevels([]);
    }
  };

  const handleSelectOne = (event, id) => {
    const selectedIndex = selectedLevels.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...selectedLevels, id];
    } else {
      newSelected = selectedLevels.filter(item => item !== id);
    }

    setSelectedLevels(newSelected);
  };

  // 다이얼로그 핸들러
  const handleOpenDialog = (level = null) => {
    if (level) {
      setCurrentLevel({ 
        ...level, 
        backgroundColor: level.backgroundColor || '#e8f5e9',
        borderColor: level.borderColor || '#2e7d32'
      });
      setCustomBackgroundColor(level.backgroundColor || '#e8f5e9');
      setEditMode(true);
    } else {
      setCurrentLevel({
        name: '',
        level: levels.length > 0 ? Math.max(...levels.map(l => l.level)) + 1 : 1,
        permission: '',
        backgroundColor: '#e8f5e9',
        borderColor: '#2e7d32'
      });
      setCustomBackgroundColor('#e8f5e9');
      setEditMode(false);
    }
    setShowBackgroundPicker(false);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setShowBackgroundPicker(false);
  };

  // 입력 필드 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentLevel(prev => ({ ...prev, [name]: value }));
  };

  // 색상 선택 핸들러
  const handleColorSelect = (backgroundColor, borderColor) => {
    setCurrentLevel(prev => ({
      ...prev,
      backgroundColor,
      borderColor
    }));
    setCustomBackgroundColor(backgroundColor);
  };

  // 커스텀 배경색 선택 핸들러
  const handleCustomBackgroundColorChange = (color) => {
    setCustomBackgroundColor(color);
    
    // 배경색에 맞는 테두리색 자동 생성 (더 어두운 색상)
    const borderColor = generateBorderColor(color);
    
    setCurrentLevel(prev => ({
      ...prev,
      backgroundColor: color,
      borderColor: borderColor
    }));
  };
  
  // 배경색에서 테두리색 자동 생성 함수
  const generateBorderColor = (backgroundColor) => {
    // HEX 색상을 RGB로 변환
    const r = parseInt(backgroundColor.slice(1, 3), 16);
    const g = parseInt(backgroundColor.slice(3, 5), 16);
    const b = parseInt(backgroundColor.slice(5, 7), 16);
    
    // 더 어두운 색상 생성 (약 30% 어둡게)
    const darkerR = Math.max(0, Math.floor(r * 0.7));
    const darkerG = Math.max(0, Math.floor(g * 0.7));
    const darkerB = Math.max(0, Math.floor(b * 0.7));
    
    // RGB를 HEX로 변환
    return `#${darkerR.toString(16).padStart(2, '0')}${darkerG.toString(16).padStart(2, '0')}${darkerB.toString(16).padStart(2, '0')}`;
  };
  
  // 배경색에 따라 텍스트 색상 결정 (밝은 배경 -> 어두운 텍스트, 어두운 배경 -> 밝은 텍스트)
  const getTextColor = (backgroundColor) => {
    // HEX 색상을 RGB로 변환
    const r = parseInt(backgroundColor.slice(1, 3), 16);
    const g = parseInt(backgroundColor.slice(3, 5), 16);
    const b = parseInt(backgroundColor.slice(5, 7), 16);
    
    // 색상의 밝기 계산 (YIQ 공식 사용)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    // 밝기가 128보다 크면 어두운 텍스트, 작으면 밝은 텍스트
    // 기본 색상과 같은 수준의 밝기에는 배경색보다 더 짙은 색상 사용
    if (brightness > 200) {
      // 매우 밝은 배경색인 경우 더 짙은 색상 사용
      return generateDarkerColor(backgroundColor, 0.6);
    } else if (brightness > 128) {
      // 중간 밝기의 배경색인 경우 배경색보다 더 짙은 색상 사용
      return generateDarkerColor(backgroundColor, 0.4);
    } else {
      // 어두운 배경색인 경우 흰색 사용
      return '#ffffff';
    }
  };
  
  // 더 짙은 색상 생성 함수
  const generateDarkerColor = (backgroundColor, factor) => {
    // HEX 색상을 RGB로 변환
    const r = parseInt(backgroundColor.slice(1, 3), 16);
    const g = parseInt(backgroundColor.slice(3, 5), 16);
    const b = parseInt(backgroundColor.slice(5, 7), 16);
    
    // 더 어두운 색상 생성
    const darkerR = Math.max(0, Math.floor(r * factor));
    const darkerG = Math.max(0, Math.floor(g * factor));
    const darkerB = Math.max(0, Math.floor(b * factor));
    
    // RGB를 HEX로 변환
    return `#${darkerR.toString(16).padStart(2, '0')}${darkerG.toString(16).padStart(2, '0')}${darkerB.toString(16).padStart(2, '0')}`;
  };

  // 색상 선택기 토글 핸들러
  const toggleBackgroundPicker = () => {
    setShowBackgroundPicker(prev => !prev);
  };
  
  // 색상 검색 핸들러
  const handleColorSearchChange = (e) => {
    setColorSearchText(e.target.value);
  };
  
  // 검색어에 따라 색상 필터링
  const getFilteredColorCategories = () => {
    if (!colorSearchText.trim()) {
      return colorCategories;
    }
    
    const searchTerm = colorSearchText.toLowerCase();
    return colorCategories.map(category => ({
      ...category,
      colors: category.colors.filter(color => 
        color.name.toLowerCase().includes(searchTerm)
      )
    })).filter(category => category.colors.length > 0);
  };

  // 저장 핸들러
  const handleSave = () => {
    if (editMode) {
      // 수정 모드일 때는 해당 항목만 업데이트
      updateLevelMutation.mutate({
        id: currentLevel.id,
        data: {
          ...currentLevel,
          createdAt: currentLevel.createdAt
        }
      }, {
        onSuccess: () => {
          // 로컬 상태 업데이트
          const updatedLevels = levels.map(level => 
            level.id === currentLevel.id ? { ...level, ...currentLevel } : level
          );
          dispatch(setLevels(updatedLevels));
        }
      });
    } else {
      // 추가 모드일 때는 새 항목 추가
      createLevelMutation.mutate({
        ...currentLevel,
        createdAt: new Date().toISOString().split('T')[0]
      }, {
        onSuccess: (newLevel) => {
          // 로컬 상태 업데이트 - 중복 추가 방지를 위해 기존 레벨과 ID가 같은 항목은 제외
          const filteredLevels = levels.filter(level => level.id !== newLevel.id);
          const updatedLevels = sortLevelsByLevelAndCreatedAt([...filteredLevels, newLevel]);
          dispatch(setLevels(updatedLevels));
        }
      });
    }
    handleCloseDialog();
  };

  // 삭제 핸들러
  const handleDelete = (id) => {
    const levelToDelete = levels.find(level => level.id === id);
    setDeleteId(id);
    setCurrentLevel(levelToDelete); // 현재 선택된 레벨 정보 저장
    
    // 대체 단계 선택 초기화
    // 기본값으로 현재 단계보다 상위 단계 중 가장 가까운 단계 선택
    const currentLevelNumber = levelToDelete.level;
    const upperLevels = levels.filter(level => 
      level.id !== id && level.level < currentLevelNumber
    );
    
    if (upperLevels.length > 0) {
      // 가장 가까운 상위 단계 찾기 (레벨 번호가 가장 큰 것)
      const closestUpperLevel = upperLevels.reduce((prev, current) => 
        (current.level > prev.level) ? current : prev
      );
      setReplacementLevelId(closestUpperLevel.id);
    } else if (levels.length > 1) {
      // 상위 단계가 없으면 다른 단계 중 첫 번째 선택
      const otherLevel = levels.find(level => level.id !== id);
      if (otherLevel) {
        setReplacementLevelId(otherLevel.id);
      }
    } else {
      setReplacementLevelId('');
    }
    
    setDeleteConfirmOpen(true);
  };

  // 다중 삭제 핸들러
  const handleMultiDelete = () => {
    deleteMultipleLevelsMutation.mutate(selectedLevels);
    setSelectedLevels([]);
    setMultiDeleteConfirmOpen(false);
  };

  // 단계 이름 렌더링 함수
  const renderLevelName = (level) => {
    if (level.backgroundColor && level.borderColor) {
      return (
        <Chip
          label={level.name}
          sx={{
            backgroundColor: level.backgroundColor,
            color: getTextColor(level.backgroundColor),
            border: `1px solid ${level.borderColor}`,
            fontWeight: 'bold',
            minWidth: '80px',
            borderRadius: '50px',
            padding: '0 8px',
            height: '28px',
            fontSize: '0.8rem'
          }}
        />
      );
    }
    return level.name;
  };

  // 로딩 상태 표시
  if (status === 'loading' || isLoadingLevels) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>데이터를 불러오는 중입니다...</Typography>
      </Box>
    );
  }

  // 에러 상태 표시
  if (status === 'failed' || error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography color="error">데이터를 불러오는데 실패했습니다: {error}</Typography>
      </Box>
    );
  }

  return (
    <div className="agent-level-settings">
      <Box className="page-header">
        <Typography variant="h4" className="page-title">
          단계/권한설정
        </Typography>
      </Box>

      <Box className="tab-container">
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="agent level tabs">
          <Tab label="단계설정" id="agent-level-tab-0" aria-controls="agent-level-tabpanel-0" />
          <Tab label="권한설정" id="agent-level-tab-1" aria-controls="agent-level-tabpanel-1" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Card sx={{ overflow: 'visible' }}>
          <CardContent sx={{ overflow: 'visible' }}>
            <Box className="table-header">
              <Typography variant="h6">단계 목록</Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                className="add-button"
                onClick={() => handleOpenDialog()}
              >
                단계추가
              </Button>
            </Box>

            <TableContainer 
              component={Paper} 
              className="table-container" 
              sx={{ 
                maxHeight: 'none', 
                overflow: 'visible',
                display: 'block',
                width: '100%'
              }}
            >
              <Table sx={{ tableLayout: 'fixed' }}>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox" width="5%" align="center">
                      <Checkbox
                        indeterminate={selectedLevels.length > 0 && selectedLevels.length < levels.length}
                        checked={levels.length > 0 && selectedLevels.length === levels.length}
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell width="8%" align="center">No</TableCell>
                    <TableCell width="20%" align="center">이름</TableCell>
                    <TableCell width="10%" align="center">단계</TableCell>
                    <TableCell width="15%" align="center">권한</TableCell>
                    <TableCell width="15%" align="center">생성일</TableCell>
                    <TableCell width="27%" align="center">비고</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortLevelsByLevelAndCreatedAt(levels).map((level, index) => (
                    <TableRow key={level.id}>
                      <TableCell padding="checkbox" align="center">
                        <Checkbox
                          checked={selectedLevels.indexOf(level.id) !== -1}
                          onChange={(event) => handleSelectOne(event, level.id)}
                        />
                      </TableCell>
                      <TableCell align="center">{index + 1}</TableCell>
                      <TableCell align="center">{renderLevelName(level)}</TableCell>
                      <TableCell align="center">{level.level}</TableCell>
                      <TableCell align="center">{level.permission}</TableCell>
                      <TableCell align="center">{level.createdAt}</TableCell>
                      <TableCell align="center">
                        <Box className="action-buttons" sx={{ display: 'flex', justifyContent: 'center' }}>
                          <Button 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                            onClick={() => handleOpenDialog(level)}
                            sx={{ mr: 1 }}
                          >
                            수정
                          </Button>
                          <Button 
                            size="small" 
                            color="error" 
                            variant="outlined"
                            onClick={() => handleDelete(level.id)}
                          >
                            삭제
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {selectedLevels.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setMultiDeleteConfirmOpen(true)}
                >
                  선택 삭제 ({selectedLevels.length})
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Card>
          <CardContent>
            <Typography variant="body1">
              권한 설정 페이지는 별도의 메뉴에서 관리됩니다. 
              <Button 
                color="primary" 
                onClick={() => window.location.href = '/site-settings/permissions'}
              >
                권한 설정 페이지로 이동
              </Button>
            </Typography>
          </CardContent>
        </Card>
      </TabPanel>

      {/* 단계 추가/수정 다이얼로그 */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? '단계 수정' : '단계 추가'}</DialogTitle>
        <DialogContent>
          <Box className="popup-form" sx={{ pt: 1 }}>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="단계 이름"
              type="text"
              fullWidth
              value={currentLevel.name}
              onChange={handleInputChange}
            />

            <FormControl fullWidth margin="dense">
              <InputLabel>단계 레벨</InputLabel>
              <Select
                name="level"
                value={currentLevel.level}
                label="단계 레벨"
                onChange={handleInputChange}
              >
                {Array.from({ length: 20 }, (_, i) => i + 1).map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="dense">
              <InputLabel>권한 설정</InputLabel>
              <Select
                name="permission"
                value={currentLevel.permission}
                label="권한 설정"
                onChange={handleInputChange}
              >
                {permissions.map((permission) => (
                  <MenuItem key={permission.id} value={permission.name}>
                    {permission.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                색상 선택
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  배경색 선택 (테두리색은 자동으로 설정됩니다)
                </Typography>
                <Box 
                  onClick={toggleBackgroundPicker}
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    p: 1,
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    mb: 1,
                    width: '100%'
                  }}
                >
                  <Box 
                    sx={{ 
                      width: 24, 
                      height: 24, 
                      backgroundColor: currentLevel.backgroundColor,
                      border: `1px solid ${currentLevel.borderColor}`,
                      borderRadius: '4px',
                      mr: 1
                    }} 
                  />
                  <Typography variant="body2">
                    {currentLevel.backgroundColor}
                  </Typography>
                  <ColorLensIcon sx={{ ml: 'auto' }} />
                </Box>
                {showBackgroundPicker && (
                  <Box sx={{ position: 'relative', zIndex: 10 }}>
                    <Box 
                      sx={{ 
                        position: 'fixed', 
                        top: 0, 
                        right: 0, 
                        bottom: 0, 
                        left: 0,
                        zIndex: 9
                      }} 
                      onClick={toggleBackgroundPicker}
                    />
                    <Box sx={{ 
                      position: 'absolute', 
                      zIndex: 10,
                      right: 0,  // 오른쪽에 위치
                      top: '0px' // 상단에 위치
                    }}>
                      <HexColorPicker 
                        color={customBackgroundColor} 
                        onChange={handleCustomBackgroundColorChange}
                        style={{ 
                          width: '250px',
                          height: '250px',
                          boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.25)',
                          borderRadius: '8px'
                        }}
                      />
                      <Box sx={{ 
                        mt: 1, 
                        display: 'flex', 
                        alignItems: 'center',
                        backgroundColor: 'white',
                        p: 1,
                        borderRadius: '4px',
                        boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.1)'
                      }}>
                        <Box 
                          sx={{ 
                            width: 24, 
                            height: 24, 
                            backgroundColor: customBackgroundColor,
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            mr: 1
                          }} 
                        />
                        <TextField
                          size="small"
                          value={customBackgroundColor}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)) {
                              handleCustomBackgroundColorChange(value);
                            } else if (value.startsWith('#') && value.length <= 7) {
                              setCustomBackgroundColor(value);
                            }
                          }}
                          sx={{ width: '100px' }}
                        />
                        <Button 
                          variant="contained" 
                          size="small" 
                          onClick={toggleBackgroundPicker}
                          sx={{ ml: 1 }}
                        >
                          적용
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                )}
              </Box>
              
              <Typography variant="subtitle2" gutterBottom>
                기본 색상 선택
              </Typography>
              
              <Box 
                sx={{ 
                  maxHeight: '200px',
                  overflowY: 'auto',
                  p: 1,
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  mb: 2
                }}
              >
                {getFilteredColorCategories().map((category, categoryIndex) => (
                  <Box key={categoryIndex} sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                      {category.name}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {category.colors.map((color, colorIndex) => (
                        <Tooltip key={colorIndex} title={color.name} arrow>
                          <Box
                            onClick={() => handleColorSelect(color.backgroundColor, color.borderColor)}
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              backgroundColor: color.backgroundColor,
                              border: `2px solid ${color.borderColor}`,
                              cursor: 'pointer',
                              boxShadow: currentLevel.backgroundColor === color.backgroundColor ? '0 0 0 3px rgba(0,0,0,0.3)' : 'none',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: getTextColor(color.backgroundColor),
                              fontSize: '14px',
                              fontWeight: 'bold',
                              transition: 'transform 0.2s, box-shadow 0.2s',
                              '&:hover': {
                                transform: 'scale(1.1)',
                                boxShadow: '0 0 0 2px rgba(0,0,0,0.2)'
                              }
                            }}
                          >
                            {currentLevel.backgroundColor === color.backgroundColor && '✓'}
                          </Box>
                        </Tooltip>
                      ))}
                    </Box>
                  </Box>
                ))}
                
                {getFilteredColorCategories().length === 0 && (
                  <Typography variant="body2" sx={{ textAlign: 'center', py: 2, color: 'text.secondary' }}>
                    검색 결과가 없습니다.
                  </Typography>
                )}
              </Box>
              
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle2" sx={{ mr: 2 }}>
                  미리보기:
                </Typography>
                <Chip
                  label={currentLevel.name || '단계 이름'}
                  sx={{
                    backgroundColor: currentLevel.backgroundColor,
                    color: getTextColor(currentLevel.backgroundColor),
                    border: `1px solid ${currentLevel.borderColor}`,
                    fontWeight: 'bold',
                    borderRadius: '50px',
                    padding: '0 8px',
                    height: '28px',
                    fontSize: '0.8rem'
                  }}
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            취소
          </Button>
          <Button onClick={handleSave} color="primary" variant="contained">
            저장
          </Button>
        </DialogActions>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>단계 삭제 확인</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            다음 단계를 정말로 삭제하시겠습니까?
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body1" fontWeight="bold">단계명:</Typography>
            {currentLevel && currentLevel.id === deleteId && (
              <Chip
                label={currentLevel.name}
                sx={{
                  backgroundColor: currentLevel.backgroundColor,
                  color: getTextColor(currentLevel.backgroundColor),
                  border: `1px solid ${currentLevel.borderColor}`,
                  fontWeight: 'bold'
                }}
              />
            )}
          </Box>
          
          <Typography variant="body2" color="error" sx={{ mt: 2, mb: 2, fontWeight: 'bold' }}>
            경고: 단계 삭제 시 복구가 불가능합니다. 신중히 선택해 주세요.
          </Typography>
          
          <Typography variant="body2" sx={{ mt: 2, mb: 1 }}>
            이 단계에 속한 회원들을 이동시킬 대체 단계를 선택해 주세요:
          </Typography>
          
          <TextField
            select
            fullWidth
            value={replacementLevelId}
            onChange={(e) => setReplacementLevelId(e.target.value)}
            variant="outlined"
            size="small"
            required
            sx={{ mb: 2 }}
          >
            {levels
              .filter(level => level.id !== deleteId) // 삭제할 단계는 제외
              .map(level => (
                <MenuItem key={level.id} value={level.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={level.name}
                      size="small"
                      sx={{
                        backgroundColor: level.backgroundColor,
                        color: getTextColor(level.backgroundColor),
                        border: `1px solid ${level.borderColor}`,
                        fontWeight: 'bold',
                        minWidth: '80px',
                        borderRadius: '50px',
                        padding: '0 8px',
                        height: '24px',
                        fontSize: '0.75rem'
                      }}
                    />
                    <Typography variant="body2">{level.permission}</Typography>
                  </Box>
                </MenuItem>
              ))}
          </TextField>
          
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            * 이 작업은 되돌릴 수 없습니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="inherit">
            취소
          </Button>
          <Button 
            onClick={() => {
              if (!replacementLevelId) {
                alert('대체 단계를 선택해 주세요.');
                return;
              }
              
              // 단계 삭제 및 회원 재배치 처리
              deleteLevelMutation.mutate({
                id: deleteId,
                replacementLevelId: replacementLevelId
              });
              
              // 상태 초기화
              setDeleteConfirmOpen(false);
              setReplacementLevelId('');
            }} 
            color="error" 
            variant="contained"
            disabled={!replacementLevelId}
          >
            삭제 및 회원 이동
          </Button>
        </DialogActions>
      </Dialog>

      {/* 다중 삭제 확인 다이얼로그 */}
      <Dialog open={multiDeleteConfirmOpen} onClose={() => setMultiDeleteConfirmOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>다중 단계 삭제 확인</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            선택한 {selectedLevels.length}개의 단계를 정말로 삭제하시겠습니까?
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body1" fontWeight="bold">삭제할 단계:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {selectedLevels.map(id => {
                const level = levels.find(l => l.id === id);
                return level ? (
                  <Chip
                    key={level.id}
                    label={level.name}
                    sx={{
                      backgroundColor: level.backgroundColor,
                      color: getTextColor(level.backgroundColor),
                      border: `1px solid ${level.borderColor}`,
                      fontWeight: 'bold'
                    }}
                  />
                ) : null;
              })}
            </Box>
          </Box>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            * 이 작업은 되돌릴 수 없습니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMultiDeleteConfirmOpen(false)} color="inherit">
            취소
          </Button>
          <Button 
            onClick={handleMultiDelete} 
            color="error" 
            variant="contained"
          >
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AgentLevelSettings; 
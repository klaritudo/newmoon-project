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
  Checkbox,
  IconButton,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Divider,
  Grid,
  Tabs,
  Tab,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import '../../styles/permissionSettings.css';

// 액션과 선택자 가져오기
import { 
  fetchRoles, 
  createRole, 
  updateRole, 
  deleteRole, 
  updateRolePermissions,
  selectAllRoles,
  selectRoleById,
  selectRolePermissions,
  selectPermissionsStatus,
  selectPermissionsError
} from '../../features/permissions/permissionsSlice';

// React Query 훅 가져오기
import { 
  useRoles, 
  useRole, 
  useRolePermissions,
  useCreateRole, 
  useUpdateRole, 
  useDeleteRole,
  useDeleteMultipleRoles,
  useUpdateRolePermissions
} from '../../features/permissions/usePermissions';

// 탭 패널 컴포넌트
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`permission-tabpanel-${index}`}
      aria-labelledby={`permission-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// 기본 역할 데이터
const defaultRoles = [
  { id: 1, name: '슈퍼관리자', createdAt: '2023-01-01', bankName: '신한은행', accountNumber: '110-123-456789', accountHolder: '홍길동' },
  { id: 2, name: '관리자', createdAt: '2023-01-01', bankName: '국민은행', accountNumber: '123-45-67890', accountHolder: '김철수' },
  { id: 3, name: '에이전트', createdAt: '2023-01-01', bankName: '우리은행', accountNumber: '1002-123-456789', accountHolder: '이영희' },
  { id: 4, name: '회원', createdAt: '2023-01-01', bankName: '', accountNumber: '', accountHolder: '' },
];

// 권한 그룹 데이터
const permissionGroups = [
  {
    id: 1,
    name: '대시보드',
    permissions: [
      { id: 101, name: '대시보드 접근', description: '대시보드 페이지에 접근할 수 있는 권한' },
      { id: 102, name: '통계 보기', description: '대시보드의 통계 정보를 볼 수 있는 권한' },
      { id: 103, name: '자동 새로고침 설정', description: '대시보드 자동 새로고침 기능을 사용할 수 있는 권한' },
    ]
  },
  {
    id: 2,
    name: '에이전트/회원관리',
    permissions: [
      { id: 201, name: '트리뷰 접근', description: '트리뷰 페이지에 접근할 수 있는 권한' },
      { id: 202, name: '회원관리 접근', description: '회원관리 페이지에 접근할 수 있는 권한' },
      { id: 203, name: '회원 추가', description: '새로운 회원을 추가할 수 있는 권한' },
      { id: 204, name: '회원 수정', description: '회원 정보를 수정할 수 있는 권한' },
      { id: 205, name: '회원 삭제', description: '회원을 삭제할 수 있는 권한' },
    ]
  },
  {
    id: 3,
    name: '배팅상세내역',
    permissions: [
      { id: 301, name: '배팅내역 접근', description: '배팅내역 페이지에 접근할 수 있는 권한' },
      { id: 302, name: '배팅내역 수정', description: '배팅내역을 수정할 수 있는 권한' },
    ]
  },
  {
    id: 4,
    name: '정산관리',
    permissions: [
      { id: 401, name: '정산관리 접근', description: '정산관리 페이지에 접근할 수 있는 권한' },
      { id: 402, name: '정산 처리', description: '정산을 처리할 수 있는 권한' },
    ]
  },
  {
    id: 5,
    name: '입출금관리',
    permissions: [
      { id: 501, name: '입출금관리 접근', description: '입출금관리 페이지에 접근할 수 있는 권한' },
      { id: 502, name: '입금 처리', description: '입금을 처리할 수 있는 권한' },
      { id: 503, name: '출금 처리', description: '출금을 처리할 수 있는 권한' },
    ]
  },
  {
    id: 6,
    name: '사이트설정',
    permissions: [
      { id: 601, name: '사이트설정 접근', description: '사이트설정 페이지에 접근할 수 있는 권한' },
      { id: 602, name: '에이전트 단계 설정', description: '에이전트 단계를 설정할 수 있는 권한' },
      { id: 603, name: '권한 설정', description: '권한을 설정할 수 있는 권한' },
      { id: 604, name: 'API 잔액 연동 설정', description: 'API 잔액 연동을 설정할 수 있는 권한' },
    ]
  },
];

// 역할별 권한 데이터 (초기값)
const initialRolePermissions = {
  1: [101, 102, 103, 201, 202, 203, 204, 205, 301, 302, 401, 402, 501, 502, 503, 601, 602, 603, 604], // 슈퍼관리자 (모든 권한)
  2: [101, 102, 103, 201, 202, 203, 204, 301, 401, 501, 502, 503, 601], // 관리자 (자동 새로고침 포함)
  3: [101, 201, 202, 301, 401, 501], // 에이전트 (자동 새로고침 없음)
  4: [101], // 회원 (자동 새로고침 없음)
};

const PermissionSettings = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux 상태 가져오기
  const roles = useSelector(selectAllRoles);
  const status = useSelector(selectPermissionsStatus);
  const error = useSelector(selectPermissionsError);
  const rolePermissionsData = useSelector(selectRolePermissions);
  
  // React Query 훅 사용
  const { data: rolesData, isLoading: isLoadingRoles } = useRoles();
  const createRoleMutation = useCreateRole();
  const updateRoleMutation = useUpdateRole();
  const deleteRoleMutation = useDeleteRole();
  const deleteMultipleRolesMutation = useDeleteMultipleRoles();
  const updateRolePermissionsMutation = useUpdateRolePermissions();
  
  // 상태 관리
  const [tabValue, setTabValue] = useState(1); // 권한설정 탭이 기본 선택
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openPermissionDialog, setOpenPermissionDialog] = useState(false);
  const [currentRole, setCurrentRole] = useState({ name: '', bankName: '', accountNumber: '', accountHolder: '' });
  const [editMode, setEditMode] = useState(false);
  const [rolePermissions, setRolePermissions] = useState({});
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [editedRoleName, setEditedRoleName] = useState('');
  const [editedBankName, setEditedBankName] = useState('');
  const [editedAccountNumber, setEditedAccountNumber] = useState('');
  const [editedAccountHolder, setEditedAccountHolder] = useState('');
  const [filterText, setFilterText] = useState('');
  const [showOnlyGranted, setShowOnlyGranted] = useState(false);
  const [columnsCount, setColumnsCount] = useState(3);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [permissionError, setPermissionError] = useState(null);

  // 서버에서 데이터 로드
  useEffect(() => {
    // 로컬 스토리지에서 데이터 확인
    try {
      const localRoles = localStorage.getItem('roles');
      if (localRoles) {
        console.log('Using roles from local storage');
      }
    } catch (error) {
      console.error('Error reading from local storage:', error);
    }
    
    // API에서 데이터 로드 시도
    try {
      dispatch(fetchRoles())
        .unwrap()
        .then(data => {
          console.log('Roles loaded successfully:', data);
          
          // 로컬 스토리지에 저장
          try {
            localStorage.setItem('roles', JSON.stringify(data));
          } catch (storageError) {
            console.error('Error saving roles to local storage:', storageError);
          }
        })
        .catch(error => {
          console.error('Error loading roles:', error);
          alert('역할 정보를 불러오는 중 오류가 발생했습니다. 로컬 데이터를 사용합니다.');
        });
    } catch (error) {
      console.error('Error dispatching fetchRoles:', error);
    }
  }, [dispatch]);

  // 선택된 역할이 변경될 때 해당 역할의 권한 정보 로드
  useEffect(() => {
    if (selectedRoleId) {
      setLoadingPermissions(true);
      setPermissionError(null);
      
      // 이미 로컬에 데이터가 있는 경우 사용
      if (rolePermissions[selectedRoleId]) {
        console.log('Using cached role permissions for role ID:', selectedRoleId);
        setLoadingPermissions(false);
        return;
      }
      
      try {
        dispatch(fetchRolePermissions(selectedRoleId))
          .unwrap()
          .then(data => {
            console.log('Role permissions loaded successfully:', data);
          })
          .catch(error => {
            console.error('Error loading role permissions:', error);
            setPermissionError('권한 정보를 불러오는 중 오류가 발생했습니다. 로컬 데이터를 사용합니다.');
            
            // API 실패 시 빈 배열로 초기화
            setRolePermissions(prev => ({
              ...prev,
              [selectedRoleId]: prev[selectedRoleId] || []
            }));
          })
          .finally(() => {
            setLoadingPermissions(false);
          });
      } catch (error) {
        console.error('Error dispatching fetchRolePermissions:', error);
        setPermissionError('권한 정보를 불러오는 중 오류가 발생했습니다. 로컬 데이터를 사용합니다.');
        
        // 오류 발생 시 빈 배열로 초기화
        setRolePermissions(prev => ({
          ...prev,
          [selectedRoleId]: prev[selectedRoleId] || []
        }));
        
        setLoadingPermissions(false);
      }
    }
  }, [selectedRoleId, dispatch, rolePermissions]);

  // 역할 권한 데이터가 변경될 때 rolePermissions 상태 업데이트
  useEffect(() => {
    if (selectedRoleId && rolePermissionsData) {
      console.log('Role permissions data updated:', rolePermissionsData);
      
      // 데이터가 배열인지 확인
      const permissionsArray = Array.isArray(rolePermissionsData) 
        ? rolePermissionsData 
        : [];
      
      setRolePermissions(prev => {
        // 이전 상태와 동일한 경우 상태 업데이트 방지
        if (JSON.stringify(prev[selectedRoleId]) === JSON.stringify(permissionsArray)) {
          return prev;
        }
        
        return {
          ...prev,
          [selectedRoleId]: permissionsArray
        };
      });
    }
  }, [selectedRoleId, rolePermissionsData]);

  // 탭 변경 핸들러
  const handleTabChange = (event, newValue) => {
    if (newValue === 0) {
      // 단계설정 탭으로 이동
      navigate('/site-settings/agent-level');
    } else {
      setTabValue(newValue);
    }
  };

  // 체크박스 핸들러
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedRoles(roles.map(role => role.id));
    } else {
      setSelectedRoles([]);
    }
  };

  const handleSelectOne = (event, id) => {
    const selectedIndex = selectedRoles.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...selectedRoles, id];
    } else {
      newSelected = selectedRoles.filter(item => item !== id);
    }

    setSelectedRoles(newSelected);
  };

  // 다이얼로그 핸들러
  const handleOpenDialog = () => {
    // 새 역할을 위한 임시 ID 생성
    const tempId = `temp_${Date.now()}`;
    
    // 상태 초기화
    setCurrentRole({ 
      id: tempId,
      name: '', 
      bankName: '', 
      accountNumber: '', 
      accountHolder: '' 
    });
    setEditMode(false);
    
    // 새 역할을 위한 권한 데이터 초기화
    setSelectedRoleId(tempId);
    setRolePermissions(prev => ({
      ...prev,
      [tempId]: []
    }));
    
    // 필터 초기화
    setFilterText('');
    setShowOnlyGranted(false);
    
    // 다이얼로그 열기
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // 권한 설정 다이얼로그 핸들러
  const handleOpenPermissionDialog = (role) => {
    try {
      console.log('Opening permission dialog for role:', role);
      
      // role 객체 유효성 검사
      if (!role || typeof role !== 'object') {
        throw new Error('유효하지 않은 역할 객체입니다.');
      }
      
      if (!role.id) {
        throw new Error('역할 ID가 없습니다.');
      }
      
      // 기본값 설정으로 누락된 속성 처리
      const safeRole = {
        id: role.id,
        name: role.name || '',
        bankName: role.bankName || '',
        accountNumber: role.accountNumber || '',
        accountHolder: role.accountHolder || '',
        createdAt: role.createdAt || new Date().toISOString().split('T')[0]
      };
      
      console.log('Safe role object:', safeRole);
      
      // 상태 업데이트
      setSelectedRoleId(safeRole.id);
      setEditedRoleName(safeRole.name);
      setEditedBankName(safeRole.bankName);
      setEditedAccountNumber(safeRole.accountNumber);
      setEditedAccountHolder(safeRole.accountHolder);
      
      // 권한 데이터 초기화 (API 실패에 대비)
      setRolePermissions(prev => ({
        ...prev,
        [safeRole.id]: prev[safeRole.id] || []
      }));
      
      // 로딩 상태 초기화
      setLoadingPermissions(true);
      setPermissionError(null);
      
      // 역할에 대한 권한 데이터 로드 시도
      try {
        dispatch(fetchRolePermissions(safeRole.id))
          .unwrap()
          .then(data => {
            console.log('Role permissions loaded successfully:', data);
            setLoadingPermissions(false);
          })
          .catch(error => {
            console.error('Error loading role permissions:', error);
            setPermissionError('권한 정보를 불러오는 중 오류가 발생했습니다. 로컬 데이터를 사용합니다.');
            setLoadingPermissions(false);
          });
      } catch (fetchError) {
        console.error('Error dispatching fetchRolePermissions:', fetchError);
        setPermissionError('권한 정보를 불러오는 중 오류가 발생했습니다. 로컬 데이터를 사용합니다.');
        setLoadingPermissions(false);
      }
      
      // 다이얼로그 열기
      setOpenPermissionDialog(true);
    } catch (error) {
      console.error('Error opening permission dialog:', error);
      alert(`권한 설정 다이얼로그를 여는 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  const handleClosePermissionDialog = () => {
    setOpenPermissionDialog(false);
    setSelectedRoleId(null);
    setEditedRoleName('');
    setEditedBankName('');
    setEditedAccountNumber('');
    setEditedAccountHolder('');
  };

  // 입력 필드 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentRole(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleNameChange = (e) => {
    setEditedRoleName(e.target.value);
  };

  const handleBankNameChange = (e) => {
    setEditedBankName(e.target.value);
  };

  const handleAccountNumberChange = (e) => {
    setEditedAccountNumber(e.target.value);
  };

  const handleAccountHolderChange = (e) => {
    setEditedAccountHolder(e.target.value);
  };

  // 저장 핸들러
  const handleSave = () => {
    try {
      // 유효성 검사
      if (currentRole.name.trim() === '') {
        alert('역할 이름을 입력해주세요.');
        return;
      }
      
      console.log('Saving role:', currentRole);
      
      // 서버에 역할 생성 요청
      createRoleMutation.mutate({
        name: currentRole.name,
        bankName: currentRole.bankName || '',
        accountNumber: currentRole.accountNumber || '',
        accountHolder: currentRole.accountHolder || '',
      }, {
        onSuccess: (newRole) => {
          console.log('Role created successfully:', newRole);
          
          // 권한 정보 저장
          const permissions = rolePermissions[currentRole.id] || [];
          if (permissions.length > 0) {
            console.log('Saving permissions for new role:', permissions);
            
            // 서버에 권한 정보 저장 요청
            updateRolePermissionsMutation.mutate({
              roleId: newRole.id,
              permissions
            }, {
              onSuccess: () => {
                console.log('Permissions saved successfully');
                alert('역할 및 권한이 성공적으로 저장되었습니다.');
              },
              onError: (error) => {
                console.error('Error saving permissions:', error);
                alert('역할은 저장되었지만 권한 저장 중 오류가 발생했습니다.');
              }
            });
          } else {
            alert('역할이 성공적으로 저장되었습니다.');
          }
          
          // 임시 ID 제거
          setRolePermissions(prev => {
            const { [currentRole.id]: _, ...rest } = prev;
            return rest;
          });
        },
        onError: (error) => {
          console.error('Error creating role:', error);
          alert('역할 생성 중 오류가 발생했습니다.');
        }
      });
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error in handleSave:', error);
      alert(`역할 저장 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  // 권한 저장 핸들러
  const handleSavePermissions = () => {
    try {
      console.log('Saving permissions for role ID:', selectedRoleId);
      
      // 선택된 역할 ID 유효성 검사
      if (!selectedRoleId) {
        throw new Error('유효하지 않은 역할 ID입니다.');
      }
      
      // 역할 이름 유효성 검사
      if (!editedRoleName.trim()) {
        throw new Error('역할 이름은 필수 항목입니다.');
      }
      
      // 로컬 데이터 업데이트 (API 실패에 대비)
      const updatedRole = {
        id: selectedRoleId,
        name: editedRoleName,
        bankName: editedBankName,
        accountNumber: editedAccountNumber,
        accountHolder: editedAccountHolder
      };
      
      // 로컬 상태 업데이트
      const updatedRoles = roles.map(role => 
        role.id === selectedRoleId ? { ...role, ...updatedRole } : role
      );
      
      // 로컬 스토리지에 저장
      try {
        localStorage.setItem('roles', JSON.stringify(updatedRoles));
        console.log('Roles saved to local storage');
      } catch (storageError) {
        console.error('Error saving roles to local storage:', storageError);
      }
      
      // API 호출 시도
      try {
        // 역할 이름 업데이트
        updateRoleMutation.mutate({
          id: selectedRoleId,
          data: updatedRole
        }, {
          onSuccess: () => {
            console.log('Role updated successfully');
          },
          onError: (error) => {
            console.error('Error updating role:', error);
            alert(`역할 정보 업데이트 중 오류가 발생했습니다. 로컬 데이터는 저장되었습니다.`);
          }
        });
        
        // 역할 권한 업데이트
        const permissions = rolePermissions[selectedRoleId] || [];
        updateRolePermissionsMutation.mutate({
          roleId: selectedRoleId,
          permissions
        }, {
          onSuccess: () => {
            console.log('Role permissions updated successfully');
            alert('역할 및 권한이 성공적으로 저장되었습니다.');
          },
          onError: (error) => {
            console.error('Error updating role permissions:', error);
            alert(`권한 업데이트 중 오류가 발생했습니다. 로컬 데이터는 저장되었습니다.`);
          }
        });
      } catch (apiError) {
        console.error('Error calling API:', apiError);
        alert('API 호출 중 오류가 발생했습니다. 로컬 데이터는 저장되었습니다.');
      }
      
      // 다이얼로그 닫기
      handleClosePermissionDialog();
    } catch (error) {
      console.error('Error in handleSavePermissions:', error);
      alert(`권한 저장 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  // 삭제 핸들러
  const handleDelete = (id) => {
    try {
      // 삭제 전 확인
      if (!window.confirm('정말로 이 역할을 삭제하시겠습니까?')) {
        return;
      }
      
      console.log('Deleting role with ID:', id);
      
      // ID 유효성 검사
      if (!id) {
        throw new Error('유효하지 않은 역할 ID입니다.');
      }
      
      // 로컬 데이터 업데이트 (API 실패에 대비)
      const updatedRoles = roles.filter(role => role.id !== id);
      
      // 로컬 스토리지에 저장
      try {
        localStorage.setItem('roles', JSON.stringify(updatedRoles));
        console.log('Roles saved to local storage after deletion');
      } catch (storageError) {
        console.error('Error saving roles to local storage:', storageError);
      }
      
      // API 호출 시도
      try {
        // 서버에 역할 삭제 요청
        deleteRoleMutation.mutate(id, {
          onSuccess: () => {
            console.log('Role deleted successfully');
            alert('역할이 성공적으로 삭제되었습니다.');
          },
          onError: (error) => {
            console.error('Error deleting role:', error);
            alert(`역할 삭제 중 API 오류가 발생했습니다. 로컬 데이터는 업데이트되었습니다.`);
          }
        });
      } catch (apiError) {
        console.error('Error calling API:', apiError);
        alert('API 호출 중 오류가 발생했습니다. 로컬 데이터는 업데이트되었습니다.');
      }
    } catch (error) {
      console.error('Error in handleDelete:', error);
      alert(`역할 삭제 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  // 다중 삭제 핸들러
  const handleMultiDelete = () => {
    // 선택된 역할들을 순차적으로 삭제
    deleteMultipleRolesMutation.mutate(selectedRoles);
    setSelectedRoles([]);
  };

  // 권한 체크박스 핸들러
  const handlePermissionChange = (permissionId) => {
    // 선택된 역할 ID 확인 (권한 설정 다이얼로그 또는 역할 추가 다이얼로그)
    const roleId = selectedRoleId || (currentRole && currentRole.id);
    
    if (!roleId) return;
    
    const currentPermissions = rolePermissions[roleId] || [];
    const newPermissions = currentPermissions.includes(permissionId)
      ? currentPermissions.filter(id => id !== permissionId)
      : [...currentPermissions, permissionId];
    
    setRolePermissions({
      ...rolePermissions,
      [roleId]: newPermissions
    });
  };

  // 그룹 권한 체크박스 핸들러
  const handleGroupPermissionChange = (groupId, checked) => {
    // 선택된 역할 ID 확인 (권한 설정 다이얼로그 또는 역할 추가 다이얼로그)
    const roleId = selectedRoleId || (currentRole && currentRole.id);
    
    if (!roleId) return;
    
    const groupPermissions = permissionGroups
      .find(group => group.id === groupId)
      .permissions.map(permission => permission.id);
    
    const currentPermissions = rolePermissions[roleId] || [];
    let newPermissions;
    
    if (checked) {
      // 그룹 내 모든 권한 추가
      newPermissions = [...new Set([...currentPermissions, ...groupPermissions])];
    } else {
      // 그룹 내 모든 권한 제거
      newPermissions = currentPermissions.filter(id => !groupPermissions.includes(id));
    }
    
    setRolePermissions({
      ...rolePermissions,
      [roleId]: newPermissions
    });
  };

  // 그룹 내 권한이 모두 체크되었는지 확인
  const isGroupChecked = (groupId) => {
    // 선택된 역할 ID 확인 (권한 설정 다이얼로그 또는 역할 추가 다이얼로그)
    const roleId = selectedRoleId || (currentRole && currentRole.id);
    
    if (!roleId) return false;
    
    const groupPermissions = permissionGroups
      .find(group => group.id === groupId)
      .permissions.map(permission => permission.id);
    
    const currentPermissions = rolePermissions[roleId] || [];
    
    return groupPermissions.every(id => currentPermissions.includes(id));
  };

  // 그룹 내 일부 권한이 체크되었는지 확인
  const isGroupIndeterminate = (groupId) => {
    // 선택된 역할 ID 확인 (권한 설정 다이얼로그 또는 역할 추가 다이얼로그)
    const roleId = selectedRoleId || (currentRole && currentRole.id);
    
    if (!roleId) return false;
    
    const groupPermissions = permissionGroups
      .find(group => group.id === groupId)
      .permissions.map(permission => permission.id);
    
    const currentPermissions = rolePermissions[roleId] || [];
    
    const checkedCount = groupPermissions.filter(id => currentPermissions.includes(id)).length;
    
    return checkedCount > 0 && checkedCount < groupPermissions.length;
  };

  // 필터링 핸들러 추가
  const handleFilterChange = (e) => {
    setFilterText(e.target.value);
  };
  
  const handleShowOnlyGrantedChange = (e) => {
    setShowOnlyGranted(e.target.checked);
  };
  
  const handleColumnsCountChange = (e) => {
    setColumnsCount(e.target.value);
  };
  
  // 권한 필터링 함수
  const filterPermissions = (permissions, isAddDialog = false) => {
    // 역할 추가 다이얼로그에서는 텍스트 필터만 적용
    if (isAddDialog) {
      if (!filterText) return permissions;
      return permissions.filter(permission => 
        permission.name.toLowerCase().includes(filterText.toLowerCase())
      );
    }
    
    // 권한 설정 다이얼로그에서는 텍스트 필터와 허용된 항목만 필터 모두 적용
    if (!filterText && !showOnlyGranted) return permissions;
    
    return permissions.filter(permission => {
      const matchesFilter = permission.name.toLowerCase().includes(filterText.toLowerCase());
      const isGranted = rolePermissions[selectedRoleId]?.includes(permission.id) || false;
      
      if (showOnlyGranted) {
        return matchesFilter && isGranted;
      }
      
      return matchesFilter;
    });
  };
  
  // 그룹 내 필터링된 권한 가져오기
  const getFilteredGroupPermissions = (group, isAddDialog = false) => {
    return filterPermissions(group.permissions, isAddDialog);
  };
  
  // 그룹이 필터링 후에도 표시되어야 하는지 확인
  const shouldShowGroup = (group, isAddDialog = false) => {
    return getFilteredGroupPermissions(group, isAddDialog).length > 0;
  };

  // 로딩 상태 표시
  if (status === 'loading' || isLoadingRoles) {
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
    <div className="permission-settings">
      <Box className="page-header">
        <Typography variant="h4" className="page-title">
          단계/권한설정
        </Typography>
      </Box>

      <Box className="tab-container">
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="permission tabs">
          <Tab label="단계설정" id="permission-tab-0" aria-controls="permission-tabpanel-0" />
          <Tab label="권한설정" id="permission-tab-1" aria-controls="permission-tabpanel-1" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={1}>
        <Card>
          <CardContent>
            <Box className="table-header">
              <Typography variant="h6">역할 목록</Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                className="add-button"
                onClick={handleOpenDialog}
              >
                역할추가
              </Button>
            </Box>

            <TableContainer component={Paper} className="table-container">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox" width="5%" align="center">
                      <Checkbox
                        indeterminate={selectedRoles.length > 0 && selectedRoles.length < roles.length}
                        checked={roles.length > 0 && selectedRoles.length === roles.length}
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell width="5%" align="center">No</TableCell>
                    <TableCell width="15%" align="center">역할이름</TableCell>
                    <TableCell width="15%" align="center">은행명</TableCell>
                    <TableCell width="15%" align="center">계좌번호</TableCell>
                    <TableCell width="15%" align="center">계좌주</TableCell>
                    <TableCell width="15%" align="center">생성일</TableCell>
                    <TableCell width="20%" align="center">비고</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell padding="checkbox" align="center">
                        <Checkbox
                          checked={selectedRoles.indexOf(role.id) !== -1}
                          onChange={(event) => handleSelectOne(event, role.id)}
                        />
                      </TableCell>
                      <TableCell align="center">{role.id}</TableCell>
                      <TableCell align="center">{role.name}</TableCell>
                      <TableCell align="center">{role.bankName || '-'}</TableCell>
                      <TableCell align="center">{role.accountNumber || '-'}</TableCell>
                      <TableCell align="center">{role.accountHolder || '-'}</TableCell>
                      <TableCell align="center">{role.createdAt}</TableCell>
                      <TableCell align="center">
                        <Box className="action-buttons" sx={{ display: 'flex', justifyContent: 'center' }}>
                          <Button 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                            onClick={() => handleOpenPermissionDialog(role)}
                            sx={{ mr: 1 }}
                          >
                            수정
                          </Button>
                          <Button 
                            size="small" 
                            color="error" 
                            variant="outlined"
                            onClick={() => handleDelete(role.id)}
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

            {selectedRoles.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleMultiDelete}
                >
                  선택 삭제 ({selectedRoles.length})
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* 역할 추가 다이얼로그 */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>역할 추가</DialogTitle>
        <DialogContent>
          <Box className="popup-form" sx={{ pt: 1 }}>
            {/* 기본 정보 입력 필드 */}
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="역할 이름"
              type="text"
              fullWidth
              value={currentRole.name}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="bankName"
              label="은행명"
              type="text"
              fullWidth
              value={currentRole.bankName}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="accountNumber"
              label="계좌번호"
              type="text"
              fullWidth
              value={currentRole.accountNumber}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="accountHolder"
              label="계좌주"
              type="text"
              fullWidth
              value={currentRole.accountHolder}
              onChange={handleInputChange}
              sx={{ mb: 3 }}
            />
            
            <Divider sx={{ mb: 3 }} />
            
            {/* 권한 설정 섹션 */}
            <Typography variant="h6" sx={{ mb: 2 }}>권한 설정</Typography>
            
            {/* 필터 및 컬럼 설정 */}
            <Box className="permission-filter" sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
              <Typography variant="subtitle1" sx={{ mr: 2 }}>
                권한 그룹
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, gap: 2 }}>
                <TextField
                  placeholder="빠른 필터"
                  size="small"
                  value={filterText}
                  onChange={handleFilterChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: 200 }}
                />
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ mr: 1 }}>컬럼:</Typography>
                  <FormControl size="small" sx={{ width: 80 }}>
                    <Select
                      value={columnsCount}
                      onChange={handleColumnsCountChange}
                    >
                      <MenuItem value={1}>1</MenuItem>
                      <MenuItem value={2}>2</MenuItem>
                      <MenuItem value={3}>3</MenuItem>
                      <MenuItem value={4}>4</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </Box>
            
            {/* 권한 목록 */}
            <Box className="permission-editor" sx={{ mt: 2, maxHeight: '400px', overflow: 'auto' }}>
              {permissionGroups && permissionGroups.length > 0 ? (
                <Box className="permission-groups-container">
                  {permissionGroups.map((group) => (
                    shouldShowGroup(group, true) && (
                      <Box key={group.id} className="permission-group" sx={{ mb: 2 }}>
                        <Box 
                          className="permission-group-header" 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            p: 1, 
                            bgcolor: '#f5f5f5', 
                            borderBottom: '1px solid #e0e0e0' 
                          }}
                        >
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={isGroupChecked(group.id)}
                                indeterminate={isGroupIndeterminate(group.id)}
                                onChange={(e) => handleGroupPermissionChange(group.id, e.target.checked)}
                              />
                            }
                            label={
                              <Typography variant="subtitle1">
                                {group.name} ({getFilteredGroupPermissions(group, true).length}/{group.permissions.length})
                              </Typography>
                            }
                          />
                        </Box>
                        
                        <Box className="permission-group-content" sx={{ p: 1 }}>
                          <Grid container spacing={1}>
                            {getFilteredGroupPermissions(group, true).map((permission) => (
                              <Grid item xs={12} sm={12/columnsCount} key={permission.id}>
                                <Box 
                                  className="permission-item" 
                                  sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    p: 0.5,
                                    borderRadius: 1,
                                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
                                  }}
                                >
                                  <Checkbox
                                    checked={rolePermissions[currentRole.id]?.includes(permission.id) || false}
                                    onChange={() => handlePermissionChange(permission.id)}
                                    size="small"
                                  />
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      ml: 1,
                                      color: rolePermissions[currentRole.id]?.includes(permission.id) 
                                        ? 'primary.main' 
                                        : 'text.primary'
                                    }}
                                  >
                                    {permission.name}
                                  </Typography>
                                </Box>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      </Box>
                    )
                  ))}
                </Box>
              ) : (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    권한 그룹이 없거나 로드되지 않았습니다.
                  </Typography>
                </Box>
              )}
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

      {/* 권한 설정 다이얼로그 */}
      <Dialog 
        open={openPermissionDialog} 
        onClose={handleClosePermissionDialog} 
        maxWidth="lg" 
        fullWidth
      >
        <DialogTitle>
          권한 설정
          {loadingPermissions && (
            <Typography variant="caption" sx={{ ml: 2, color: 'text.secondary' }}>
              (데이터 로딩 중...)
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {permissionError ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="error">
                {permissionError}
              </Typography>
              <Button 
                variant="outlined" 
                color="primary" 
                sx={{ mt: 2 }}
                onClick={() => {
                  setPermissionError(null);
                  if (selectedRoleId) {
                    dispatch(fetchRolePermissions(selectedRoleId));
                  }
                }}
              >
                다시 시도
              </Button>
            </Box>
          ) : (
            <>
              <Box className="role-name-editor" sx={{ mb: 3 }}>
                <TextField
                  margin="dense"
                  label="역할 이름"
                  type="text"
                  fullWidth
                  value={editedRoleName}
                  onChange={handleRoleNameChange}
                  sx={{ mb: 2 }}
                  required
                  error={!editedRoleName.trim()}
                  helperText={!editedRoleName.trim() ? '역할 이름은 필수 항목입니다.' : ''}
                />
                <TextField
                  margin="dense"
                  label="은행명"
                  type="text"
                  fullWidth
                  value={editedBankName}
                  onChange={handleBankNameChange}
                  sx={{ mb: 2 }}
                />
                <TextField
                  margin="dense"
                  label="계좌번호"
                  type="text"
                  fullWidth
                  value={editedAccountNumber}
                  onChange={handleAccountNumberChange}
                  sx={{ mb: 2 }}
                />
                <TextField
                  margin="dense"
                  label="계좌주"
                  type="text"
                  fullWidth
                  value={editedAccountHolder}
                  onChange={handleAccountHolderChange}
                />
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              <Typography variant="h6" sx={{ mb: 2 }}>권한 설정</Typography>
              
              <Box className="permission-filter" sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                <Typography variant="subtitle1" sx={{ mr: 2 }}>
                  그룹 (전체/허용)
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, gap: 2 }}>
                  <TextField
                    placeholder="빠른 필터"
                    size="small"
                    value={filterText}
                    onChange={handleFilterChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ width: 200 }}
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showOnlyGranted}
                        onChange={handleShowOnlyGrantedChange}
                        color="primary"
                      />
                    }
                    label="허용된 항목만"
                  />
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>컬럼:</Typography>
                    <FormControl size="small" sx={{ width: 80 }}>
                      <Select
                        value={columnsCount}
                        onChange={handleColumnsCountChange}
                      >
                        <MenuItem value={1}>1</MenuItem>
                        <MenuItem value={2}>2</MenuItem>
                        <MenuItem value={3}>3</MenuItem>
                        <MenuItem value={4}>4</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
              </Box>
              
              <Box className="permission-editor" sx={{ mt: 2, maxHeight: '500px', overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: 1, p: 2 }}>
                {permissionGroups && permissionGroups.length > 0 ? (
                  <Box className="permission-groups-container">
                    {permissionGroups.map((group) => (
                      shouldShowGroup(group) && (
                        <Box key={group.id} className="permission-group" sx={{ mb: 2 }}>
                          <Box 
                            className="permission-group-header" 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              p: 1, 
                              bgcolor: '#f5f5f5', 
                              borderBottom: '1px solid #e0e0e0' 
                            }}
                          >
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={isGroupChecked(group.id)}
                                  indeterminate={isGroupIndeterminate(group.id)}
                                  onChange={(e) => handleGroupPermissionChange(group.id, e.target.checked)}
                                />
                              }
                              label={
                                <Typography variant="subtitle1">
                                  {group.name} ({getFilteredGroupPermissions(group).length}/{group.permissions.length})
                                </Typography>
                              }
                            />
                          </Box>
                          
                          <Box className="permission-group-content" sx={{ p: 1 }}>
                            <Grid container spacing={1}>
                              {getFilteredGroupPermissions(group).map((permission) => (
                                <Grid item xs={12} sm={12/columnsCount} key={permission.id}>
                                  <Box 
                                    className="permission-item" 
                                    sx={{ 
                                      display: 'flex', 
                                      alignItems: 'center',
                                      p: 0.5,
                                      borderRadius: 1,
                                      '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
                                    }}
                                  >
                                    <Checkbox
                                      checked={rolePermissions[selectedRoleId]?.includes(permission.id) || false}
                                      onChange={() => handlePermissionChange(permission.id)}
                                      size="small"
                                    />
                                    <Typography 
                                      variant="body2" 
                                      sx={{ 
                                        ml: 1,
                                        color: rolePermissions[selectedRoleId]?.includes(permission.id) 
                                          ? 'primary.main' 
                                          : 'text.primary'
                                      }}
                                    >
                                      {permission.name}
                                    </Typography>
                                  </Box>
                                </Grid>
                              ))}
                            </Grid>
                          </Box>
                        </Box>
                      )
                    ))}
                  </Box>
                ) : (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                      권한 그룹이 없거나 로드되지 않았습니다.
                    </Typography>
                  </Box>
                )}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePermissionDialog} color="inherit">
            취소
          </Button>
          <Button 
            onClick={handleSavePermissions} 
            color="primary" 
            variant="contained"
            disabled={loadingPermissions || permissionError !== null || !editedRoleName.trim()}
          >
            저장
          </Button>
        </DialogActions>
      </Dialog>

      {/* 메뉴 탭 */}
      <TabPanel value={tabValue} index={2}>
        <Card>
          <CardContent>
            <Box className="table-header">
              <Typography variant="h6">메뉴 설정</Typography>
              <Typography variant="body2" color="text.secondary">
                역할별로 접근 가능한 메뉴를 설정합니다. 자동 새로고침 권한이 있는 역할은 대시보드에서 자동 새로고침 메뉴를 볼 수 있습니다.
              </Typography>
            </Box>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>대시보드 자동 새로고침 메뉴 권한</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>역할</TableCell>
                      <TableCell align="center">자동 새로고침 메뉴 표시</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {roles.map((role) => {
                      const permissions = rolePermissions[role.id] || initialRolePermissions[role.id] || [];
                      const hasRefreshPermission = permissions.includes(103);
                      return (
                        <TableRow key={role.id}>
                          <TableCell>{role.name}</TableCell>
                          <TableCell align="center">
                            {hasRefreshPermission ? (
                              <Chip label="표시" color="success" size="small" />
                            ) : (
                              <Chip label="숨김" color="default" size="small" />
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      {/* 레이아웃 탭 */}
      <TabPanel value={tabValue} index={3}>
        <Card>
          <CardContent>
            <Box className="table-header">
              <Typography variant="h6">레이아웃 설정</Typography>
              <Typography variant="body2" color="text.secondary">
                역할별로 대시보드 레이아웃을 커스터마이징합니다.
              </Typography>
            </Box>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>대시보드 자동 새로고침 위치</Typography>
              <Paper sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  자동 새로고침 컨트롤은 현재 대시보드 상단 통계 카드 영역에 위치합니다.
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  • 권한이 있는 사용자: 기간 필터 옆에 자동 새로고침 설정 드롭다운 표시
                </Typography>
                <Typography variant="body2">
                  • 권한이 없는 사용자: 해당 영역 완전히 숨김 처리
                </Typography>
              </Paper>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      {/* 버튼및데이터 탭 */}
      <TabPanel value={tabValue} index={4}>
        <Card>
          <CardContent>
            <Box className="table-header">
              <Typography variant="h6">버튼 및 데이터 설정</Typography>
              <Typography variant="body2" color="text.secondary">
                역할별로 사용 가능한 버튼과 데이터 접근을 제어합니다.
              </Typography>
            </Box>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>자동 새로고침 관련 설정</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>새로고침 간격 옵션</Typography>
                    <Box sx={{ ml: 2 }}>
                      <Typography variant="body2">• 끄기 (0초)</Typography>
                      <Typography variant="body2">• 10초</Typography>
                      <Typography variant="body2">• 30초 (기본값)</Typography>
                      <Typography variant="body2">• 1분</Typography>
                      <Typography variant="body2">• 5분</Typography>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>데이터 갱신 범위</Typography>
                    <Box sx={{ ml: 2 }}>
                      <Typography variant="body2">• 통계 카드 데이터</Typography>
                      <Typography variant="body2">• 사용자 현황</Typography>
                      <Typography variant="body2">• 대시보드 차트 (자동 새로고침 미적용)</Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      {/* CSS적용 탭 */}
      <TabPanel value={tabValue} index={5}>
        <Card>
          <CardContent>
            <Box className="table-header">
              <Typography variant="h6">CSS 스타일 설정</Typography>
              <Typography variant="body2" color="text.secondary">
                자동 새로고침 UI의 스타일을 관리합니다.
              </Typography>
            </Box>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>자동 새로고침 UI 스타일</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                    <Typography variant="subtitle2" gutterBottom>적용된 스타일</Typography>
                    <Box component="pre" sx={{ 
                      fontFamily: 'monospace', 
                      fontSize: '12px',
                      backgroundColor: 'white',
                      p: 2,
                      borderRadius: 1,
                      overflow: 'auto'
                    }}>
{`// 자동 새로고침 드롭다운
FormControl: {
  minWidth: { xs: '120px', sm: '150px' },
  flex: { xs: '0 0 auto', sm: '0 0 auto' }
}

// 아이콘 스타일
TimerIcon/TimerOffIcon: {
  mr: 0.5,
  fontSize: 18,
  color: '#5E6278'
}

// 남은 시간 칩
Chip: {
  minWidth: 80,
  fontSize: '0.75rem',
  display: { xs: 'none', sm: 'flex' } // 모바일에서 숨김
}`}
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>
    </div>
  );
};

export default PermissionSettings; 
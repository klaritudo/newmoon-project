import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Collapse,
  IconButton,
  Chip,
  Button,
  Snackbar,
  Alert,
  useTheme,
  Divider
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  SportsEsports as GamesIcon,
  Money as MoneyIcon,
  Receipt as BettingIcon,
  Calculate as CalculationIcon,
  CurrencyExchange as DepositIcon,
  EmojiEvents as GameResultIcon,
  Headset as CustomerServiceIcon,
  ForumOutlined as BoardIcon,
  Casino as GameSettingIcon,
  Web as SiteSettingIcon,
  ListAlt as LogIcon,
  DesignServices as TemplateIcon,
  ExpandLess,
  ExpandMore,
  Save as SaveIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { PageContainer, PageHeader, TableHeader } from '../../components/baseTemplate/components';
import { useTableHeader } from '../../components/baseTemplate/hooks';
import { menuItems as menuItemsSource } from '../../config/menuConfig.jsx';

/**
 * 메뉴설정 페이지
 * 사이드바 메뉴들의 표시/숨김을 관리
 */
const MenuSettingsPage = () => {
  const theme = useTheme();
  
  // localStorage에서 메뉴 설정 불러오기
  const getMenuSettingsFromStorage = () => {
    const stored = localStorage.getItem('menuSettings');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse menu settings:', e);
        return {};
      }
    }
    return {};
  };

  // 메뉴 아이템을 enabled와 expanded 속성과 함께 초기화
  const initializeMenuItems = useCallback(() => {
    const storedSettings = getMenuSettingsFromStorage();
    
    // 로그아웃 메뉴는 제외 (isSpecial 필드 사용)
    return menuItemsSource.filter(item => !item.isSpecial).map(item => {
      const itemSettings = storedSettings[item.id] || {};
      const newItem = {
        ...item,
        enabled: itemSettings.enabled !== undefined ? itemSettings.enabled : true,
        expanded: itemSettings.expanded !== undefined ? itemSettings.expanded : true,
      };
      
      if (item.children) {
        newItem.children = item.children.map(child => {
          const childSettings = storedSettings[`${item.id}.${child.id}`] || {};
          return {
            ...child,
            enabled: childSettings.enabled !== undefined ? childSettings.enabled : true,
          };
        });
      }
      
      return newItem;
    });
  }, []);

  // 메뉴 아이템 상태
  const [menuItems, setMenuItems] = useState(() => initializeMenuItems());
  
  // 알림 상태
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // 테이블 헤더 훅 사용
  const {
    searchText,
    handleSearchChange,
    handleClearSearch,
  } = useTableHeader({
    initialTotalItems: menuItems.length,
    tableId: 'menuSettings',
    showSearch: true,
  });
  
  // 알림 표시
  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };
  
  // 메뉴 토글 핸들러
  const handleToggleMenu = useCallback((menuId, childId = null) => {
    setMenuItems(prev => prev.map(menu => {
      if (childId === null && menu.id === menuId) {
        // 부모 메뉴 토글
        return { ...menu, enabled: !menu.enabled };
      } else if (menu.id === menuId && menu.children) {
        // 자식 메뉴 토글
        return {
          ...menu,
          children: menu.children.map(child =>
            child.id === childId ? { ...child, enabled: !child.enabled } : child
          )
        };
      }
      return menu;
    }));
  }, []);
  
  // 확장/축소 핸들러
  const handleToggleExpand = useCallback((menuId) => {
    setMenuItems(prev => prev.map(menu => 
      menu.id === menuId ? { ...menu, expanded: !menu.expanded } : menu
    ));
  }, []);
  
  // 활성화된 메뉴 개수 계산
  const getEnabledCount = useMemo(() => {
    let totalEnabled = 0;
    let totalMenus = 0;
    
    menuItems.forEach(menu => {
      if (menu.enabled) totalEnabled++;
      totalMenus++;
      
      if (menu.children) {
        menu.children.forEach(child => {
          if (child.enabled) totalEnabled++;
          totalMenus++;
        });
      }
    });
    
    return { enabled: totalEnabled, total: totalMenus };
  }, [menuItems]);
  
  // 메뉴 설정을 localStorage에 저장
  const saveMenuSettings = useCallback(() => {
    const settings = {};
    
    menuItems.forEach(item => {
      settings[item.id] = {
        enabled: item.enabled,
        expanded: item.expanded,
      };
      
      if (item.children) {
        item.children.forEach(child => {
          settings[`${item.id}.${child.id}`] = {
            enabled: child.enabled,
          };
        });
      }
    });
    
    localStorage.setItem('menuSettings', JSON.stringify(settings));
    
    // 사이드바를 업데이트하기 위해 이벤트 발생
    window.dispatchEvent(new Event('menuSettingsUpdated'));
  }, [menuItems]);

  // 저장 핸들러
  const handleSave = useCallback(() => {
    saveMenuSettings();
    showNotification('메뉴 설정이 저장되었습니다.');
  }, [saveMenuSettings]);
  
  // 초기화 핸들러
  const handleReset = useCallback(() => {
    if (window.confirm('모든 메뉴를 표시 상태로 초기화하시겠습니까?')) {
      setMenuItems(prev => prev.map(menu => ({
        ...menu,
        enabled: true,
        children: menu.children ? menu.children.map(child => ({ ...child, enabled: true })) : []
      })));
      showNotification('메뉴 설정이 초기화되었습니다.');
    }
  }, []);
  
  // 새로고침 핸들러
  const handleRefresh = useCallback(() => {
    showNotification('메뉴 설정을 새로고침했습니다.');
  }, []);
  
  // 필터링된 메뉴
  const filteredMenus = useMemo(() => {
    if (!searchText) return menuItems;
    
    const searchLower = searchText.toLowerCase();
    return menuItems.filter(menu => {
      // 부모 메뉴 검색
      if (menu.text.toLowerCase().includes(searchLower)) return true;
      
      // 자식 메뉴 검색
      if (menu.children) {
        return menu.children.some(child => 
          child.text.toLowerCase().includes(searchLower)
        );
      }
      
      return false;
    });
  }, [menuItems, searchText]);
  
  // 메뉴 아이템 렌더링
  const renderMenuItem = (menu, isChild = false, parentId = null) => (
    <ListItem
      key={menu.id}
      sx={{
        pl: isChild ? 6 : 2,
        pr: 2,
        py: 1.5,
        borderBottom: !isChild ? '1px solid' : 'none',
        borderColor: 'divider',
        '&:hover': {
          backgroundColor: 'action.hover',
        },
      }}
    >
      {!isChild && menu.icon && (
        <ListItemIcon sx={{ minWidth: 40, color: menu.enabled ? 'primary.main' : 'text.disabled' }}>
          {menu.icon}
        </ListItemIcon>
      )}
      
      <ListItemText
        primary={
          <Typography
            variant={isChild ? "body2" : "body1"}
            sx={{
              fontWeight: isChild ? 400 : 600,
              color: menu.enabled ? 'text.primary' : 'text.disabled',
            }}
          >
            {menu.text}
          </Typography>
        }
        secondary={menu.path && (
          <Typography variant="caption" color="text.secondary">
            {menu.path}
          </Typography>
        )}
      />
      
      {!isChild && menu.children && menu.children.length > 0 && (
        <IconButton
          size="small"
          onClick={() => handleToggleExpand(menu.id)}
          sx={{ mr: 1 }}
        >
          {menu.expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      )}
      
      <ListItemSecondaryAction>
        <Switch
          edge="end"
          checked={menu.enabled}
          onChange={() => handleToggleMenu(parentId || menu.id, isChild ? menu.id : null)}
          color="primary"
        />
      </ListItemSecondaryAction>
    </ListItem>
  );
  
  return (
    <PageContainer>
      <PageHeader
        title="메뉴설정"
        showAddButton={false}
        showDisplayOptionsButton={false}
        showRefreshButton={true}
        onRefreshClick={handleRefresh}
        sx={{ mb: 2 }}
      />
      
      <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
        <TableHeader
          title="사이드바 메뉴 관리"
          totalItems={getEnabledCount.total}
          countLabel={`##count##개 메뉴 (${getEnabledCount.enabled}개 활성화)`}
          showSearch={true}
          searchText={searchText}
          handleSearchChange={handleSearchChange}
          handleClearSearch={handleClearSearch}
          searchPlaceholder="메뉴 검색..."
          showIndentToggle={false}
          showPageNumberToggle={false}
          showColumnPinToggle={false}
          sx={{ mb: 3 }}
        />
        
        {/* 메뉴 리스트 컨테이너 */}
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            bgcolor: 'background.paper',
            mb: 3,
            overflow: 'hidden'
          }}
        >
          <List sx={{ width: '100%', p: 0 }}>
            {filteredMenus.map(menu => (
              <React.Fragment key={menu.id}>
                {renderMenuItem(menu)}
                
                {menu.children && menu.children.length > 0 && (
                  <Collapse in={menu.expanded} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {menu.children.map(child => renderMenuItem(child, true, menu.id))}
                    </List>
                  </Collapse>
                )}
              </React.Fragment>
            ))}
          </List>
        </Box>
        
        {/* 액션 버튼 */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={handleReset}
          >
            초기화
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            sx={{ minWidth: 120 }}
          >
            저장
          </Button>
        </Box>
      </Paper>
      
      {/* 알림 스낵바 */}
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default MenuSettingsPage;
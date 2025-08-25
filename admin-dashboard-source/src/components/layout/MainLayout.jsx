import React, { useState } from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton, Drawer, Divider, List, ListItem, ListItemIcon, ListItemText, useMediaQuery, CssBaseline } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { Link, useLocation } from 'react-router-dom';

// 메인 컨텐츠 영역 스타일
const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open, drawerWidth }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: 0,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: drawerWidth,
    }),
  }),
);

// App Bar 스타일
const StyledAppBar = styled(AppBar, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open, drawerWidth }) => ({
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
  }),
);

// 선택된 메뉴 아이템 스타일
const SelectedListItem = styled(ListItem)(({ theme }) => ({
  backgroundColor: theme.palette.action.selected,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

// 네비게이션 아이템 정의
const navItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Users', icon: <PeopleIcon />, path: '/users' },
  { text: 'Reports', icon: <BarChartIcon />, path: '/reports' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

/**
 * 메인 레이아웃 컴포넌트
 * 상단 앱바와 사이드 내비게이션 포함
 */
const MainLayout = ({ children }) => {
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const drawerWidth = 240;
  
  // 모바일에서는 기본적으로 드로어를 닫아둠
  const [open, setOpen] = useState(!isMobile);
  
  const handleDrawerToggle = () => {
    setOpen(!open);
  };
  
  const drawer = (
    <>
      <Toolbar>
        <Typography variant="h6" noWrap>
          Admin Dashboard
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {navItems.map((item) => {
          const isSelected = location.pathname === item.path;
          
          const ListItemComponent = isSelected ? SelectedListItem : ListItem;
          
          return (
            <ListItemComponent
              button
              key={item.text}
              component={Link}
              to={item.path}
              selected={isSelected}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemComponent>
          );
        })}
      </List>
      <Divider />
      <List>
        <ListItem button component={Link} to="/logout">
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </>
  );
  
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      <StyledAppBar position="fixed" open={open} drawerWidth={drawerWidth}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            {navItems.find(item => item.path === location.pathname)?.text || 'Admin Dashboard'}
          </Typography>
        </Toolbar>
      </StyledAppBar>
      
      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        anchor="left"
        open={open}
        onClose={isMobile ? handleDrawerToggle : undefined}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawer}
      </Drawer>
      
      <Main open={open} drawerWidth={drawerWidth}>
        <Toolbar /> {/* 앱바 높이만큼 공간 확보 */}
        {children}
      </Main>
    </Box>
  );
};

export default MainLayout; 
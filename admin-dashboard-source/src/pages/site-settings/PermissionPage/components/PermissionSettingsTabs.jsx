import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Chip,
  Divider,
  Paper,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
  InputAdornment
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Menu as MenuIcon,
  SmartButton as ButtonIcon,
  Code as CssIcon,
  ViewQuilt as LayoutIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { 
  menuPermissions, 
  buttonPermissions, 
  cssPermissions, 
  layoutPermissions,
  permissionCategories 
} from '../data/permissionMenuData';

/**
 * 권한 설정 탭 컴포넌트
 * 메뉴, 버튼및데이터, 레이아웃, CSS 권한을 설정할 수 있는 탭 인터페이스 제공
 */
const PermissionSettingsTabs = ({
  restrictions = { menus: [], buttons: [], layouts: [], cssSelectors: [] },
  onRestrictionsChange
}) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [newCssSelector, setNewCssSelector] = useState('');
  const [cssInputError, setCssInputError] = useState('');
  
  // 검색어 상태 (각 탭별로)
  const [menuSearch, setMenuSearch] = useState('');
  const [buttonSearch, setButtonSearch] = useState('');
  const [layoutSearch, setLayoutSearch] = useState('');
  const [cssSearch, setCssSearch] = useState('');

  // 탭 변경 핸들러
  const handleTabChange = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  // 메뉴 권한 변경 핸들러
  const handleMenuChange = useCallback((menuId, checked) => {
    const newMenus = checked 
      ? [...restrictions.menus, menuId]
      : restrictions.menus.filter(id => id !== menuId);
    
    onRestrictionsChange({
      ...restrictions,
      menus: newMenus
    });
  }, [restrictions, onRestrictionsChange]);

  // 버튼 권한 변경 핸들러
  const handleButtonChange = useCallback((buttonId, checked) => {
    const newButtons = checked 
      ? [...restrictions.buttons, buttonId]
      : restrictions.buttons.filter(id => id !== buttonId);
    
    onRestrictionsChange({
      ...restrictions,
      buttons: newButtons
    });
  }, [restrictions, onRestrictionsChange]);

  // CSS 권한 변경 핸들러
  const handleCssChange = useCallback((cssId, checked) => {
    const newCssSelectors = checked 
      ? [...restrictions.cssSelectors, cssId]
      : restrictions.cssSelectors.filter(id => id !== cssId);
    
    onRestrictionsChange({
      ...restrictions,
      cssSelectors: newCssSelectors
    });
  }, [restrictions, onRestrictionsChange]);

  // 레이아웃 권한 변경 핸들러
  const handleLayoutChange = useCallback((layoutId, checked) => {
    const newLayouts = checked 
      ? [...restrictions.layouts, layoutId]
      : restrictions.layouts.filter(id => id !== layoutId);
    
    onRestrictionsChange({
      ...restrictions,
      layouts: newLayouts
    });
  }, [restrictions, onRestrictionsChange]);

  // CSS 선택자 유효성 검사
  const validateCssSelector = (selector) => {
    if (!selector.trim()) {
      return '선택자를 입력해주세요.';
    }
    
    // 기본적인 CSS 선택자 패턴 검사
    const cssPattern = /^[.#]?[a-zA-Z][a-zA-Z0-9_-]*$/;
    const complexPattern = /^[.#]?[a-zA-Z][a-zA-Z0-9_-]*(\s*[>+~]\s*[.#]?[a-zA-Z][a-zA-Z0-9_-]*)*$/;
    
    if (!cssPattern.test(selector.trim()) && !complexPattern.test(selector.trim())) {
      return '올바른 CSS 선택자 형식이 아닙니다. (예: .class-name, #id-name, div > .child)';
    }
    
    // 중복 검사
    if (restrictions.cssSelectors.includes(selector.trim())) {
      return '이미 추가된 선택자입니다.';
    }
    
    return '';
  };

  // 사용자 정의 CSS 선택자 추가
  const handleAddCustomCssSelector = () => {
    const error = validateCssSelector(newCssSelector);
    if (error) {
      setCssInputError(error);
      return;
    }
    
    const newCssSelectors = [...restrictions.cssSelectors, newCssSelector.trim()];
    onRestrictionsChange({
      ...restrictions,
      cssSelectors: newCssSelectors
    });
    
    setNewCssSelector('');
    setCssInputError('');
  };

  // 사용자 정의 CSS 선택자 삭제
  const handleRemoveCustomCssSelector = (selectorToRemove) => {
    const newCssSelectors = restrictions.cssSelectors.filter(selector => selector !== selectorToRemove);
    onRestrictionsChange({
      ...restrictions,
      cssSelectors: newCssSelectors
    });
  };

  // Enter 키 처리
  const handleCssInputKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleAddCustomCssSelector();
    }
  };

  // 검색 필터 함수
  const filterBySearch = (items, searchTerm, searchFields = ['name', 'description', 'path', 'id']) => {
    if (!searchTerm) return items;
    
    const lowerSearch = searchTerm.toLowerCase();
    return items.filter(item => {
      return searchFields.some(field => {
        const value = item[field];
        if (!value) return false;
        return value.toLowerCase().includes(lowerSearch);
      });
    });
  };

  // 메뉴 탭 렌더링
  const renderMenuTab = () => {
    // 검색어로 필터링 - 자식 메뉴가 매치되는 경우 부모 메뉴도 포함
    let filteredMenus = menuPermissions;
    
    if (menuSearch) {
      const lowerSearch = menuSearch.toLowerCase();
      filteredMenus = menuPermissions.filter(menu => {
        // 부모 메뉴 자체가 매치되는 경우
        const parentMatch = 
          menu.name.toLowerCase().includes(lowerSearch) ||
          menu.path?.toLowerCase().includes(lowerSearch) ||
          menu.id?.toLowerCase().includes(lowerSearch);
        
        // 자식 메뉴 중 하나라도 매치되는 경우
        const childMatch = menu.children?.some(child => 
          child.name.toLowerCase().includes(lowerSearch) ||
          child.path?.toLowerCase().includes(lowerSearch) ||
          child.id?.toLowerCase().includes(lowerSearch)
        );
        
        return parentMatch || childMatch;
      });
    }
    
    // 카테고리별로 메뉴 그룹화
    const groupedMenus = filteredMenus.reduce((acc, menu) => {
      const category = menu.category || 'other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(menu);
      return acc;
    }, {});

    return (
      <Box sx={{ mt: 2 }}>
        {/* 검색창 추가 */}
        <TextField
          fullWidth
          size="small"
          placeholder="메뉴명, 경로 또는 ID로 검색..."
          value={menuSearch}
          onChange={(e) => setMenuSearch(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: menuSearch && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setMenuSearch('')}
                  edge="end"
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          체크된 메뉴는 이 권한을 가진 사용자가 접근할 수 없습니다.
        </Typography>
        
        {Object.entries(groupedMenus).map(([category, menus]) => (
          <Accordion key={category} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MenuIcon fontSize="small" />
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  {permissionCategories.menu[category] || category}
                </Typography>
                <Chip 
                  size="small" 
                  label={menus.length} 
                  color="primary" 
                  variant="outlined" 
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <FormGroup>
                {menus.map(menu => (
                  <Box key={menu.id}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={restrictions.menus.includes(menu.id)}
                          onChange={(e) => handleMenuChange(menu.id, e.target.checked)}
                          size="small"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {menu.name}
                          </Typography>
                          {menu.path && (
                            <Typography variant="caption" color="text.secondary">
                              {menu.path}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    
                    {/* 하위 메뉴가 있는 경우 */}
                    {menu.children && (
                      <Box sx={{ ml: 4, mt: 1 }}>
                        {menu.children
                          .filter(child => 
                            !menuSearch || 
                            child.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
                            child.path?.toLowerCase().includes(menuSearch.toLowerCase()) ||
                            child.id?.toLowerCase().includes(menuSearch.toLowerCase())
                          )
                          .map(child => (
                          <FormControlLabel
                            key={child.id}
                            control={
                              <Checkbox
                                checked={restrictions.menus.includes(child.id)}
                                onChange={(e) => handleMenuChange(child.id, e.target.checked)}
                                size="small"
                              />
                            }
                            label={
                              <Box>
                                <Typography variant="body2">
                                  {child.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {child.path}
                                </Typography>
                              </Box>
                            }
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                ))}
              </FormGroup>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    );
  };

  // 버튼 탭 렌더링
  const renderButtonTab = () => {
    // 검색어로 필터링
    const filteredButtons = filterBySearch(buttonPermissions, buttonSearch, ['name', 'description', 'id']);
    
    // 카테고리별로 버튼 그룹화
    const groupedButtons = filteredButtons.reduce((acc, button) => {
      const category = button.category || 'other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(button);
      return acc;
    }, {});

    return (
      <Box sx={{ mt: 2 }}>
        {/* 검색창 추가 */}
        <TextField
          fullWidth
          size="small"
          placeholder="버튼명, 설명 또는 ID로 검색..."
          value={buttonSearch}
          onChange={(e) => setButtonSearch(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: buttonSearch && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setButtonSearch('')}
                  edge="end"
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          체크된 버튼 및 데이터는 이 권한을 가진 사용자가 사용하거나 조회할 수 없습니다.
        </Typography>
        
        {Object.entries(groupedButtons).map(([category, buttons]) => (
          <Accordion key={category} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ButtonIcon fontSize="small" />
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  {permissionCategories.button[category] || category}
                </Typography>
                <Chip 
                  size="small" 
                  label={buttons.length} 
                  color="secondary" 
                  variant="outlined" 
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <FormGroup>
                {buttons.map(button => (
                  <FormControlLabel
                    key={button.id}
                    control={
                      <Checkbox
                        checked={restrictions.buttons.includes(button.id)}
                        onChange={(e) => handleButtonChange(button.id, e.target.checked)}
                        size="small"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {button.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {button.description}
                        </Typography>
                      </Box>
                    }
                  />
                ))}
              </FormGroup>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    );
  };

  // CSS 탭 렌더링
  const renderCssTab = () => {
    // 검색어로 필터링
    const filteredCssPermissions = filterBySearch(cssPermissions, cssSearch, ['name', 'description', 'selector', 'id']);
    
    // 미리 정의된 CSS 권한과 사용자 정의 선택자 분리
    const predefinedSelectors = cssPermissions.map(css => css.id);
    const customSelectors = restrictions.cssSelectors.filter(selector => !predefinedSelectors.includes(selector));
    
    // 사용자 정의 선택자도 검색어로 필터링
    const filteredCustomSelectors = cssSearch 
      ? customSelectors.filter(selector => selector.toLowerCase().includes(cssSearch.toLowerCase()))
      : customSelectors;

    return (
      <Box sx={{ mt: 2 }}>
        {/* 검색창 추가 */}
        <TextField
          fullWidth
          size="small"
          placeholder="CSS 선택자명, 설명, 선택자 또는 ID로 검색..."
          value={cssSearch}
          onChange={(e) => setCssSearch(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: cssSearch && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setCssSearch('')}
                  edge="end"
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          체크된 CSS 선택자에 해당하는 요소들이 화면에서 숨겨집니다.
        </Typography>
        
        {/* 미리 정의된 CSS 권한 */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CssIcon fontSize="small" />
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                미리 정의된 CSS 선택자
              </Typography>
              <Chip 
                size="small" 
                label={filteredCssPermissions.length} 
                color="warning" 
                variant="outlined" 
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <FormGroup>
              {filteredCssPermissions.map(css => (
                <FormControlLabel
                  key={css.id}
                  control={
                    <Checkbox
                      checked={restrictions.cssSelectors.includes(css.id)}
                      onChange={(e) => handleCssChange(css.id, e.target.checked)}
                      size="small"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {css.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {css.description}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontFamily: 'monospace', 
                          backgroundColor: '#f5f5f5', 
                          padding: '2px 4px', 
                          borderRadius: '4px',
                          display: 'inline-block',
                          mt: 0.5
                        }}
                      >
                        {css.selector}
                      </Typography>
                    </Box>
                  }
                />
              ))}
            </FormGroup>
          </AccordionDetails>
        </Accordion>

        {/* 사용자 정의 CSS 선택자 추가 */}
        <Accordion defaultExpanded sx={{ mt: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AddIcon fontSize="small" />
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                사용자 정의 CSS 선택자
              </Typography>
              <Chip 
                size="small" 
                label={filteredCustomSelectors.length} 
                color="success" 
                variant="outlined" 
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {/* 입력 필드 */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                새 CSS 선택자 추가
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <TextField
                  size="small"
                  placeholder="예: .my-class, #my-id, div > .child"
                  value={newCssSelector}
                  onChange={(e) => {
                    setNewCssSelector(e.target.value);
                    if (cssInputError) setCssInputError('');
                  }}
                  onKeyPress={handleCssInputKeyPress}
                  error={!!cssInputError}
                  helperText={cssInputError}
                  sx={{ flex: 1 }}
                />
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddCustomCssSelector}
                  disabled={!newCssSelector.trim()}
                >
                  추가
                </Button>
              </Box>
              
              {/* 사용 예시 */}
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="caption">
                  <strong>사용 예시:</strong><br/>
                  • 클래스: <code>.my-custom-class</code><br/>
                  • ID: <code>#my-element-id</code><br/>
                  • 복합 선택자: <code>div &gt; .child-class</code><br/>
                  • 속성 선택자: <code>[data-role="admin"]</code>
                </Typography>
              </Alert>
            </Box>

            {/* 추가된 사용자 정의 선택자 목록 */}
            {filteredCustomSelectors.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  추가된 선택자 목록
                </Typography>
                <List dense>
                  {filteredCustomSelectors.map((selector, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemText
                        primary={
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontFamily: 'monospace', 
                              backgroundColor: '#f5f5f5', 
                              padding: '4px 8px', 
                              borderRadius: '4px',
                              display: 'inline-block'
                            }}
                          >
                            {selector}
                          </Typography>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => handleRemoveCustomCssSelector(selector)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      </Box>
    );
  };

  // 레이아웃 탭 렌더링
  const renderLayoutTab = () => {
    // 검색어로 필터링
    const filteredLayouts = filterBySearch(layoutPermissions, layoutSearch, ['name', 'description', 'id']);
    
    // 카테고리별로 레이아웃 그룹화
    const groupedLayouts = filteredLayouts.reduce((acc, layout) => {
      const category = layout.category || 'other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(layout);
      return acc;
    }, {});

    return (
      <Box sx={{ mt: 2 }}>
        {/* 검색창 추가 */}
        <TextField
          fullWidth
          size="small"
          placeholder="레이아웃명, 설명 또는 ID로 검색..."
          value={layoutSearch}
          onChange={(e) => setLayoutSearch(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: layoutSearch && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setLayoutSearch('')}
                  edge="end"
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          체크된 레이아웃은 이 권한을 가진 사용자가 사용할 수 없습니다.
        </Typography>
        
        {Object.entries(groupedLayouts).map(([category, layouts]) => (
          <Accordion key={category} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LayoutIcon fontSize="small" />
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  {permissionCategories.layout[category] || category}
                </Typography>
                <Chip 
                  size="small" 
                  label={layouts.length} 
                  color="primary" 
                  variant="outlined" 
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <FormGroup>
                {layouts.map(layout => (
                  <FormControlLabel
                    key={layout.id}
                    control={
                      <Checkbox
                        checked={restrictions.layouts.includes(layout.id)}
                        onChange={(e) => handleLayoutChange(layout.id, e.target.checked)}
                        size="small"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {layout.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {layout.description}
                        </Typography>
                      </Box>
                    }
                  />
                ))}
              </FormGroup>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    );
  };

  return (
    <Paper variant="outlined" sx={{ mt: 2 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange}
          variant="fullWidth"
        >
          <Tab 
            icon={<MenuIcon />} 
            label="메뉴" 
            iconPosition="start"
          />
          <Tab 
            icon={<LayoutIcon />} 
            label="레이아웃" 
            iconPosition="start"
          />
          <Tab 
            icon={<ButtonIcon />} 
            label="버튼및데이터" 
            iconPosition="start"
          />
          <Tab 
            icon={<CssIcon />} 
            label="CSS적용" 
            iconPosition="start"
          />
        </Tabs>
      </Box>
      
      <Box sx={{ p: 2, maxHeight: 400, overflow: 'auto' }}>
        {currentTab === 0 && renderMenuTab()}
        {currentTab === 1 && renderLayoutTab()}
        {currentTab === 2 && renderButtonTab()}
        {currentTab === 3 && renderCssTab()}
      </Box>
      
      {/* 선택된 제한사항 요약 */}
      <Divider />
      <Box sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
          선택된 제한사항 요약
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip 
            size="small" 
            label={`메뉴: ${restrictions.menus.length}개`} 
            color="primary" 
            variant="outlined" 
          />
          <Chip 
            size="small" 
            label={`레이아웃: ${restrictions.layouts.length}개`} 
            color="info" 
            variant="outlined" 
          />
          <Chip 
            size="small" 
            label={`버튼및데이터: ${restrictions.buttons.length}개`} 
            color="secondary" 
            variant="outlined" 
          />
          <Chip 
            size="small" 
            label={`CSS: ${restrictions.cssSelectors.length}개`} 
            color="warning" 
            variant="outlined" 
          />
        </Box>
      </Box>
    </Paper>
  );
};

PermissionSettingsTabs.propTypes = {
  restrictions: PropTypes.shape({
    menus: PropTypes.array,
    buttons: PropTypes.array,
    layouts: PropTypes.array,
    cssSelectors: PropTypes.array
  }),
  onRestrictionsChange: PropTypes.func.isRequired
};

export default PermissionSettingsTabs; 
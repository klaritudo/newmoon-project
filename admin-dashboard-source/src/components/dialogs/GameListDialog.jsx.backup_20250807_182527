import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  InputAdornment,
  Switch,
  FormControlLabel,
  Tooltip,
  CircularProgress,
  Alert,
  Checkbox,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Close,
  Search,
  FilterList,
  Star,
  StarBorder,
  Whatshot,
  NewReleases,
  Edit,
  Api
} from '@mui/icons-material';
import gameService from '../../services/gameService';

const GameListDialog = ({ 
  open, 
  onClose, 
  vendorName, 
  vendorLogo,
  vendorCode,
  gameType = 'slot',
  tagMode = 'manual',
  onGameUpdate 
}) => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filterOptions, setFilterOptions] = useState({
    showActive: true,
    showInactive: true,
    showFeatured: false,
    showHot: false,
    showNew: false
  });
  const [editingGame, setEditingGame] = useState(null);
  const [selectedGames, setSelectedGames] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedApi, setSelectedApi] = useState('');
  const [availableApis] = useState(['Honor API']); // 추후 다른 API 추가 예정
  const [apiFilter, setApiFilter] = useState('all'); // API 필터 추가

  // 다이얼로그가 열릴 때 게임 목록 로드
  useEffect(() => {
    if (open && vendorCode) {
      loadGames();
      setSelectedGames([]);
      setSelectAll(false);
    }
  }, [open, vendorCode]);

  // 게임 목록 로드
  const loadGames = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await gameService.getGames({
        vendor: vendorCode,
        game_type: gameType
      });
      
      if (response.success && response.data) {
        // 데이터 확인을 위한 로그
        // console.log('=== 게임 데이터 로드 ===');
        // console.log('전체 게임 수:', response.data.length);
        // if (response.data.length > 0) {
        //   const sample = response.data[0];
        //   console.log('샘플 게임:', {
        //     id: sample.id,
        //     name: sample.game_name,
        //     is_featured: sample.is_featured,
        //     is_hot: sample.is_hot,
        //     is_new: sample.is_new,
        //     '타입 확인': {
        //       is_featured_type: typeof sample.is_featured,
        //       is_hot_type: typeof sample.is_hot,
        //       is_new_type: typeof sample.is_new
        //     }
        //   });
        // }
        
        // 데이터를 그대로 사용 (0, 1 number 값으로)
        setGames(response.data);
      } else {
        setGames([]);
      }
    } catch (err) {
      console.error('게임 목록 로드 실패:', err);
      setError('게임 목록을 불러오는데 실패했습니다.');
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  // 게임 상태 토글
  const handleToggleGameStatus = async (game) => {
    console.log('=== 게임 상태 토글 시작 ===');
    console.log('현재 게임 정보:', { 
      id: game.id, 
      name: game.game_name,
      is_active: game.is_active,
      is_active_type: typeof game.is_active,
      is_active_value: game.is_active === 1 ? 'true(1)' : 'false(0 or other)'
    });
    
    try {
      const newStatus = game.is_active !== 1;
      console.log('새로운 상태:', newStatus);
      
      const response = await gameService.updateGameStatus(game.id, newStatus);
      console.log('API 응답:', response);
      
      // response.success가 아닌 response.data.success를 체크해야 할 수도 있음
      if (response?.success || response?.data?.success) {
        console.log('API 응답 성공, 로컬 상태 업데이트');
        
        // 로컬 상태를 직접 업데이트 (게임사 토글과 동일한 방식)
        setGames(prevGames => prevGames.map(g => 
          g.id === game.id ? { ...g, is_active: newStatus ? 1 : 0 } : g
        ));
        
        // 부모 컴포넌트에 변경 알림
        if (onGameUpdate) {
          onGameUpdate(game.id, { is_active: newStatus ? 1 : 0 });
        }
      } else {
        console.error('API 응답 실패:', response);
        // 실패 시 알림 표시
        alert('게임 상태 변경에 실패했습니다.');
      }
    } catch (err) {
      console.error('게임 상태 업데이트 실패:', err);
      console.error('에러 상세:', {
        message: err.message,
        stack: err.stack,
        response: err.response
      });
      
      // 에러 발생 시 알림 표시
      alert('게임 상태 변경 중 오류가 발생했습니다.');
    }
    
    console.log('=== 게임 상태 토글 종료 ===');
  };

  // 게임 설정 업데이트
  const handleUpdateGame = async (game, updates) => {
    try {
      // console.log('게임 업데이트 요청:', { gameId: game.id, currentState: { 
      //   is_featured: game.is_featured, 
      //   is_hot: game.is_hot, 
      //   is_new: game.is_new 
      // }, updates });
      
      const response = await gameService.updateGameSettings(game.id, updates);
      
      if (response.success) {
        // 백엔드에서 반환한 업데이트된 게임 데이터 사용
        if (response.data) {
          // console.log('업데이트된 게임 데이터:', response.data);
          setGames(prev => prev.map(g => 
            g.id === game.id ? response.data : g
          ));
        } else {
          // 백엔드가 데이터를 반환하지 않는 경우 기존 방식 사용
          // console.log('업데이트 적용 (기존 방식):', updates);
          setGames(prev => prev.map(g => 
            g.id === game.id ? { ...g, ...updates } : g
          ));
        }
        
        setEditingGame(null);
        
        if (onGameUpdate) {
          onGameUpdate(game.id, updates);
        }
      }
    } catch (err) {
      console.error('게임 설정 업데이트 실패:', err);
    }
  };

  // 게임 선택/해제
  const handleToggleGame = (gameId) => {
    setSelectedGames(prev => {
      if (prev.includes(gameId)) {
        return prev.filter(id => id !== gameId);
      } else {
        return [...prev, gameId];
      }
    });
  };

  // 전체 선택/해제
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedGames([]);
    } else {
      setSelectedGames(filteredGames.map(game => game.id));
    }
    setSelectAll(!selectAll);
  };

  // 선택된 게임들 일괄 활성화/비활성화
  const handleBulkToggleStatus = async (activate) => {
    try {
      const promises = selectedGames.map(gameId => 
        gameService.updateGameStatus(gameId, activate)
      );
      
      const results = await Promise.allSettled(promises);
      
      // 성공한 요청 개수 확인
      const successCount = results.filter(result => 
        result.status === 'fulfilled' && 
        (result.value?.success || result.value?.data?.success)
      ).length;
      
      if (successCount > 0) {
        // 상태 업데이트 (number 타입으로 저장)
        setGames(prev => prev.map(game => 
          selectedGames.includes(game.id) 
            ? { ...game, is_active: activate ? 1 : 0 } 
            : game
        ));
        
        alert(`${successCount}개 게임의 상태가 변경되었습니다.`);
      }
      
      if (successCount < selectedGames.length) {
        alert(`${selectedGames.length - successCount}개 게임의 상태 변경에 실패했습니다.`);
      }
      
      setSelectedGames([]);
      setSelectAll(false);
    } catch (err) {
      console.error('일괄 상태 업데이트 실패:', err);
      alert('일괄 상태 변경 중 오류가 발생했습니다.');
    }
  };

  // 선택된 게임들 일괄 태그 업데이트
  const handleBulkUpdateTags = async (tagType, value) => {
    try {
      const updates = {};
      if (tagType === 'featured') updates.is_featured = value;
      if (tagType === 'hot') updates.is_hot = value;
      if (tagType === 'new') updates.is_new = value;
      
      const promises = selectedGames.map(gameId => {
        const game = games.find(g => g.id === gameId);
        return gameService.updateGameSettings(gameId, updates);
      });
      
      await Promise.all(promises);
      
      // 상태 업데이트
      setGames(prev => prev.map(game => 
        selectedGames.includes(game.id) 
          ? { ...game, ...updates } 
          : game
      ));
      
      // 성공 메시지
      const tagName = tagType === 'featured' ? '추천' : tagType === 'hot' ? '인기' : '신규';
      alert(`${selectedGames.length}개 게임을 ${tagName} 게임으로 설정했습니다.`);
      
      setSelectedGames([]);
      setSelectAll(false);
    } catch (err) {
      console.error('일괄 태그 업데이트 실패:', err);
    }
  };

  // 선택된 게임들 일괄 API 변경
  const handleBulkChangeAPI = async (targetApi) => {
    if (!targetApi || selectedGames.length === 0) return;
    
    try {
      // console.log(`선택된 ${selectedGames.length}개 게임을 ${targetApi}로 변경`);
      
      // TODO: 실제 API 변경 로직 구현
      // 현재는 로그만 출력
      alert(`${selectedGames.length}개 게임을 ${targetApi}로 변경하는 기능은 백엔드 구현이 필요합니다.`);
      
      // 선택 초기화
      setSelectedGames([]);
      setSelectAll(false);
      setSelectedApi('');
    } catch (err) {
      console.error('일괄 API 변경 실패:', err);
    }
  };

  // 모든 태그 해제
  const handleClearAllTags = async () => {
    if (tagMode !== 'manual') {
      alert('수동 모드에서만 태그를 해제할 수 있습니다.');
      return;
    }
    
    if (!window.confirm('모든 게임의 추천/인기/신규 태그를 해제하시겠습니까?')) {
      return;
    }
    
    try {
      const response = await gameService.clearAllTags(gameType);
      
      if (response.success) {
        // 현재 게임 목록의 태그 상태 업데이트
        setGames(prev => prev.map(game => ({
          ...game,
          is_featured: 0,
          is_hot: 0,
          is_new: 0
        })));
        
        alert(response.message);
      }
    } catch (err) {
      console.error('태그 해제 실패:', err);
      alert('태그 해제에 실패했습니다.');
    }
  };

  // 필터링된 게임 목록
  const filteredGames = games.filter(game => {
    // 검색어 필터
    if (searchText) {
      const search = searchText.toLowerCase();
      if (!game.game_name?.toLowerCase().includes(search) && 
          !game.game_name_ko?.toLowerCase().includes(search) &&
          !game.game_code?.toLowerCase().includes(search)) {
        return false;
      }
    }

    // API 필터
    if (apiFilter !== 'all') {
      // 현재는 모든 게임이 Honor API를 사용하므로 Honor API 선택 시 모두 표시
      if (apiFilter === 'Honor API') {
        // Honor API 필터 선택 시 모든 게임 표시
      } else {
        // 다른 API 선택 시 해당하는 게임이 없으므로 false 반환
        return false;
      }
    }

    // 상태 필터
    if (!filterOptions.showActive && game.is_active === 1) return false;
    if (!filterOptions.showInactive && game.is_active !== 1) return false;
    
    // 특수 필터
    if (filterOptions.showFeatured && !game.is_featured) return false;
    if (filterOptions.showHot && !game.is_hot) return false;
    if (filterOptions.showNew && !game.is_new) return false;

    return true;
  });
  
  // 필터링 디버깅
  // useEffect(() => {
  //   console.log('=== 필터링 디버깅 ===');
  //   console.log('전체 게임 수:', games.length);
  //   console.log('필터링된 게임 수:', filteredGames.length);
  //   console.log('필터 옵션:', filterOptions);
  //   if (games.length > 0) {
  //     const sampleGame = games[0];
  //     console.log('샘플 게임 상태:', {
  //       id: sampleGame.id,
  //       name: sampleGame.game_name,
  //       is_active: sampleGame.is_active,
  //       '활성 필터 적용': filterOptions.showActive && sampleGame.is_active === 1,
  //       '비활성 필터 적용': filterOptions.showInactive && sampleGame.is_active !== 1
  //     });
  //   }
  // }, [games, filteredGames, filterOptions]);
  
  // games 상태 변경 감지
  // useEffect(() => {
  //   console.log('=== games 상태 변경 감지 ===');
  //   console.log('games 배열이 변경되었습니다. 길이:', games.length);
  //   if (games.length > 0) {
  //     console.log('첫 번째 게임:', games[0]);
  //   }
  // }, [games]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { height: '90vh' }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {vendorLogo && (
            <Box
              sx={{
                width: 48,
                height: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 1,
                bgcolor: 'grey.100'
              }}
            >
              {typeof vendorLogo === 'string' ? (
                <img src={vendorLogo} alt={vendorName} style={{ maxWidth: '100%', maxHeight: '100%' }} />
              ) : (
                <Typography variant="h6">{vendorLogo}</Typography>
              )}
            </Box>
          )}
          <Box>
            <Typography variant="h6">{vendorName} 게임 목록</Typography>
            <Typography variant="caption" color="text.secondary">
              총 {filteredGames.length}개 / {games.length}개 게임
            </Typography>
          </Box>
          {tagMode === 'manual' && (
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={handleClearAllTags}
              sx={{ ml: 2 }}
            >
              모든 태그 해제
            </Button>
          )}
        </Box>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* 검색 및 필터 영역 */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* 검색창 */}
            <TextField
              size="small"
              placeholder="게임 검색..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              sx={{ width: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
              }}
            />
            
            {/* API 필터 */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={apiFilter}
                onChange={(e) => setApiFilter(e.target.value)}
                displayEmpty
              >
                <MenuItem value="all">전체 API</MenuItem>
                {availableApis.map(api => (
                  <MenuItem key={api} value={api}>{api}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {/* 필터 스위치들 */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', flex: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={filterOptions.showActive}
                    onChange={(e) => setFilterOptions(prev => ({ ...prev, showActive: e.target.checked }))}
                  />
                }
                label="활성"
              />
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={filterOptions.showInactive}
                    onChange={(e) => setFilterOptions(prev => ({ ...prev, showInactive: e.target.checked }))}
                  />
                }
                label="비활성"
              />
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={filterOptions.showFeatured}
                    onChange={(e) => setFilterOptions(prev => ({ ...prev, showFeatured: e.target.checked }))}
                  />
                }
                label="추천"
              />
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={filterOptions.showHot}
                    onChange={(e) => setFilterOptions(prev => ({ ...prev, showHot: e.target.checked }))}
                  />
                }
                label="인기"
              />
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={filterOptions.showNew}
                    onChange={(e) => setFilterOptions(prev => ({ ...prev, showNew: e.target.checked }))}
                  />
                }
                label="신규"
              />
            </Box>
          </Box>
          
        </Box>

        {/* 일괄 작업 영역 */}
        {selectedGames.length > 0 && (
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'primary.50' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body2">
                {selectedGames.length}개 게임 선택됨
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleBulkToggleStatus(true)}
                >
                  선택 게임 활성화
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleBulkToggleStatus(false)}
                >
                  선택 게임 비활성화
                </Button>
                
                <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                
                {/* 일괄 태그 설정 */}
                <Tooltip title="선택한 게임을 추천 게임으로 설정">
                  <IconButton 
                    size="small"
                    color="primary"
                    onClick={() => handleBulkUpdateTags('featured', true)}
                  >
                    <Star />
                  </IconButton>
                </Tooltip>
                <Tooltip title="선택한 게임을 인기 게임으로 설정">
                  <IconButton 
                    size="small"
                    color="error"
                    onClick={() => handleBulkUpdateTags('hot', true)}
                  >
                    <Whatshot />
                  </IconButton>
                </Tooltip>
                <Tooltip title="선택한 게임을 신규 게임으로 설정">
                  <IconButton 
                    size="small"
                    color="success"
                    onClick={() => handleBulkUpdateTags('new', true)}
                  >
                    <NewReleases />
                  </IconButton>
                </Tooltip>
                
                <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                
                {/* API 선택 */}
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>API 선택</InputLabel>
                    <Select
                      value={selectedApi}
                      onChange={(e) => setSelectedApi(e.target.value)}
                      label="API 선택"
                    >
                      <MenuItem value="">선택</MenuItem>
                      {availableApis.map(api => (
                        <MenuItem key={api} value={api}>{api}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => handleBulkChangeAPI(selectedApi)}
                    disabled={!selectedApi}
                    startIcon={<Api />}
                  >
                    API 변경
                  </Button>
                </Box>
                
                <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    setSelectedGames([]);
                    setSelectAll(false);
                  }}
                >
                  선택 해제
                </Button>
              </Box>
            </Box>
          </Box>
        )}

        {/* 게임 목록 */}
        <Box sx={{ p: 2, height: selectedGames.length > 0 ? 'calc(100% - 200px)' : 'calc(100% - 140px)', overflow: 'auto' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
          ) : filteredGames.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                {searchText ? '검색 결과가 없습니다.' : '게임이 없습니다.'}
              </Typography>
            </Box>
          ) : (
            <>
              {/* 전체 선택 */}
              <Box sx={{ mb: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectAll && selectedGames.length === filteredGames.length}
                      indeterminate={selectedGames.length > 0 && selectedGames.length < filteredGames.length}
                      onChange={handleSelectAll}
                    />
                  }
                  label={`전체 선택 (${filteredGames.length}개)`}
                />
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
              {filteredGames.map((game) => {
                // 첫 번째 게임의 태그 값 디버깅
                // if (filteredGames.indexOf(game) === 0) {
                //   console.log('첫 번째 게임 태그 상태:', {
                //     id: game.id,
                //     is_featured: game.is_featured,
                //     is_hot: game.is_hot,
                //     is_new: game.is_new,
                //     '조건 체크': {
                //       'is_featured === 1': game.is_featured === 1,
                //       'is_hot === 1': game.is_hot === 1,
                //       'is_new === 1': game.is_new === 1
                //     }
                //   });
                // }
                
                return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={game.id}>
                  <Card sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    opacity: Boolean(game.is_active) ? 1 : 0.6,
                    transition: 'all 0.3s',
                    position: 'relative',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3
                    }
                  }}>
                    {/* 체크박스 */}
                    <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }}>
                      <Checkbox
                        checked={selectedGames.includes(game.id)}
                        onChange={() => handleToggleGame(game.id)}
                        sx={{ 
                          bgcolor: 'rgba(255, 255, 255, 0.8)',
                          '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.95)' }
                        }}
                      />
                    </Box>
                    
                    {/* 상단 뱃지 (추천/인기/신규) */}
                    <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1, display: 'flex', gap: 0.5 }}>
                      {game.is_featured === 1 && (
                        <Box sx={{ 
                          bgcolor: 'primary.main',
                          color: 'white',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          boxShadow: 2
                        }}>
                          <Star sx={{ fontSize: 14 }} />
                          추천
                        </Box>
                      )}
                      {game.is_hot === 1 && (
                        <Box sx={{ 
                          bgcolor: 'error.main',
                          color: 'white',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          boxShadow: 2
                        }}>
                          <Whatshot sx={{ fontSize: 14 }} />
                          인기
                        </Box>
                      )}
                      {game.is_new === 1 && (
                        <Box sx={{ 
                          bgcolor: 'success.main',
                          color: 'white',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          boxShadow: 2
                        }}>
                          <NewReleases sx={{ fontSize: 14 }} />
                          신규
                        </Box>
                      )}
                    </Box>
                    
                    <CardMedia
                      component="img"
                      height="160"
                      image={game.thumbnail_url || '/images/game-placeholder.png'}
                      alt={game.game_name}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                      <Typography variant="subtitle2" gutterBottom noWrap>
                        {game.game_name_ko || game.game_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" noWrap>
                        {game.game_code}
                      </Typography>
                      
                      {/* API 정보 표시 */}
                      <Chip
                        icon={<Api sx={{ fontSize: 14 }} />}
                        label={game.api || "Honor API"}
                        size="small"
                        sx={{ mt: 1 }}
                        variant="outlined"
                      />

                      {/* RTP 정보 */}
                      {game.rtp && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          RTP: {game.rtp}%
                        </Typography>
                      )}
                    </CardContent>
                    
                    <CardActions sx={{ px: 2, pb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                        <FormControlLabel
                          control={
                            <Switch
                              size="small"
                              checked={Boolean(game.is_active)}
                              onChange={(e) => {
                                e.stopPropagation();
                                console.log('=== Switch onChange 이벤트 ===');
                                console.log('게임 ID:', game.id);
                                console.log('현재 is_active:', game.is_active);
                                console.log('Switch checked 값:', e.target.checked);
                                console.log('게임 전체 정보:', game);
                                handleToggleGameStatus(game);
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            />
                          }
                          label={Boolean(game.is_active) ? '활성' : '비활성'}
                          labelPlacement="end"
                          sx={{ m: 0 }}
                        />
                        
                        <Box sx={{ display: 'flex', gap: 0.5, ml: 'auto' }}>
                          {/* 추천 토글 */}
                          <Tooltip title={game.is_featured === 1 ? "추천 게임 해제" : "추천 게임 설정"}>
                            <IconButton
                              size="small"
                              onClick={() => {
                                // console.log('추천 버튼 클릭:', {
                                //   현재값: game.is_featured,
                                //   새값: game.is_featured === 1 ? 0 : 1
                                // });
                                handleUpdateGame(game, { is_featured: game.is_featured === 1 ? 0 : 1 });
                              }}
                              sx={{
                                '& .MuiSvgIcon-root': {
                                  color: game.is_featured === 1 ? '#1976d2' : '#9e9e9e'
                                },
                                '&:hover': {
                                  backgroundColor: 'rgba(25, 118, 210, 0.08)'
                                }
                              }}
                            >
                              {game.is_featured === 1 ? <Star /> : <StarBorder />}
                            </IconButton>
                          </Tooltip>
                          
                          {/* 인기 토글 */}
                          <Tooltip title={game.is_hot === 1 ? "인기 게임 해제" : "인기 게임 설정"}>
                            <IconButton
                              size="small"
                              onClick={() => handleUpdateGame(game, { is_hot: game.is_hot === 1 ? 0 : 1 })}
                              sx={{
                                '& .MuiSvgIcon-root': {
                                  color: game.is_hot === 1 ? '#f44336' : '#9e9e9e'
                                },
                                '&:hover': {
                                  backgroundColor: 'rgba(244, 67, 54, 0.08)'
                                }
                              }}
                            >
                              <Whatshot />
                            </IconButton>
                          </Tooltip>
                          
                          {/* 신규 토글 */}
                          <Tooltip title={game.is_new === 1 ? "신규 게임 해제" : "신규 게임 설정"}>
                            <IconButton
                              size="small"
                              onClick={() => handleUpdateGame(game, { is_new: game.is_new === 1 ? 0 : 1 })}
                              sx={{
                                '& .MuiSvgIcon-root': {
                                  color: game.is_new === 1 ? '#4caf50' : '#9e9e9e'
                                },
                                '&:hover': {
                                  backgroundColor: 'rgba(76, 175, 80, 0.08)'
                                }
                              }}
                            >
                              <NewReleases />
                            </IconButton>
                          </Tooltip>
                          
                          {/* 설정 버튼 */}
                          <Tooltip title="게임 설정">
                            <IconButton 
                              size="small"
                              onClick={() => setEditingGame(game)}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </CardActions>
                  </Card>
                </Grid>
              );
              })}
            </Grid>
            </>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={onClose}>닫기</Button>
      </DialogActions>

      {/* 게임 편집 다이얼로그 */}
      {editingGame && (
        <Dialog
          open={Boolean(editingGame)}
          onClose={() => setEditingGame(null)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>게임 설정</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="게임명 (한국어)"
                value={editingGame.game_name_ko || ''}
                onChange={(e) => setEditingGame(prev => ({ ...prev, game_name_ko: e.target.value }))}
                margin="normal"
              />
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!editingGame.is_featured}
                      onChange={(e) => setEditingGame(prev => ({ ...prev, is_featured: e.target.checked }))}
                    />
                  }
                  label="추천 게임"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!editingGame.is_hot}
                      onChange={(e) => setEditingGame(prev => ({ ...prev, is_hot: e.target.checked }))}
                    />
                  }
                  label="인기 게임"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!editingGame.is_new}
                      onChange={(e) => setEditingGame(prev => ({ ...prev, is_new: e.target.checked }))}
                    />
                  }
                  label="신규 게임"
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditingGame(null)}>취소</Button>
            <Button 
              variant="contained"
              onClick={() => handleUpdateGame(editingGame, {
                game_name_ko: editingGame.game_name_ko,
                is_featured: !!editingGame.is_featured,
                is_hot: !!editingGame.is_hot,
                is_new: !!editingGame.is_new
              })}
            >
              저장
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Dialog>
  );
};

export default GameListDialog;
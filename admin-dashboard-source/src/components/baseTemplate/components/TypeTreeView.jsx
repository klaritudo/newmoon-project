import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Chip, Stack, IconButton, Tooltip } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

/**
 * 유형 계층 구조를 트리 형태로 표시하는 컴포넌트
 * 
 * @param {Object} props
 * @param {Object} props.types - 유형 정의 객체 (예: { 'super': { label: '슈퍼', color: 'red' } })
 * @param {Object} props.typeHierarchy - 유형 계층 구조 (예: { 'super': ['hq'], 'hq': ['subhq'] })
 * @param {Object} props.expandedTypes - 펼쳐진 유형 목록
 * @param {Function} props.onTypeToggle - 유형 접기/펴기 핸들러
 * @param {Function} props.onExpandAll - 모든 유형 펼치기/접기 핸들러
 * @param {string} props.direction - 표시 방향 ('horizontal' 또는 'vertical', 기본값: 'horizontal')
 * @param {Object} props.sx - 추가 스타일 속성
 */
const TypeTreeView = ({
  types = {},
  typeHierarchy = {},
  expandedTypes = {},
  onTypeToggle,
  onExpandAll,
  direction = 'horizontal',
  sx = {}
}) => {
  // 모든 유형이 펼쳐진 상태인지 확인
  const isAllExpanded = Object.keys(types).length > 0 && 
    Object.keys(types).every(typeId => expandedTypes[typeId]);
  
  // 최상위 유형 찾기 (다른 유형의 자식이 아닌 유형)
  const rootTypeIds = Object.keys(typeHierarchy).filter(typeId => {
    return !Object.values(typeHierarchy).some(children => 
      children.includes(typeId)
    );
  });
  
  // 주어진 유형의 전체 경로를 계산
  const getTypePath = (typeId, path = []) => {
    const newPath = [...path, typeId];
    
    const childTypeIds = typeHierarchy[typeId] || [];
    if (childTypeIds.length === 0) {
      return [newPath];
    }
    
    return childTypeIds.flatMap(childTypeId => 
      getTypePath(childTypeId, newPath)
    );
  };
  
  // 모든 유형 경로 계산
  const allPaths = rootTypeIds.flatMap(rootTypeId => 
    getTypePath(rootTypeId)
  );

  // 가로 모드 렌더링
  const renderHorizontal = () => (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{
        flexWrap: 'wrap',
        gap: 0.5,
        py: 1,
        ...sx
      }}
    >
      {/* 모든 유형 펼치기/접기 버튼 */}
      {onExpandAll && (
        <Tooltip title={isAllExpanded ? '모든 유형 접기' : '모든 유형 펼치기'}>
          <IconButton 
            size="small" 
            onClick={() => onExpandAll(!isAllExpanded)}
            sx={{ mr: 1 }}
          >
            {isAllExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Tooltip>
      )}
      
      {/* 유형 경로 표시 */}
      {allPaths.map((path, pathIndex) => (
        <Stack 
          key={`path-${pathIndex}`} 
          direction="row" 
          alignItems="center" 
          spacing={0.5}
          sx={{ 
            flexWrap: 'nowrap',
            mb: 0.5,
            mr: 1,
            borderRadius: 1,
            px: 1,
            py: 0.5,
            bgcolor: 'background.default',
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          {path.map((typeId, index) => (
            <React.Fragment key={typeId}>
              <Chip
                label={types[typeId]?.label || typeId}
                color={types[typeId]?.color || 'default'}
                size="small"
                variant={expandedTypes[typeId] ? "filled" : "outlined"}
                onClick={() => onTypeToggle && onTypeToggle(typeId)}
                icon={
                  typeHierarchy[typeId]?.length > 0 ? (
                    expandedTypes[typeId] 
                      ? <KeyboardArrowDownIcon /> 
                      : <KeyboardArrowRightIcon />
                  ) : undefined
                }
                sx={{ 
                  minWidth: 80,
                  backgroundColor: types[typeId]?.backgroundColor || undefined,
                  borderColor: types[typeId]?.borderColor || undefined,
                  color: types[typeId]?.borderColor || undefined,
                  border: types[typeId]?.borderColor ? `1px solid ${types[typeId]?.borderColor}` : undefined,
                  '& .MuiChip-label': {
                    color: types[typeId]?.borderColor || undefined
                  },
                  '& .MuiChip-icon': {
                    color: types[typeId]?.borderColor || undefined
                  }
                }}
              />
              {index < path.length - 1 && (
                <Typography variant="body2" color="text.secondary">
                  &gt;
                </Typography>
              )}
            </React.Fragment>
          ))}
        </Stack>
      ))}
    </Stack>
  );
  
  // 트리 노드 재귀적 렌더링 (세로 모드용)
  const renderTreeNode = (typeId, level = 0) => {
    const typeInfo = types[typeId] || { label: typeId, color: 'default' };
    const childTypeIds = typeHierarchy[typeId] || [];
    const isExpanded = expandedTypes[typeId];
    
    return (
      <Box key={typeId} sx={{ ml: level * 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
          <Chip
            label={typeInfo.label}
            color={typeInfo.color}
            size="small"
            variant={isExpanded ? "filled" : "outlined"}
            onClick={() => onTypeToggle && onTypeToggle(typeId)}
            icon={
              childTypeIds.length > 0 ? (
                isExpanded 
                  ? <KeyboardArrowDownIcon /> 
                  : <KeyboardArrowRightIcon />
              ) : undefined
            }
            sx={{ 
              minWidth: 80,
              backgroundColor: typeInfo.backgroundColor || undefined,
              borderColor: typeInfo.borderColor || undefined,
              color: typeInfo.borderColor || undefined,
              border: typeInfo.borderColor ? `1px solid ${typeInfo.borderColor}` : undefined,
              '& .MuiChip-label': {
                color: typeInfo.borderColor || undefined
              },
              '& .MuiChip-icon': {
                color: typeInfo.borderColor || undefined
              }
            }}
          />
        </Box>
        
        {isExpanded && childTypeIds.length > 0 && (
          <Box sx={{ ml: 2 }}>
            {childTypeIds.map(childTypeId => 
              renderTreeNode(childTypeId, level + 1)
            )}
          </Box>
        )}
      </Box>
    );
  };
  
  // 세로 모드 렌더링
  const renderVertical = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        p: 1,
        ...sx
      }}
    >
      {/* 모든 유형 펼치기/접기 버튼 */}
      {onExpandAll && (
        <Box sx={{ mb: 1 }}>
          <Tooltip title={isAllExpanded ? '모든 유형 접기' : '모든 유형 펼치기'}>
            <IconButton 
              size="small" 
              onClick={() => onExpandAll(!isAllExpanded)}
            >
              {isAllExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Tooltip>
          <Typography variant="caption" sx={{ ml: 1 }}>
            {isAllExpanded ? '모든 유형 접기' : '모든 유형 펼치기'}
          </Typography>
        </Box>
      )}
      
      {/* 트리 구조 표시 */}
      {rootTypeIds.map(rootTypeId => 
        renderTreeNode(rootTypeId)
      )}
    </Box>
  );
  
  return direction === 'horizontal' ? renderHorizontal() : renderVertical();
};

TypeTreeView.propTypes = {
  types: PropTypes.object,
  typeHierarchy: PropTypes.object,
  expandedTypes: PropTypes.object,
  onTypeToggle: PropTypes.func,
  onExpandAll: PropTypes.func,
  direction: PropTypes.oneOf(['horizontal', 'vertical']),
  sx: PropTypes.object
};

export default TypeTreeView; 
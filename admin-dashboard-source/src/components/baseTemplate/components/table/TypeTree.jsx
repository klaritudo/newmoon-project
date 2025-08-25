import React from 'react';
import PropTypes from 'prop-types';
import { Box, Chip, IconButton } from '@mui/material';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

/**
 * 테이블 셀 내에서 계층 구조를 표시하는 컴포넌트
 * 들여쓰기와 확장/축소 버튼을 제공합니다.
 * 
 * @param {Object} props
 * @param {Object} props.item - 현재 행 데이터
 * @param {number} props.level - 들여쓰기 레벨 (0부터 시작)
 * @param {boolean} props.expanded - 확장 여부
 * @param {Function} props.onToggle - 확장/축소 토글 핸들러
 * @param {boolean} props.hasChildren - 자식 항목 존재 여부
 * @param {Object} props.typeInfo - 유형 정보 객체 (label, color)
 * @param {boolean} props.indentMode - 들여쓰기 모드 사용 여부
 * @param {number} props.indentSize - 들여쓰기 크기 (픽셀)
 * @param {boolean} props.showToggleIcon - 확장/축소 아이콘 표시 여부
 * @param {Object} props.sx - 추가 스타일 속성
 */
const TypeTree = ({
  item,
  level = 0,
  expanded = false,
  onToggle,
  hasChildren = false,
  typeInfo = { label: '', color: 'default' },
  indentMode = true,
  indentSize = 20,
  showToggleIcon = true,
  sx = {}
}) => {
  // 들여쓰기 계산
  const indentWidth = indentMode ? level * indentSize : 0;
  
  // 확장/축소 아이콘
  const ExpandIcon = expanded ? KeyboardArrowDownIcon : KeyboardArrowRightIcon;
  
  // 토글 핸들러
  const handleToggle = (e) => {
    e.stopPropagation(); // 행 클릭 이벤트 버블링 방지
    if (onToggle && item?.id !== undefined) {
      onToggle(item.id);
    }
  };
  
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        pl: indentWidth / 8, // MUI의 간격 단위로 변환 (8px = 1)
        position: 'relative',
        width: '100%',
        ...sx
      }}
    >
      {/* 확장/축소 아이콘 */}
      {showToggleIcon && (hasChildren || level > 0) && (
        <IconButton
          size="small"
          onClick={handleToggle}
          sx={{ 
            p: 0.5,
            mr: 0.5
          }}
        >
          <ExpandIcon fontSize="small" />
        </IconButton>
      )}
      
      {/* 유형 칩 */}
      <Chip
        label={typeInfo.label || ''}
        size="small"
        variant="outlined"
        sx={{ 
          height: 24,
          backgroundColor: typeInfo.backgroundColor,
          borderColor: typeInfo.borderColor,
          color: typeInfo.borderColor,
          border: typeInfo.borderColor ? `1px solid ${typeInfo.borderColor}` : undefined,
          '& .MuiChip-label': {
            px: 1,
            fontSize: '0.75rem',
            color: typeInfo.borderColor
          }
        }}
      />
    </Box>
  );
};

TypeTree.propTypes = {
  item: PropTypes.object.isRequired,
  level: PropTypes.number,
  expanded: PropTypes.bool,
  onToggle: PropTypes.func,
  hasChildren: PropTypes.bool,
  typeInfo: PropTypes.shape({
    label: PropTypes.string,
    color: PropTypes.string,
    backgroundColor: PropTypes.string,
    borderColor: PropTypes.string
  }),
  indentMode: PropTypes.bool,
  indentSize: PropTypes.number,
  showToggleIcon: PropTypes.bool,
  sx: PropTypes.object
};

export default TypeTree; 
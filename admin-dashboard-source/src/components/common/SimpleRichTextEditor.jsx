import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  ToggleButtonGroup, 
  ToggleButton, 
  Paper, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Popover,
  IconButton,
  Divider,
  Button
} from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatColorTextIcon from '@mui/icons-material/FormatColorText';
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CodeIcon from '@mui/icons-material/Code';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';

/**
 * 향상된 리치 텍스트 에디터 (React 18 호환)
 * HTML 기반 에디터로 다양한 포맷팅 기능 지원
 */
const SimpleRichTextEditor = React.memo(({ 
  value, 
  onChange, 
  label = '내용', 
  height = 300,
  required = false,
  placeholder = '내용을 입력해주세요...',
  onImageInsert
}) => {
  const [editorValue, setEditorValue] = useState(value || '');
  const [viewMode, setViewMode] = useState('editor'); // 'editor' | 'preview'
  const [colorAnchorEl, setColorAnchorEl] = useState(null);
  const [backgroundAnchorEl, setBackgroundAnchorEl] = useState(null);
  const [fontSize, setFontSize] = useState('medium');
  const editorRef = useRef(null);
  const textareaRef = useRef(null);

  // 색상 팔레트
  const colorPalette = [
    '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF',
    '#FF0000', '#FF9900', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF',
    '#9900FF', '#FF00FF', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43'
  ];

  // 폰트 크기 옵션
  const fontSizeOptions = [
    { value: 'small', label: '소 (12px)', size: '12px' },
    { value: 'medium', label: '중 (16px)', size: '16px' },
    { value: 'large', label: '대 (20px)', size: '20px' },
    { value: 'x-large', label: '특대 (24px)', size: '24px' }
  ];

  // 초기값 설정 및 외부 value 변경 감지
  useEffect(() => {
    if (editorRef.current && value !== undefined) {
      // 현재 에디터의 HTML과 새로운 value가 다를 때만 업데이트
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value;
        setEditorValue(value);
      }
    }
  }, [value]); // value가 변경될 때마다 실행

  // 커서 위치 저장 함수
  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      return selection.getRangeAt(0);
    }
    return null;
  };

  // 커서 위치 복원 함수
  const restoreSelection = (range) => {
    if (range && editorRef.current) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  // contentEditable 내용 변경 핸들러
  const handleEditorChange = useCallback(() => {
    if (editorRef.current) {
      const newValue = editorRef.current.innerHTML;
      setEditorValue(newValue);
      if (onChange) {
        onChange(newValue);
      }
    }
  }, [onChange]);

  // 텍스트 영역 변경 핸들러 (HTML 소스 편집 모드)
  const handleTextareaChange = (event) => {
    const newValue = event.target.value;
    setEditorValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  // HTML 명령 실행 함수
  const execCommand = useCallback((command, value = null) => {
    if (viewMode !== 'editor') return;
    
    document.execCommand(command, false, value);
    handleEditorChange();
    
    // 에디터에 포커스 유지
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, [viewMode, handleEditorChange]);

  // 기본 포맷팅 핸들러
  const handleFormat = (format) => {
    switch (format) {
      case 'bold':
        execCommand('bold');
        break;
      case 'italic':
        execCommand('italic');
        break;
      case 'underline':
        execCommand('underline');
        break;
      case 'bullet':
        execCommand('insertUnorderedList');
        break;
      case 'number':
        execCommand('insertOrderedList');
        break;
      default:
        break;
    }
  };

  // 폰트 크기 변경 핸들러
  const handleFontSizeChange = (event) => {
    const size = event.target.value;
    setFontSize(size);
    
    const sizeMap = {
      'small': '1',
      'medium': '3', 
      'large': '5',
      'x-large': '7'
    };
    
    execCommand('fontSize', sizeMap[size]);
  };

  // 텍스트 색상 변경
  const handleTextColor = (color) => {
    execCommand('foreColor', color);
    setColorAnchorEl(null);
  };

  // 배경색 변경
  const handleBackgroundColor = (color) => {
    execCommand('hiliteColor', color);
    setBackgroundAnchorEl(null);
  };

  // 이미지 삽입 핸들러
  const handleImageInsert = () => {
    if (onImageInsert) {
      onImageInsert();
    }
  };

  return (
    <Box sx={{ mb: 2, mt: 2 }}>
      {label && (
        <Typography 
          variant="body1" 
          sx={{ mb: 1, fontWeight: required ? 'bold' : 'normal' }}
        >
          {label} {required && <Box component="span" sx={{ color: 'error.main' }}>*</Box>}
        </Typography>
      )}
      
      <Paper 
        elevation={1} 
        sx={{ 
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          overflow: 'hidden'
        }}
      >
        {/* 향상된 툴바 */}
        <Box 
          sx={{ 
            p: 1, 
            borderBottom: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'grey.50',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            alignItems: 'center'
          }}
        >
          {/* 기본 포맷팅 버튼들 */}
          <ToggleButtonGroup size="small">
            <ToggleButton 
              value="bold" 
              onClick={() => handleFormat('bold')}
              title="굵게 (Ctrl+B)"
            >
              <FormatBoldIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton 
              value="italic" 
              onClick={() => handleFormat('italic')}
              title="기울임 (Ctrl+I)"
            >
              <FormatItalicIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton 
              value="underline" 
              onClick={() => handleFormat('underline')}
              title="밑줄 (Ctrl+U)"
            >
              <FormatUnderlinedIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
          
          <Divider orientation="vertical" flexItem />
          
          {/* 리스트 버튼들 */}
          <ToggleButtonGroup size="small">
            <ToggleButton 
              value="bullet" 
              onClick={() => handleFormat('bullet')}
              title="글머리 기호"
            >
              <FormatListBulletedIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton 
              value="number" 
              onClick={() => handleFormat('number')}
              title="번호 매기기"
            >
              <FormatListNumberedIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
          
          <Divider orientation="vertical" flexItem />
          
          {/* 폰트 크기 선택 */}
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <Select
              value={fontSize}
              onChange={handleFontSizeChange}
              displayEmpty
              variant="outlined"
              disabled={viewMode !== 'editor'}
            >
              {fontSizeOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {/* 텍스트 색상 버튼 */}
          <IconButton
            size="small"
            onClick={(e) => setColorAnchorEl(e.currentTarget)}
            title="텍스트 색상"
            disabled={viewMode !== 'editor'}
          >
            <FormatColorTextIcon fontSize="small" />
          </IconButton>
          
          {/* 배경색 버튼 */}
          <IconButton
            size="small"
            onClick={(e) => setBackgroundAnchorEl(e.currentTarget)}
            title="배경색"
            disabled={viewMode !== 'editor'}
          >
            <FormatColorFillIcon fontSize="small" />
          </IconButton>
          
          {/* 이미지 삽입 버튼 */}
          {onImageInsert && (
            <IconButton
              size="small"
              onClick={handleImageInsert}
              title="이미지 삽입"
              disabled={viewMode !== 'editor'}
            >
              <InsertPhotoIcon fontSize="small" />
            </IconButton>
          )}
          
          <Divider orientation="vertical" flexItem />
          
          {/* 미리보기/편집 모드 토글 */}
          <ToggleButtonGroup 
            size="small" 
            value={viewMode} 
            exclusive 
            onChange={(e, newMode) => {
              if (newMode !== null) {
                setViewMode(newMode);
              }
            }}
          >
            <ToggleButton value="editor" title="편집 모드">
              <CodeIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="preview" title="미리보기 모드">
              <VisibilityIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* 에디터 영역 */}
        {viewMode === 'editor' ? (
          <Box
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleEditorChange}
            onBlur={handleEditorChange}
            sx={{
              padding: '16px',
              minHeight: height,
              maxHeight: height,
              overflowY: 'auto',
              fontSize: '16px',
              lineHeight: '1.6',
              fontFamily: '"Noto Sans KR", "Roboto", sans-serif',
              border: 'none',
              outline: 'none',
              '&:empty:before': {
                content: `"${placeholder}"`,
                color: 'text.secondary',
                fontStyle: 'italic'
              },
              '& img': {
                width: '100%',
                height: 'auto',
                display: 'block',
                margin: '0'
              }
            }}
          />
        ) : (
          <Box
            sx={{
              padding: '16px',
              minHeight: height,
              maxHeight: height,
              overflowY: 'auto',
              fontSize: '16px',
              lineHeight: '1.6',
              fontFamily: '"Noto Sans KR", "Roboto", sans-serif',
              backgroundColor: 'grey.50',
              '& img': {
                width: '100%',
                height: 'auto',
                display: 'block',
                margin: '0'
              }
            }}
            dangerouslySetInnerHTML={{ __html: editorValue || `<p style="color: #999; font-style: italic;">${placeholder}</p>` }}
          />
        )}
      </Paper>
      
      {/* 색상 팔레트 팝오버 - 텍스트 색상 */}
      <Popover
        open={Boolean(colorAnchorEl)}
        anchorEl={colorAnchorEl}
        onClose={() => setColorAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 1, width: 200 }}>
          {colorPalette.map((color) => (
            <Box
              key={color}
              sx={{
                width: 24,
                height: 24,
                backgroundColor: color,
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'scale(1.1)',
                }
              }}
              onClick={() => handleTextColor(color)}
              title={color}
            />
          ))}
        </Box>
      </Popover>
      
      {/* 색상 팔레트 팝오버 - 배경색 */}
      <Popover
        open={Boolean(backgroundAnchorEl)}
        anchorEl={backgroundAnchorEl}
        onClose={() => setBackgroundAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 1, width: 200 }}>
          {/* 투명 배경 옵션 */}
          <Box
            sx={{
              width: 24,
              height: 24,
              background: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
              backgroundSize: '4px 4px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer',
              '&:hover': {
                transform: 'scale(1.1)',
              }
            }}
            onClick={() => handleBackgroundColor('transparent')}
            title="투명"
          />
          {colorPalette.map((color) => (
            <Box
              key={color}
              sx={{
                width: 24,
                height: 24,
                backgroundColor: color,
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'scale(1.1)',
                }
              }}
              onClick={() => handleBackgroundColor(color)}
              title={color}
            />
          ))}
        </Box>
      </Popover>
      
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
        * 텍스트를 선택한 후 툴바 버튼을 클릭하여 서식을 적용할 수 있습니다. 미리보기 모드에서 실제 팝업 표시 결과를 확인할 수 있습니다.
      </Typography>
    </Box>
  );
});

SimpleRichTextEditor.displayName = 'SimpleRichTextEditor';

export default SimpleRichTextEditor;
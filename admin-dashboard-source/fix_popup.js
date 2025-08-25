const fs = require('fs');
const path = '/app/src/pages/board/PopupPage.jsx';
let content = fs.readFileSync(path, 'utf8');

// columnsWithActions 부분을 찾아서 수정
const startMarker = 'const columnsWithActions = useMemo(() => {';
const endMarker = '}, [handleEdit, handleDelete]);';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker, startIndex) + endMarker.length;

if (startIndex \!== -1 && endIndex \!== -1) {
  const newColumnsWithActions = `  const columnsWithActions = useMemo(() => {
    return popupColumns.map(column => {
      if (column.id === 'actions') {
        return {
          ...column,
          // CellRenderer가 인식할 수 있도록 actions 배열 추가
          actions: [
            {
              type: 'button',
              label: '수정',
              buttonText: '수정',
              color: 'primary',
              variant: 'outlined',
              onClick: handleEdit
            },
            {
              type: 'button',
              label: '삭제',
              buttonText: '삭제',
              color: 'error',
              variant: 'outlined',
              onClick: handleDelete
            }
          ]
        };
      }
      return column;
    });
  }, [handleEdit, handleDelete]);`;
  
  const newContent = content.substring(0, startIndex) + newColumnsWithActions + content.substring(endIndex);
  fs.writeFileSync(path, newContent, 'utf8');
  console.log('파일 수정 완료');
} else {
  console.log('수정할 부분을 찾을 수 없습니다.');
}

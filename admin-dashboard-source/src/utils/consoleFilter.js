/**
 * Console filter to suppress specific SearchBox logs
 * Add this to your main App.jsx or index.js file
 */

export function suppressSearchBoxLogs() {
  // Store the original console.log function
  const originalLog = console.log;
  
  // Patterns to filter out
  const filterPatterns = [
    /🔍\s*SearchBox\s*상태/,
    /SearchBox\s*렌더링/,
    /🔍\s*드롭다운\s*렌더링\s*체크/,
    /🔍\s*외부\s*클릭\s*감지\s*-\s*초기화/,
    /PageHeader:\s*add-button\s*권한\s*체크/,
    /TablePagination:\s*export-excel\s*권한\s*체크/,
    /TablePagination:\s*print-button\s*권한\s*체크/,
    /TablePagination:\s*권한이\s*업데이트되어\s*리렌더링합니다/,
    /member\.parentTypes\s*원본:/,
    /hierarchyData\s*처리\s*후:/,
    /MemberDetailDialog\s*-\s*받은\s*member\s*데이터:/,
    /member\.hierarchy:/,
    /member\.parentTypes:/,
    /\[Balance Refresh\]\s*잔액\s*변경\s*감지:/,
    /잔액\s*(증가|감소):/,
    /\[Bulk Balance Refresh\]/,
    /===\s*권한\s*시스템\s*체크\s*===/,
    /Redux\s*User:/,
    /User\s*Permissions:/,
    /usePermission\s*권한:/,
    /메뉴\s*권한\s*테스트:/,
    /실제\s*권한\s*배열:/,
    /Redux\s*State:/
  ];
  
  // Override console.log - 임시 비활성화
  console.log = originalLog; // 필터링 없이 원본 사용
  
  // Return a function to restore original console.log if needed
  return () => {
    console.log = originalLog;
  };
}

/**
 * Alternative: Completely disable console.log in production
 */
export function disableConsoleInProduction() {
  // 임시로 프로덕션에서도 console 활성화
  if (process.env.NODE_ENV === 'production' && false) {
    console.log = () => {};
    console.warn = () => {};
    console.error = () => {};
  }
}
#!/bin/bash

# 드래그앤드롭 고정영역 수정을 위한 백업 스크립트
# 실행: bash backup_drag_fix.sh

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/drag_fix_${TIMESTAMP}"

echo "드래그앤드롭 고정영역 수정을 위한 백업을 시작합니다..."

# 백업 디렉터리 생성
mkdir -p "${BACKUP_DIR}"

# 핵심 수정 대상 파일 백업 (필수)
echo "1. 핵심 파일 백업 중..."
cp src/components/baseTemplate/hooks/useTableColumnDrag.js "${BACKUP_DIR}/useTableColumnDrag.js.backup"

# 관련 파일 백업 (안전성을 위한 추가 백업)
echo "2. 관련 파일 백업 중..."
cp src/hooks/usePageTemplate.js "${BACKUP_DIR}/usePageTemplate.js.backup"
cp src/components/baseTemplate/components/table/BaseTable.jsx "${BACKUP_DIR}/BaseTable.jsx.backup"
cp src/components/baseTemplate/components/table/TableHeader.jsx "${BACKUP_DIR}/TableHeader.jsx.backup"

# 테스트 파일 백업
echo "3. 테스트 파일 백업 중..."
cp src/components/baseTemplate/examples/TableColumnPinningTestExample.jsx "${BACKUP_DIR}/TableColumnPinningTestExample.jsx.backup" 2>/dev/null || echo "테스트 파일을 찾을 수 없습니다."

# 백업 완료 메시지
echo "백업이 완료되었습니다."
echo "백업 위치: ${BACKUP_DIR}"
echo "수정 대상: src/components/baseTemplate/hooks/useTableColumnDrag.js"
echo "수정 범위: handleDrop 함수 (237-448라인) 중 고정영역 판단 로직"

# 백업 파일 목록 출력
echo ""
echo "백업된 파일 목록:"
ls -la "${BACKUP_DIR}"

echo ""
echo "롤백이 필요한 경우:"
echo "cp ${BACKUP_DIR}/useTableColumnDrag.js.backup src/components/baseTemplate/hooks/useTableColumnDrag.js"
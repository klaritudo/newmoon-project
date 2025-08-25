#!/bin/bash

# 백업 스크립트
# 실행: bash backup_project.sh

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/Applications/MAMP/htdocs/nm/admin-dashboard/backups"
PROJECT_ROOT="/Applications/MAMP/htdocs/nm"

echo "=== NM 프로젝트 백업 시작 ==="
echo "타임스탬프: $TIMESTAMP"

# 백업 디렉토리 생성
mkdir -p "$BACKUP_DIR"

# 1. MySQL 데이터베이스 백업
echo ""
echo "1. MySQL 데이터베이스 백업 중..."
DB_NAME="newmoon"
DB_USER="root"
DB_PASS="root"
DB_HOST="localhost"
DB_PORT="8889"

mysqldump -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASS $DB_NAME > "$BACKUP_DIR/mysql_backup_${TIMESTAMP}.sql" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✓ MySQL 백업 완료: mysql_backup_${TIMESTAMP}.sql"
else
    echo "✗ MySQL 백업 실패"
fi

# 2. SQLite 데이터베이스 백업
echo ""
echo "2. SQLite 데이터베이스 백업 중..."
if [ -f "$PROJECT_ROOT/api-server/newmoon.db" ]; then
    cp "$PROJECT_ROOT/api-server/newmoon.db" "$BACKUP_DIR/newmoon_${TIMESTAMP}.db"
    echo "✓ SQLite 백업 완료: newmoon_${TIMESTAMP}.db"
else
    echo "✗ SQLite 데이터베이스를 찾을 수 없습니다"
fi

# 3. 프로젝트 전체 백업 (node_modules 제외)
echo ""
echo "3. 프로젝트 전체 백업 중..."
echo "node_modules 디렉토리는 제외됩니다..."

cd "$PROJECT_ROOT"
tar --exclude='node_modules' \
    --exclude='.git' \
    --exclude='dist' \
    --exclude='build' \
    --exclude='*.log' \
    --exclude='*.tmp' \
    --exclude='.DS_Store' \
    -czf "$BACKUP_DIR/nm_full_backup_${TIMESTAMP}.tar.gz" .

if [ $? -eq 0 ]; then
    echo "✓ 프로젝트 백업 완료: nm_full_backup_${TIMESTAMP}.tar.gz"
else
    echo "✗ 프로젝트 백업 실패"
fi

# 4. Git 상태 저장
echo ""
echo "4. Git 상태 정보 저장 중..."
cd "$PROJECT_ROOT"
git log --oneline -n 20 > "$BACKUP_DIR/git_log_${TIMESTAMP}.txt"
git status > "$BACKUP_DIR/git_status_${TIMESTAMP}.txt"
echo "✓ Git 상태 정보 저장 완료"

# 5. 백업 파일 크기 확인
echo ""
echo "=== 백업 완료 ==="
echo "백업 위치: $BACKUP_DIR"
echo ""
echo "생성된 백업 파일:"
ls -lh "$BACKUP_DIR" | grep "$TIMESTAMP"

echo ""
echo "=== 백업 작업 완료 ==="
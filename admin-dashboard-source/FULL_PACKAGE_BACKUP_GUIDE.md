# 풀 패키지 백업 가이드

## 풀 패키지 백업이란?

**풀 패키지 백업(Full Package Backup)**은 프로젝트의 모든 구성 요소를 빠짐없이 백업하는 것을 의미합니다.

### 포함되어야 하는 항목:
1. **데이터베이스** - 모든 테이블, 데이터, 프로시저, 트리거 등
2. **백엔드 서버** - API 서버, 설정 파일, 환경 변수 등
3. **프론트엔드 애플리케이션** - 관리자 페이지, 사용자 페이지 등
4. **공통 리소스** - 이미지, 폰트, 공유 라이브러리 등
5. **설정 파일** - 환경 설정, 빌드 스크립트, 문서 등
6. **기타 필수 파일** - README, 라이선스, 배포 스크립트 등

### 제외되는 항목:
- `node_modules` (package.json으로 복원 가능)
- `.git` (별도 관리)
- `dist`, `build` (소스로부터 재생성 가능)
- 임시 파일, 로그 파일
- 개인 설정 파일 (.env 등)

## 방금 수행한 백업 방법

### 1. 백업 스크립트 생성
```bash
# backup-complete-full.sh 파일 생성
chmod +x backup-complete-full.sh
```

### 2. 백업 수행 내용

#### 2.1 전체 프로젝트 통합 백업
```bash
tar -czf "$BACKUP_DIR/nm_full_project_complete_$BACKUP_DATE.tar.gz" \
    -C "/Applications/MAMP/htdocs" \
    --exclude="*/node_modules" \
    --exclude="*/.git" \
    --exclude="*/dist" \
    --exclude="*/build" \
    nm
```
- **결과**: 199MB의 전체 프로젝트 백업 파일
- **특징**: 한 번에 전체 프로젝트 복원 가능

#### 2.2 데이터베이스 백업
```bash
/Applications/MAMP/Library/bin/mysql80/bin/mysqldump \
    -u root -proot \
    -h localhost -P 8889 \
    --socket=/Applications/MAMP/tmp/mysql/mysql.sock \
    --single-transaction \
    --routines \
    --triggers \
    --events \
    --add-drop-database \
    --databases newmoon > "$BACKUP_DIR/nm_database_complete_$BACKUP_DATE.sql"
```
- **결과**: 2.6MB의 SQL 덤프 파일
- **포함**: 모든 테이블, 데이터, 저장 프로시저, 트리거, 이벤트

#### 2.3 개별 컴포넌트 백업
각 주요 컴포넌트를 개별적으로도 백업:
- **관리자 대시보드**: `admin-dashboard/` (2.0MB)
- **API 서버**: `api-server/` (320KB)
- **유저 페이지**: `admin-dashboard/user-react/` (2.1KB)
- **공용 리소스**: `shared/` (2.2KB)
- **루트 설정**: 루트 디렉토리의 설정 파일들

### 3. 백업 파일 구조
```
/Applications/MAMP/htdocs/nm/backups/
├── nm_full_project_complete_20250628_020316.tar.gz    # 전체 통합 백업
├── nm_database_complete_20250628_020316.sql           # DB 백업
├── nm_admin_dashboard_complete_20250628_020316.tar.gz  # 관리자 대시보드
├── nm_api_server_complete_20250628_020316.tar.gz      # API 서버
├── nm_user_react_complete_20250628_020316.tar.gz      # 유저 페이지
├── nm_shared_complete_20250628_020316.tar.gz          # 공용 리소스
├── nm_root_configs_complete_20250628_020316.tar.gz    # 설정 파일
└── backup_complete_info_20250628_020316.md            # 백업 정보
```

## 복원 방법

### 전체 복원 (권장)
```bash
# 1. 기존 프로젝트 백업 (선택사항)
mv /Applications/MAMP/htdocs/nm /Applications/MAMP/htdocs/nm_old

# 2. 전체 프로젝트 복원
cd /Applications/MAMP/htdocs
tar -xzf backups/nm_full_project_complete_20250628_020316.tar.gz

# 3. 데이터베이스 복원
mysql -u root -proot -h localhost -P 8889 \
    --socket=/Applications/MAMP/tmp/mysql/mysql.sock \
    < backups/nm_database_complete_20250628_020316.sql

# 4. 의존성 재설치
cd nm/admin-dashboard && npm install
cd ../api-server && npm install
cd ../admin-dashboard/user-react && npm install
```

### 부분 복원
특정 컴포넌트만 복원이 필요한 경우:
```bash
# 예: API 서버만 복원
cd /Applications/MAMP/htdocs/nm
tar -xzf backups/nm_api_server_complete_20250628_020316.tar.gz
```

## 백업 검증 체크리스트

✅ 전체 프로젝트 백업 파일 존재 (199MB)
✅ 데이터베이스 백업 파일 존재 (2.6MB)
✅ 각 컴포넌트별 개별 백업 존재
✅ 백업 정보 문서 생성
✅ 복원 방법 문서화

## 주의사항

1. **정기 백업**: 중요한 변경 전에는 항상 풀 패키지 백업 수행
2. **백업 검증**: 백업 후 파일 크기와 내용 확인
3. **저장 위치**: 백업 파일은 프로젝트 외부에도 복사 보관 권장
4. **버전 관리**: 백업 파일명에 날짜/시간 포함으로 버전 구분
5. **환경 변수**: .env 파일은 별도 관리 (보안상 백업에서 제외)

## 백업 자동화 제안

향후 cron job으로 정기 백업 자동화 가능:
```bash
# 매일 새벽 3시 자동 백업
0 3 * * * /Applications/MAMP/htdocs/nm/admin-dashboard/backup-complete-full.sh
```

---

작성일: 2025년 6월 28일
백업 수행자: Claude AI Assistant
백업 목적: 권한 시스템 수정 전 안전 백업
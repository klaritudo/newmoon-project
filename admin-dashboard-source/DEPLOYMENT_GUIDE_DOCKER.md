# Admin Dashboard CSS 수정 배포 가이드
날짜: 2025-01-24

## 개발 환경 정보
- Node.js: v22.18.0
- npm: 10.9.3
- Vite: 6.3.5
- Build Mode: production

## 준비된 파일들

### Option 1: Docker 빌드 (권장)
**파일**: `admin-source-docker-build.tar.gz` (1MB)
**내용**: 소스코드 + package.json + package-lock.json

```bash
# 1. 파일 전송
scp admin-source-docker-build.tar.gz klaritudo@122.37.122.224:~/

# 2. 프로덕션 서버에서 Docker 빌드
tar -xzf admin-source-docker-build.tar.gz
docker run --rm -v $(pwd):/app -w /app node:18-alpine sh -c "npm install && npm run build"

# 3. 빌드된 dist 폴더를 컨테이너에 복사
docker cp dist nm-admin-dashboard:/usr/share/nginx/html/
```

### Option 2: 완전한 빌드 파일
**파일**: `admin-dashboard-production-dist-20250124-052935.tar.gz` (777KB)
**내용**: NODE_ENV=production으로 빌드된 완전한 dist 폴더

```bash
# 1. 파일 전송
scp admin-dashboard-production-dist-20250124-052935.tar.gz klaritudo@122.37.122.224:~/

# 2. 백업 후 교체
docker exec nm-admin-dashboard sh -c "cp -r /usr/share/nginx/html /usr/share/nginx/html-backup"
tar -xzf admin-dashboard-production-dist-20250124-052935.tar.gz
docker cp dist nm-admin-dashboard:/usr/share/nginx/html/
```

### Option 3: CSS만 교체 (최소 위험)
**파일**: `admin-css-only-20250124.css` (274KB)
**내용**: index-DYbsAdWy.css 파일만

```bash
# 1. 파일 전송
scp admin-css-only-20250124.css klaritudo@122.37.122.224:~/

# 2. 기존 CSS 백업 및 교체
docker exec nm-admin-dashboard sh -c "cd /usr/share/nginx/html/assets && cp index-*.css index-backup.css"
docker cp admin-css-only-20250124.css nm-admin-dashboard:/usr/share/nginx/html/assets/index-DYbsAdWy.css
```

## 변경사항 요약
1. CSS zoom 속성 완전 제거
2. CSS 변수 기반 transform scale 시스템 적용
3. 해상도별 스케일 값:
   - FHD (1920x1080): --ui-scale: 0.70
   - 2K (2560x1440): --ui-scale: 0.85  
   - 4K (3840x2160): --ui-scale: 1.00

## 테스트 방법
```bash
# 컨테이너 재시작
docker restart nm-admin-dashboard

# 브라우저에서 확인
# 1. 캐시 초기화 (Ctrl+F5)
# 2. FHD 해상도에서 테이블 행 개수 확인
# 3. 브라우저 확대/축소 기능 정상 작동 확인
```

## 롤백 방법
```bash
# Option 1,2의 경우
docker exec nm-admin-dashboard sh -c "rm -rf /usr/share/nginx/html && mv /usr/share/nginx/html-backup /usr/share/nginx/html"

# Option 3의 경우
docker exec nm-admin-dashboard sh -c "cd /usr/share/nginx/html/assets && mv index-backup.css index-DYbsAdWy.css"

docker restart nm-admin-dashboard
```
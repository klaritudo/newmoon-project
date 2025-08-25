# 환경 설정 가이드

## 🎯 개요
이 문서는 고객센터 시스템의 개발, 스테이징, 프로덕션 환경 설정 방법을 설명합니다.

---

## 🔧 개발 환경 설정

### 필수 소프트웨어
- Node.js 18.x 이상
- MySQL 8.0
- Redis 6.x
- Git

### 프로젝트 구조
```
/home/klaritudo/
├── user-api-source/        # 사용자 API (포트 5101)
├── admin-api-source/       # 관리자 API (포트 5100 - Docker)
├── user-page-source/       # 사용자 페이지 (포트 3001)
├── admin-dashboard-source/ # 관리자 대시보드 (포트 5173)
└── project/               # Docker 스테이징 환경
```

### 개발 환경 실행
```bash
# 1. User API 실행
cd /home/klaritudo/user-api-source
npm install
npm run dev  # http://localhost:5101

# 2. Admin API 실행 (Docker로 실행중)
# Docker 컨테이너: nm-admin-api-dev
# 포트: 5100

# 3. User Page 실행
cd /home/klaritudo/user-page-source
npm install
npm run dev  # http://localhost:3001

# 4. Admin Dashboard 실행
cd /home/klaritudo/admin-dashboard-source
npm install
npm run dev  # http://localhost:5173
```

### 환경변수 설정 (.env)
```bash
# User API (.env)
NODE_ENV=development
PORT=5101
DB_HOST=127.0.0.1
DB_PORT=3307  # 개발용 MySQL (nm-mysql-dev)
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=newmoon_dev
REDIS_HOST=localhost
REDIS_PORT=6380  # Redis 개발 포트
JWT_SECRET=your_jwt_secret

# Admin API (.env)
NODE_ENV=development
PORT=5100  # Docker로 실행
DB_HOST=127.0.0.1
DB_PORT=3307  # 개발용 MySQL (nm-mysql-dev)
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=newmoon_dev
REDIS_HOST=localhost
REDIS_PORT=6380  # Redis 개발 포트
JWT_SECRET=your_jwt_secret

# User Page (.env)
VITE_API_URL=http://localhost:5101
VITE_SOCKET_URL=http://localhost:5101

# Admin Dashboard (.env)
VITE_API_URL=http://localhost:5100  # Admin API (Docker)
VITE_USER_API_URL=http://localhost:5101
```

---

## 🚀 스테이징 환경 (Docker)

### Docker Compose 구성
```yaml
# /home/klaritudo/project/docker-compose.yml
version: '3.8'

services:
  user-api:
    build: ./user-api-source
    ports:
      - "5001:5001"
    environment:
      - NODE_ENV=production
      - PORT=5001
      - DB_HOST=host.docker.internal
      - DB_PORT=3306
      - REDIS_HOST=host.docker.internal

  admin-api:
    build: ./admin-api-source
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000
      - DB_HOST=host.docker.internal
      - DB_PORT=3306
      - REDIS_HOST=host.docker.internal

  user-page:
    build: ./user-page-source
    ports:
      - "3000:3000"
    environment:
      - API_URL=http://220.95.232.167:5001

  phpmyadmin:
    image: phpmyadmin/phpmyadmin
    ports:
      - "8080:80"
    environment:
      - PMA_HOST=host.docker.internal
      - PMA_PORT=3306
```

### Docker 명령어
```bash
# 빌드 및 실행
cd /home/klaritudo/project
docker-compose build
docker-compose up -d

# 로그 확인
docker-compose logs -f [service-name]

# 서비스 재시작
docker-compose restart [service-name]

# 전체 중지
docker-compose down

# 전체 삭제 (볼륨 포함)
docker-compose down -v
```

---

## 🌐 프로덕션 배포 준비

### 현재 하드코딩된 설정들

#### 1. Frontend 설정 파일
```javascript
// user-page-source/public/config.js
window.CONFIG = {
  API_URL: 'http://220.95.232.167:5001',  // 하드코딩됨
  SOCKET_URL: 'http://220.95.232.167:5001'
};

// admin-dashboard-source/vite.config.js
proxy: {
  '/api': {
    target: 'http://220.95.232.167:5002',  // 하드코딩됨
    changeOrigin: true
  }
}
```

#### 2. Backend CORS 설정
```javascript
// user-api-source/server.js
app.use(cors({
  origin: [
    'http://220.95.232.167:3000',  // 하드코딩됨
    'http://220.95.232.167:3002',
    'http://localhost:3002'
  ]
}));
```

### 개선 방향

#### 1. 런타임 설정 적용
```javascript
// docker-entrypoint.sh
#!/bin/sh
cat > /app/build/runtime-config.js << EOF
window.RUNTIME_CONFIG = {
  API_URL: "${API_URL:-/api}",
  SOCKET_URL: "${SOCKET_URL:-/socket}",
  NODE_ENV: "${NODE_ENV:-production}"
};
EOF
exec "$@"
```

#### 2. 환경변수 템플릿
```bash
# .env.template
# API 설정
API_HOST=localhost
API_PORT=5001
ADMIN_API_PORT=5000

# 데이터베이스
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=customer_center

# Redis
REDIS_HOST=localhost
REDIS_PORT=6380

# JWT
JWT_SECRET=change-this-secret-key

# CORS 허용 도메인
CORS_ORIGINS=http://localhost:3000,http://localhost:3002
```

#### 3. 자동 설치 스크립트
```bash
#!/bin/bash
# install.sh - 워드프레스 스타일 설치 스크립트

echo "🚀 고객센터 시스템 설치"
echo "========================"

# 환경 설정 입력
read -p "데이터베이스 호스트 [localhost]: " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "데이터베이스 이름 [customer_center]: " DB_NAME
DB_NAME=${DB_NAME:-customer_center}

read -p "데이터베이스 사용자 [root]: " DB_USER
DB_USER=${DB_USER:-root}

read -sp "데이터베이스 비밀번호: " DB_PASSWORD
echo

# .env 파일 생성
cat > .env << EOF
DB_HOST=$DB_HOST
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
EOF

echo "✅ 설정 파일 생성 완료"

# 데이터베이스 초기화
echo "📦 데이터베이스 초기화 중..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD < schema.sql

# Docker 이미지 빌드
echo "🐳 Docker 이미지 빌드 중..."
docker-compose build

# 서비스 시작
echo "🚀 서비스 시작 중..."
docker-compose up -d

echo "✅ 설치 완료!"
echo "관리자 페이지: http://$(hostname -I | awk '{print $1}'):5173"
```

---

## 📋 환경별 차이점 요약

| 구분 | 개발 | 스테이징 | 프로덕션 목표 |
|------|------|----------|--------------|
| User API | 5101 | 5001 | 동적 설정 |
| Admin API | 5100 (Docker) | 5000 | 동적 설정 |
| User Page | 3001 | 3000 | 동적 설정 |
| Admin Dashboard | 5173 | Docker 내부 | 동적 설정 |
| MySQL | 3307 (nm-mysql-dev) | 3306 (nm-mysql) | 동적 설정 |
| Redis | 6380 (nm-redis-dev) | Docker 내부 | 동적 설정 |
| 실행 방식 | npm run dev + Docker | docker-compose | 자동 설치 |
| 설정 방식 | .env 파일 | 환경변수 | 런타임 설정 |
| Hot Reload | O | X | X |
| 디버깅 | 용이 | 로그 기반 | 로그 기반 |

---

## 🔍 문제 해결

### 포트 충돌 발생 시
```bash
# 사용 중인 포트 확인
sudo lsof -i :5101  # User API
sudo lsof -i :5100  # Admin API (Docker)
sudo lsof -i :3001  # User Page
sudo lsof -i :5173  # Admin Dashboard
sudo lsof -i :3307  # MySQL 개발
sudo lsof -i :6380  # Redis 개발

# 프로세스 종료
kill -9 [PID]
```

### Docker 컨테이너 문제
```bash
# 컨테이너 상태 확인
docker ps -a

# 컨테이너 로그 확인
docker logs [container-id]

# 컨테이너 재시작
docker restart [container-id]

# 모든 컨테이너 정리
docker system prune -a
```

### 데이터베이스 연결 실패
```bash
# MySQL 상태 확인
sudo systemctl status mysql

# MySQL 재시작
sudo systemctl restart mysql

# 연결 테스트
mysql -h localhost -u root -p
```

---

## 📚 참고 자료

- [Docker Compose 문서](https://docs.docker.com/compose/)
- [Node.js 환경변수 가이드](https://nodejs.org/dist/latest-v18.x/docs/api/process.html#processenv)
- [Vite 설정 문서](https://vitejs.dev/config/)
- [PM2 프로세스 관리](https://pm2.keymetrics.io/)

최종 업데이트: 2025-08-17
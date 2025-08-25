# 시스템 배포 가이드

## 📋 목차
1. [현재 서버 환경 구성](#현재-서버-환경-구성)
2. [개발 환경 설정](#개발-환경-설정)
3. [스테이징 환경 설정](#스테이징-환경-설정)
4. [프로덕션 배포 준비](#프로덕션-배포-준비)
5. [포트 구성 매트릭스](#포트-구성-매트릭스)
6. [알려진 문제점](#알려진-문제점)
7. [해결 로드맵](#해결-로드맵)

---

## 현재 서버 환경 구성

### 서버 정보
- **IP 주소**: 220.95.232.167
- **용도**: 개발 + 스테이징 통합 환경
- **OS**: Ubuntu Linux
- **특징**: 한 서버에서 개발과 스테이징을 동시 운영

### 환경 구분
```
┌─────────────────────────────────────────┐
│         서버: 220.95.232.167            │
├─────────────────────────────────────────┤
│  개발 환경 (Direct)  │  스테이징 (Docker) │
│  - npm run dev      │  - docker-compose  │
│  - 실시간 개발      │  - 배포 테스트     │
└─────────────────────────────────────────┘
```

---

## 개발 환경 설정

### 포트 구성
| 서비스 | 포트 | 실행 방법 | 접속 URL |
|--------|------|-----------|----------|
| User API | 5101 | `npm run dev` | http://localhost:5101 |
| Admin API | 5100 | Docker: nm-admin-api-dev | http://localhost:5100 |
| User Page | 3001 | `npm run dev` | http://localhost:3001 |
| Admin Dashboard | 5173 | `npm run dev` | http://localhost:5173 |
| MySQL (개발) | 3307 | Docker: nm-mysql-dev | localhost:3307 |
| Redis (개발) | 6380 | Docker: nm-redis-dev | localhost:6380 |

### 실행 명령어
```bash
# User API 실행
cd /home/klaritudo/user-api-source
npm run dev

# Admin API 실행
cd /home/klaritudo/admin-api-source
npm run dev

# User Page 실행
cd /home/klaritudo/user-page-source
npm run dev

# Admin Dashboard 실행
cd /home/klaritudo/admin-dashboard-source
npm run dev
```

### 특징
- Hot Reload 지원
- 실시간 코드 수정 반영
- 디버깅 용이
- 개발자 도구 활성화

---

## 스테이징 환경 설정

### 포트 구성
| 서비스 | 포트 | 컨테이너 이름 | 접속 URL |
|--------|------|---------------|----------|
| User API | 5001 | user-api | http://220.95.232.167:5001 |
| Admin API | 5000 | admin-api | http://220.95.232.167:5000 |
| User Page | 3000 | user-page | http://220.95.232.167:3000 (중지) |
| Admin Dashboard | - | admin-dashboard | Docker 내부 |
| MySQL (프로덕션) | 3306 | nm-mysql | Docker 내부 네트워크 |
| Redis (프로덕션) | - | nm-redis | Docker 내부 네트워크 |
| phpMyAdmin | 8080 | phpmyadmin | http://220.95.232.167:8080 |

### Docker Compose 실행
```bash
cd /home/klaritudo/project
docker-compose up -d        # 전체 실행
docker-compose logs -f       # 로그 확인
docker-compose down         # 중지
```

### 특징
- 실제 배포 환경 시뮬레이션
- 프로덕션 빌드 테스트
- 컨테이너 기반 격리
- 환경변수 기반 설정

---

## 프로덕션 배포 준비

### 현재 문제점
1. **IP 하드코딩**: 220.95.232.167이 37곳에 고정
2. **빌드 시점 설정**: 환경 설정이 빌드 시 고정
3. **포트 불일치**: 개발/스테이징/프로덕션 포트 다름
4. **환경 의존성**: 특정 서버 환경에 종속

### 목표: 워드프레스 스타일 설치
```bash
# 이상적인 설치 과정
./install.sh
> 데이터베이스 호스트: [입력]
> API 서버 주소: [자동 감지]
> 관리자 계정: [입력]
> 설치 완료!
```

---

## 포트 구성 매트릭스

### 전체 포트 맵
```
개발 환경 (npm run dev + Docker)
├── Frontend
│   ├── User Page: 3001
│   └── Admin Dashboard: 5173
└── Backend
    ├── User API: 5101
    └── Admin API: 5100 (Docker)

스테이징 환경 (Docker)
├── Frontend
│   ├── User Page: 3000 [중지]
│   └── Admin Dashboard: [내부]
└── Backend
    ├── User API: 5001
    └── Admin API: 5000

데이터베이스 서비스
├── MySQL (개발): 3307 (nm-mysql-dev)
├── MySQL (프로덕션): 3306 (nm-mysql)
├── Redis (개발): 6380 (nm-redis-dev)
└── phpMyAdmin: 8080
```

### 포트 충돌 방지 규칙
- 3000번대: 프론트엔드 (User)
- 5000번대: 백엔드 API
- 5100번대: 개발 API
- 5173: Vite 개발 서버
- 6380: Redis (개발), 6379: Redis (표준)
- 3306: MySQL (고정)
- 8080: 관리 도구

---

## 알려진 문제점

### 1. IP 하드코딩 위치
```javascript
// vite.config.js (9곳)
proxy: {
  '/api': 'http://220.95.232.167:5001'
}

// server.js (4곳)
cors: {
  origin: 'http://220.95.232.167:3000'
}

// config 파일들 (24곳)
API_URL: 'http://220.95.232.167:5001'
```

### 2. 빌드/런타임 설정 혼재
- 빌드 시점: Vite 설정, React 환경변수
- 런타임: 변경 불가, 재빌드 필요
- Docker: entrypoint 스크립트 부재

### 3. 환경별 설정 파일
```
user-page-source/
├── .env (개발용)
├── .env.production (미사용)
├── public/
│   ├── config.js (하드코딩)
│   ├── runtime-config.js (하드코딩)
│   └── runtime-config-dev.js (하드코딩)
```

---

## 해결 로드맵

### Phase 1: 즉시 개선 (1주)
- [ ] IP 하드코딩 제거 (37곳)
- [ ] 환경변수 통합 (.env.template)
- [ ] Docker entrypoint 스크립트 추가
- [ ] 런타임 설정 시스템 구축

### Phase 2: 구조 개선 (2-3주)
- [ ] 설치 스크립트 개발
- [ ] 환경 자동 감지 시스템
- [ ] 설정 관리 UI 구축
- [ ] 빌드/배포 자동화

### Phase 3: 완전 자동화 (1-2개월)
- [ ] 데이터베이스 기반 설정
- [ ] 멀티 테넌트 지원
- [ ] 원클릭 배포 시스템
- [ ] 자동 업데이트 기능

---

## 배포 체크리스트

### 새 서버 배포 전 확인사항
- [ ] 모든 IP 하드코딩 제거 확인
- [ ] 환경변수 설정 완료
- [ ] 데이터베이스 연결 테스트
- [ ] Redis 연결 테스트
- [ ] CORS 설정 확인
- [ ] SSL 인증서 설정
- [ ] 방화벽 규칙 설정
- [ ] 백업 시스템 구축

### 배포 후 검증
- [ ] API 응답 확인
- [ ] 프론트엔드 접속 확인
- [ ] 로그인 기능 테스트
- [ ] 데이터 조회/입력 테스트
- [ ] 성능 모니터링 설정
- [ ] 에러 로깅 확인

---

## 연락처 및 지원

- 개발 환경 문제: 개발 서버 로그 확인
- 스테이징 문제: Docker 로그 확인
- 배포 문제: 이 문서 참조

최종 업데이트: 2025-08-17
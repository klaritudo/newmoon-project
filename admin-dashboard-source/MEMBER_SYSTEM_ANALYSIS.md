# NewMoon 회원 시스템 분석 보고서

## 프로젝트 개요

**프로젝트명**: NewMoon Gaming Platform  
**분석일**: 2025-07-03  
**시스템 유형**: 온라인 게임 플랫폼 관리 시스템  

---

## 전체 시스템 아키텍처

### 기술 스택
- **Backend**: Node.js, Express.js, MySQL 8.0, Redis, Socket.io
- **Frontend**: React 18, Material-UI, AG-Grid, Redux Toolkit
- **인프라**: Docker, Nginx, SSL/TLS 지원
- **통합**: Honor Gaming API + 다수 게임 프로바이더

### 마이크로서비스 구조
```
┌─────────────────────────────────────────────────────────────┐
│                    Nginx Reverse Proxy                     │
├─────────────────────────────────────────────────────────────┤
│  Admin Dashboard  │  User Page  │  Admin API  │  User API   │
├─────────────────────────────────────────────────────────────┤
│              MySQL Database + Redis Cache                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 회원 시스템 핵심 구조

### 🎯 **올바른 시스템 이해**

#### 고정 요소 (변경 불가)
- **Master (Level 999)**: 시스템 마스터 - 최고 권한
- **Level 1**: 슈퍼관리자 - 최고 운영 권한
- **레벨 번호**: 2-12 (숫자 순서만 고정)

#### 유연한 요소 (모두 설정 가능)
- **레벨 이름**: `agent_levels.name` 필드에서 자유롭게 변경 가능
- **권한 설정**: 템플릿 기반 + 개별 오버라이드
- **외관 설정**: 배경색, 테두리색, 아이콘 등

### 🏗️ **현재 설정된 레벨 구조**

```sql
Level 1:   "smaster12" (마스터)
Level 2:   "대본23" (상부운영관리자)  
Level 3:   "본사20" (상부운영관리자)
Level 4:   "부본사21" (부본사 권한)
Level 5:   "마스터총판34" (마마마)
Level 6:   "총판11" (총판)
Level 7:   "매장99" (매장)
Level 8:   "회원1" (회운권한111)
Level 9:   "회원2" (마마마)
Level 10:  "회원Lv3" (마마마)
Level 11:  "회원Lv4" (마마마)
Level 12:  "회원5" (마마마)
Level 999: "시스템마스터" (시스템관리자)
```

---

## 권한 시스템 아키텍처

### 🔐 **3계층 권한 시스템**

#### 권한 적용 우선순위
```javascript
1. 개별 권한 오버라이드 (members.permission_override) ← 최우선
2. 개별 권한 템플릿 (members.permission_id)
3. 레벨 권한 템플릿 (agent_levels.permission_id) ← 기본값
4. 시스템 기본값 ← 최후
```

#### 권한 구조 (JSON 형태)
```json
{
  "menus": ["*"] | ["menu_1", "menu_2"],
  "buttons": ["*"] | ["btn_1", "btn_2"], 
  "features": ["*"] | ["feature_1"],
  "restrictions": {
    "menus": ["restricted_menu_ids"],
    "buttons": ["restricted_button_ids"],
    "layouts": ["restricted_layouts"],
    "cssSelectors": ["restricted_selectors"]
  }
}
```

### 🌐 **도메인 기반 권한 분리**

#### 도메인 구분
- **관리자 도메인**: `ori.qnuta.com`, `qnuta.com`
- **사용자 도메인**: `user1.qnuta.com`

#### 권한 위임 시스템
```
Level 1 → Level 2 (위임 가능)
Level 2 → Level 3 (위임 가능)
Level 3 → 종료 (위임 불가)
```

---

## 특수 회원 vs 일반 회원

### 🔐 **특수 회원 분류**

#### 마스터 계정 (master)
- **레벨**: 999 (시스템 최고 레벨)
- **권한**: 시스템관리자
- **특징**: 
  - 모든 권한 제한 우회
  - 게임 플레이 완전 차단
  - 데이터베이스 트리거로 보호
  - IP 화이트리스트 적용

#### 슈퍼 계정 (super00001~3)
- **레벨**: 1 (최고 운영 레벨)
- **권한**: 마스터
- **특징**:
  - 게임 플레이 차단
  - 고급 관리 기능 접근
  - 하위 사용자 관리

### 📊 **기능 비교표**

| 기능 | Master | Level 1 | Level 2-12 |
|------|--------|---------|------------|
| 시스템 설정 | ✅ | ✅ | **권한 템플릿에 따라** |
| 사용자 관리 | ✅ | ✅ | **권한 템플릿에 따라** |
| 금융 관리 | ✅ | ✅ | **권한 템플릿에 따라** |
| 게임 관리 | ✅ | ✅ | **권한 템플릿에 따라** |
| 게임 플레이 | ❌ | ❌ | **권한 템플릿에 따라** |
| 개인 정보 | ✅ | ✅ | ✅ |
| 정산 조회 | ✅ | ✅ | **권한 템플릿에 따라** |

---

## 데이터베이스 스키마

### 핵심 테이블 구조

#### agent_levels (에이전트 레벨)
```sql
CREATE TABLE `agent_levels` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,           -- 레벨 이름 (변경 가능)
  `level` int NOT NULL,                   -- 레벨 번호 (2-12)
  `permission` varchar(255) DEFAULT '',   -- 권한 이름
  `is_top_level` tinyint(1) DEFAULT '0',
  `background_color` varchar(7),          -- 배경색
  `border_color` varchar(7),              -- 테두리색
  `max_members` int DEFAULT '0',
  `default_permissions` json,             -- 기본 권한 (JSON)
  `permission_id` int,                    -- 권한 템플릿 ID
  -- ...
);
```

#### members (회원)
```sql
CREATE TABLE `members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `agent_level_id` int,                   -- 에이전트 레벨
  `permission_override` json,             -- 개별 권한 오버라이드
  `permission_id` int,                    -- 개별 권한 템플릿 ID
  `userId` varchar(500) NOT NULL,
  `username` varchar(255) NOT NULL,
  `parentId` int,                         -- 상위 회원 ID
  `rollingPercent` float DEFAULT '0',     -- 롤링 퍼센트
  `rolling_slot_percent` float DEFAULT '0',
  `rolling_casino_percent` float DEFAULT '0',
  -- ...
);
```

#### permissions (권한 템플릿)
```sql
CREATE TABLE `permissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `permission_name` varchar(100) NOT NULL,
  `description` text,
  `is_active` tinyint(1) DEFAULT '1',
  `restrictions` json,                    -- 권한 설정 (JSON)
  -- ...
);
```

---

## 시스템 특징 및 장점

### 🎨 **완전한 커스터마이제이션**

#### 레벨 이름 변경 예시
```
현재: "대본23" → 변경 가능: "지역본부"
현재: "마마마" → 변경 가능: "일반회원"
```

#### 권한 재구성 예시
```
현재 "마마마" 템플릿 공유 (Level 5,9,10,11,12)
↓
Level 5:  "지역총판" (총판 권한)
Level 9:  "VIP회원" (VIP 권한)
Level 10: "일반회원" (기본 권한)
Level 11: "신규회원" (제한 권한)
Level 12: "체험회원" (최소 권한)
```

### 🔄 **실시간 동기화**

#### WebSocket 기반 실시간 업데이트
- 권한 변경 시 실시간 브로드캐스트
- 프론트엔드 권한 캐시 자동 갱신
- 모든 권한 변경 내역 감사 추적

### 💰 **롤링 커미션 시스템**

#### 커미션 구조
```sql
rollingPercent FLOAT          -- 일반 롤링 (전체)
rolling_slot_percent FLOAT    -- 슬롯 게임 롤링
rolling_casino_percent FLOAT  -- 카지노 게임 롤링
```

#### 커미션 규칙
- 하위 단계 롤링 비율 ≤ 상위 단계 롤링 비율
- 게임 유형별 차등 커미션 적용
- 실시간 커미션 계산 및 정산

---

## 보안 시스템

### 🛡️ **다중 보안 레이어**

#### 인증 및 권한
- JWT 토큰 기반 인증 (24시간 만료)
- 리프레시 토큰 (7일 만료)
- 역할 기반 접근 제어 (RBAC)
- 도메인별 권한 분리

#### 특수 계정 보호
- 마스터 계정 데이터베이스 트리거 보호
- IP 화이트리스트 시스템
- 관리자 계정 게임 접근 차단
- 포괄적인 감사 로깅

### 🔒 **권한 검증 메커니즘**

#### Frontend 권한 검증
```javascript
const canAccessMenu = (menuId) => {
  // 마스터 계정은 모든 제한 우회
  if (user?.agent_level_id === 999 || user?.agent_level_id === 1) 
    return true;
  
  // 제한 권한 우선 확인
  if (userPermissions.restrictions?.menus?.includes(menuId)) 
    return false;
  
  // 허용 권한 확인
  if (userPermissions.menus?.includes('*')) return true;
  return userPermissions.menus?.includes(menuId);
};
```

---

## 핵심 비즈니스 로직

### 🎮 **게임 통합 시스템**

#### 다중 프로바이더 지원
- **주요**: Honor Gaming API (메인 파트너)
- **보조**: Evolution Gaming, Sexy Gaming, Pragmatic Play 등
- **실시간 동기화**: 2-5분 간격 베팅 데이터 동기화

#### 게임 접근 제어
- 특수 계정 (master, super) 게임 접근 완전 차단
- 레벨별 게임 제한 설정 가능
- 권한 기반 게임 카테고리 접근 제어

### 💰 **금융 관리 시스템**

#### 다중 지갑 시스템
- 내부 잔고 + API 프로바이더 잔고
- 실시간 잔고 동기화
- 자동 정산 시스템 (일일/실시간)

#### 거래 처리
- 입출금 관리
- 레벨 간 자금 이체
- 롤링 커미션 자동 분배

---

## 개발 가이드라인

### 🏗️ **아키텍처 원칙**

#### BaseTemplate 시스템 사용
- 모든 데이터 관리 페이지는 BaseTemplate 컴포넌트 사용
- 통일된 UI/UX 경험 제공
- 재사용 가능한 컴포넌트 아키텍처

#### 권한 기반 개발
- 모든 기능은 권한 검증 로직 포함
- 프론트엔드와 백엔드 이중 검증
- 실시간 권한 업데이트 지원

### 🔧 **개발 명령어**

#### Frontend (Admin Dashboard)
```bash
cd frontend/admin/admin-dashboard
npm install
npm run dev          # 개발 서버 (포트 5173)
npm run build        # 프로덕션 빌드
npm run lint         # ESLint 실행
```

#### Backend API
```bash
cd backend/admin/api-server
npm install
npm start            # 프로덕션 모드
npm run dev          # 개발 모드 (nodemon)
```

#### Docker 배포
```bash
cp .env.example .env
sudo docker compose up -d
```

---

## 결론

NewMoon 프로젝트는 **권한 기반의 유연한 회원 관리 시스템**을 핵심으로 하는 고도로 정교한 온라인 게임 플랫폼입니다. 

### 핵심 강점
1. **완전한 유연성**: 레벨 이름, 권한, 외관 모든 설정 가능
2. **강력한 보안**: 다중 레이어 보안 시스템
3. **실시간 동기화**: WebSocket 기반 실시간 업데이트
4. **확장성**: 마이크로서비스 아키텍처로 수평 확장 가능
5. **사용자 경험**: 통일된 UI/UX와 직관적인 관리 인터페이스

이 시스템은 Master와 Level 1을 제외한 **모든 회원이 동일한 등급**이며, 오직 **권한 설정에 따라 역할과 기능이 결정**되는 혁신적인 구조를 가지고 있습니다.

---

**작성자**: Claude Code Analysis  
**버전**: 1.0  
**최종 수정**: 2025-07-03
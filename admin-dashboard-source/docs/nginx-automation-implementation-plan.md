# Nginx 자동화 구현 계획서
> 도메인 관리 시스템과 Nginx 설정 자동화를 위한 최종 구현 계획

## 📋 Executive Summary

### 현재 상황
- **문제점**: 도메인 설정 페이지에서 도메인 추가/수정/삭제 시 DB만 업데이트되고 Nginx 설정은 수동으로 해야 함
- **영향**: ori.qnuta.com, sub.qnuta.com, user1.qnuta.com 등록했지만 접속 불가
- **근본 원인**: 도메인 관리와 Nginx 설정이 연동되지 않음

### 제안 솔루션
**마이크로서비스 기반 Nginx 관리 자동화 시스템**
- 권한 분리를 통한 보안성 확보
- 기존 시스템과 완전 독립적 운영
- 롤백 및 복구 메커니즘 내장
- 실시간 동기화 및 모니터링

## 🏗️ 시스템 아키텍처

### 현재 아키텍처 분석
```
┌─────────────────────────────────────────────────────┐
│                    현재 시스템                        │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Admin Dashboard (5173)  ──> Admin API (5000)       │
│         │                          │                 │
│         └── 도메인 관리 UI         └── DB 업데이트만   │
│                                                      │
│  User Page (3001)       ──> User API (3100)         │
│                                                      │
│  Nginx (/etc/nginx/)                                │
│    └── 수동 설정 필요 (자동화 없음)                    │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### 제안 아키텍처
```
┌─────────────────────────────────────────────────────┐
│                  자동화된 시스템                       │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Admin Dashboard ──> Admin API                      │
│                         │                            │
│                         ├── DB 업데이트               │
│                         └── Message Queue            │
│                              │                       │
│                              ↓                       │
│                    Nginx Manager Service             │
│                    (독립 마이크로서비스)                │
│                         │                            │
│                         ├── 설정 생성                 │
│                         ├── 유효성 검증               │
│                         ├── Nginx 적용               │
│                         └── 모니터링                  │
│                                                      │
└─────────────────────────────────────────────────────┘
```

## 🔒 보안 고려사항

### 1. 권한 분리 전략
```javascript
// 권한 레벨 정의
const PERMISSION_LEVELS = {
  WEB_APP: 'standard',      // Admin API - DB 작업만
  QUEUE: 'message',         // 메시지 큐 - 통신만
  NGINX_MANAGER: 'elevated' // Nginx Manager - 시스템 파일 접근
};
```

### 2. 입력 검증 체계
```javascript
// 도메인 검증 규칙
const domainValidation = {
  // DNS 이름 규칙 준수
  pattern: /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i,
  
  // 예약된 도메인 차단
  blacklist: ['localhost', '127.0.0.1', '0.0.0.0'],
  
  // 최대 길이 제한
  maxLength: 253,
  
  // 서브도메인 깊이 제한
  maxSubdomainDepth: 5
};
```

### 3. 템플릿 기반 설정 생성
```javascript
// Nginx 설정 템플릿 (인젝션 방지)
const nginxTemplate = {
  admin: `
server {
    listen 80;
    server_name {{DOMAIN}};
    
    location / {
        proxy_pass http://localhost:{{ADMIN_PORT}};
        # 보안 헤더들...
    }
    
    location /api/ {
        proxy_pass http://localhost:{{API_PORT}}/;
        # 보안 헤더들...
    }
}`,
  user: `
server {
    listen 80;
    server_name {{DOMAIN}};
    
    location / {
        proxy_pass http://localhost:{{USER_PORT}};
        # 보안 헤더들...
    }
}`
};
```

## 💻 구현 세부사항

### 1. Nginx Manager Service 구조
```
/home/klaritudo/nginx-manager/
├── src/
│   ├── index.js              # 메인 엔트리
│   ├── config/
│   │   ├── index.js          # 설정 관리
│   │   └── templates.js      # Nginx 템플릿
│   ├── services/
│   │   ├── queueService.js   # 메시지 큐 처리
│   │   ├── nginxService.js   # Nginx 관리
│   │   └── validationService.js # 검증 로직
│   ├── utils/
│   │   ├── logger.js         # 로깅
│   │   └── backup.js         # 백업/복구
│   └── tests/
│       └── *.test.js         # 테스트 파일들
├── package.json
├── Dockerfile
└── README.md
```

### 2. Admin API 수정사항

#### domains.js 라우터 수정
```javascript
// /home/klaritudo/admin-api-source/routes/domains.js

const MessageQueue = require('../services/messageQueue');

// 도메인 추가
router.post('/add', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    // 기존 DB 저장 로직...
    const result = await connection.query(insertQuery, values);
    
    // Nginx 자동화 추가
    await MessageQueue.publish('nginx.domain.add', {
      id: result.insertId,
      domain: domain_name,
      type: domain_type,
      status: status,
      timestamp: new Date()
    });
    
    await connection.commit();
    res.json({ success: true, message: '도메인이 추가되었습니다' });
  } catch (error) {
    await connection.rollback();
    // 에러 처리...
  }
});

// 도메인 수정
router.put('/update/:id', authenticateToken, async (req, res) => {
  // 유사한 패턴으로 구현
  // DB 업데이트 후 MessageQueue.publish('nginx.domain.update', ...)
});

// 도메인 삭제
router.delete('/delete/:id', authenticateToken, async (req, res) => {
  // 유사한 패턴으로 구현
  // DB 삭제 후 MessageQueue.publish('nginx.domain.delete', ...)
});
```

#### Message Queue 서비스
```javascript
// /home/klaritudo/admin-api-source/services/messageQueue.js

const redis = require('redis');
const { promisify } = require('util');

class MessageQueue {
  constructor() {
    this.publisher = redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD
    });
    
    this.publish = promisify(this.publisher.publish).bind(this.publisher);
  }
  
  async publishDomainEvent(event, data) {
    const message = JSON.stringify({
      event,
      data,
      timestamp: new Date(),
      retryCount: 0
    });
    
    await this.publish('nginx-updates', message);
    console.log(`Published ${event} event for domain: ${data.domain}`);
  }
}

module.exports = new MessageQueue();
```

### 3. Nginx Manager Service 핵심 구현

#### 메인 서비스
```javascript
// /home/klaritudo/nginx-manager/src/index.js

const redis = require('redis');
const NginxService = require('./services/nginxService');
const ValidationService = require('./services/validationService');
const logger = require('./utils/logger');

class NginxManager {
  constructor() {
    this.nginxService = new NginxService();
    this.validator = new ValidationService();
    this.setupSubscriber();
  }
  
  setupSubscriber() {
    this.subscriber = redis.createClient({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASSWORD
    });
    
    this.subscriber.subscribe('nginx-updates');
    this.subscriber.on('message', this.handleMessage.bind(this));
  }
  
  async handleMessage(channel, message) {
    try {
      const data = JSON.parse(message);
      logger.info(`Received event: ${data.event}`, data);
      
      // 검증
      if (!this.validator.validateDomain(data.data.domain)) {
        throw new Error('Invalid domain format');
      }
      
      // 처리
      switch (data.event) {
        case 'nginx.domain.add':
          await this.nginxService.addDomain(data.data);
          break;
        case 'nginx.domain.update':
          await this.nginxService.updateDomain(data.data);
          break;
        case 'nginx.domain.delete':
          await this.nginxService.deleteDomain(data.data);
          break;
      }
      
      logger.info(`Successfully processed ${data.event}`);
    } catch (error) {
      logger.error('Message processing failed:', error);
      await this.handleError(data, error);
    }
  }
}
```

#### Nginx 서비스
```javascript
// /home/klaritudo/nginx-manager/src/services/nginxService.js

const fs = require('fs').promises;
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const backup = require('../utils/backup');

class NginxService {
  constructor() {
    this.configPath = '/etc/nginx/sites-available/';
    this.enabledPath = '/etc/nginx/sites-enabled/';
    this.ports = {
      admin: 5173,
      user: 3001,
      api: 5000
    };
  }
  
  async addDomain(domainData) {
    const { domain, type } = domainData;
    
    // 백업 생성
    await backup.create();
    
    try {
      // 설정 파일 생성
      const config = this.generateConfig(domain, type);
      const filename = this.sanitizeFilename(domain);
      
      await fs.writeFile(
        `${this.configPath}${filename}`,
        config,
        'utf8'
      );
      
      // 심볼릭 링크 생성
      await execAsync(
        `ln -sf ${this.configPath}${filename} ${this.enabledPath}${filename}`
      );
      
      // Nginx 설정 테스트
      await this.testConfig();
      
      // Nginx 리로드
      await this.reloadNginx();
      
    } catch (error) {
      // 실패 시 롤백
      await backup.restore();
      throw error;
    }
  }
  
  generateConfig(domain, type) {
    const template = type === 'admin' ? 
      this.getAdminTemplate() : 
      this.getUserTemplate();
    
    return template
      .replace(/{{DOMAIN}}/g, domain)
      .replace(/{{ADMIN_PORT}}/g, this.ports.admin)
      .replace(/{{USER_PORT}}/g, this.ports.user)
      .replace(/{{API_PORT}}/g, this.ports.api);
  }
  
  async testConfig() {
    const { stderr } = await execAsync('nginx -t');
    if (stderr && !stderr.includes('syntax is ok')) {
      throw new Error(`Nginx config test failed: ${stderr}`);
    }
  }
  
  async reloadNginx() {
    await execAsync('systemctl reload nginx');
  }
}
```

## 🧪 테스트 전략

### 1. 단위 테스트
```javascript
// 도메인 검증 테스트
describe('Domain Validation', () => {
  test('should accept valid domains', () => {
    expect(validate('example.com')).toBe(true);
    expect(validate('sub.example.com')).toBe(true);
  });
  
  test('should reject invalid domains', () => {
    expect(validate('localhost')).toBe(false);
    expect(validate('../../etc/passwd')).toBe(false);
  });
});
```

### 2. 통합 테스트
```javascript
// E2E 플로우 테스트
describe('Domain Management E2E', () => {
  test('should add domain and configure nginx', async () => {
    // 1. API로 도메인 추가
    const response = await api.post('/domains/add', {
      domain: 'test.example.com',
      type: 'admin'
    });
    
    // 2. Nginx 설정 파일 확인
    const configExists = await fs.exists(
      '/etc/nginx/sites-available/test.example.com'
    );
    
    // 3. 도메인 접근 테스트
    const siteResponse = await fetch('http://test.example.com');
    
    expect(response.status).toBe(200);
    expect(configExists).toBe(true);
    expect(siteResponse.status).toBe(200);
  });
});
```

### 3. 부하 테스트
```yaml
# K6 부하 테스트 시나리오
scenarios:
  domain_operations:
    executor: 'ramping-vus'
    stages:
      - duration: '2m', target: 10  # 10 동시 작업
      - duration: '5m', target: 50  # 50 동시 작업
      - duration: '2m', target: 0   # 쿨다운
```

## 🔄 롤백 계획

### 1. 자동 롤백 트리거
- Nginx 설정 테스트 실패
- Nginx 리로드 실패
- 헬스체크 3회 연속 실패
- 메모리 사용량 90% 초과

### 2. 롤백 프로세스
```javascript
class BackupManager {
  async createBackup() {
    const timestamp = Date.now();
    const backupDir = `/var/backups/nginx/${timestamp}`;
    
    // Nginx 설정 백업
    await execAsync(`cp -r /etc/nginx ${backupDir}`);
    
    // DB 스냅샷
    await this.createDBSnapshot(timestamp);
    
    return timestamp;
  }
  
  async restore(timestamp) {
    // Nginx 설정 복원
    await execAsync(`cp -r /var/backups/nginx/${timestamp}/* /etc/nginx/`);
    
    // Nginx 리로드
    await execAsync('systemctl reload nginx');
    
    // 알림 발송
    await this.notifyAdmins('Rollback completed');
  }
}
```

## 📊 모니터링 및 알림

### 1. 헬스체크 엔드포인트
```javascript
// GET /health
{
  "status": "healthy",
  "nginx": {
    "status": "running",
    "configTest": "passed",
    "lastReload": "2024-01-20T10:30:00Z"
  },
  "queue": {
    "connected": true,
    "pending": 0,
    "processed": 1234
  },
  "errors": {
    "last24h": 2,
    "last7d": 5
  }
}
```

### 2. 메트릭 수집
- 도메인 작업 처리 시간
- Nginx 리로드 횟수
- 에러율 및 패턴
- 시스템 리소스 사용량

### 3. 알림 조건
- 에러율 5% 초과
- 처리 시간 5초 초과
- 큐 대기 메시지 100개 초과
- Nginx 다운타임 감지

## 🚀 배포 계획

### Phase 1: 개발 환경 (Week 1)
1. Nginx Manager Service 개발
2. Admin API 수정
3. 단위 테스트 작성
4. 로컬 환경 테스트

### Phase 2: 테스트 환경 (Week 2)
1. Docker 컨테이너 구성
2. 통합 테스트 실행
3. 부하 테스트
4. 보안 검증

### Phase 3: 스테이징 (Week 3)
1. 실제 도메인으로 테스트
2. 롤백 시나리오 검증
3. 모니터링 설정
4. 문서화 완료

### Phase 4: 프로덕션 (Week 4)
1. 백업 생성
2. 점진적 배포
3. 모니터링 강화
4. 운영 이관

## 📝 의존성 및 요구사항

### 시스템 요구사항
- Node.js 18+ (Admin API, Nginx Manager)
- Redis 7+ (메시지 큐)
- Nginx 1.24+ (웹 서버)
- Linux (Ubuntu 22.04 권장)

### NPM 패키지
```json
{
  "dependencies": {
    "redis": "^4.6.7",
    "winston": "^3.17.0",
    "joi": "^17.9.0",
    "dotenv": "^16.5.0",
    "node-cron": "^3.0.2"
  },
  "devDependencies": {
    "jest": "^30.0.5",
    "supertest": "^7.1.4"
  }
}
```

## ✅ 성공 지표

### 기술적 지표
- ✅ 도메인 작업 자동화율: 100%
- ✅ 평균 처리 시간: <2초
- ✅ 에러율: <1%
- ✅ 시스템 가용성: 99.9%

### 비즈니스 지표
- ✅ 관리자 작업 시간: 90% 감소
- ✅ 설정 오류: 95% 감소
- ✅ 도메인 활성화 시간: 즉시

## 🎯 결론

이 구현 계획은 도메인 관리 시스템과 Nginx 설정을 완전히 자동화하여:

1. **수동 작업 제거**: 관리자가 도메인 설정 페이지에서 추가/수정/삭제하면 즉시 적용
2. **보안 강화**: 권한 분리와 입력 검증으로 시스템 보안 확보
3. **안정성 보장**: 자동 백업과 롤백으로 장애 대응
4. **확장성 확보**: 마이크로서비스 구조로 향후 확장 용이

구현 시 기존 시스템에 영향 없이 점진적으로 적용 가능하며, 실패 시 즉시 롤백 가능한 안전한 구조입니다.

---
*작성일: 2025-01-20*
*작성자: System Architect*
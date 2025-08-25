# 워드프레스 스타일 배포 시스템 구축 가이드

## 🎯 목표
워드프레스처럼 누구나 쉽게 설치하고 관리할 수 있는 고객센터 시스템 만들기

---

## 📌 워드프레스의 장점 분석

### 1. 간단한 설치 과정
- 5분 설치 (Famous 5-minute install)
- 웹 기반 설치 마법사
- 데이터베이스 자동 설정
- 관리자 계정 자동 생성

### 2. 유연한 환경 대응
- 어떤 서버든 설치 가능
- 자동 환경 감지
- 동적 URL 설정
- 플러그인 시스템

### 3. 쉬운 관리
- 웹 기반 설정 관리
- 원클릭 업데이트
- 백업/복원 기능
- 멀티사이트 지원

---

## 🔄 현재 시스템 vs 목표 시스템

### 현재 문제점
```javascript
// 현재: IP가 코드에 박혀있음
const API_URL = 'http://220.95.232.167:5001';

// 현재: 빌드 시점에 설정 고정
npm run build  // 이때 모든 설정이 번들에 포함됨

// 현재: 서버 이전 시 재빌드 필요
// 새 서버 → 소스 수정 → 재빌드 → 배포
```

### 목표 시스템
```javascript
// 목표: 동적 설정
const API_URL = window.CONFIG?.API_URL || '/api';

// 목표: 런타임 설정
// 설치 시 자동으로 config.js 생성

// 목표: 서버 이전 시
// 새 서버 → 설치 스크립트 실행 → 완료
```

---

## 🛠️ 구현 로드맵

### Phase 1: 기초 작업 (1주)

#### 1.1 설정 시스템 개선
```javascript
// public/index.html
<script src="/config.js"></script>

// config.js (런타임에 생성)
window.CONFIG = {
  API_URL: 'http://현재서버:5001',
  ADMIN_API_URL: 'http://현재서버:5000',
  SOCKET_URL: 'http://현재서버:5001'
};

// 앱에서 사용
const apiUrl = window.CONFIG?.API_URL || '/api';
```

#### 1.2 Docker Entrypoint 스크립트
```bash
#!/bin/sh
# docker-entrypoint.sh

# 현재 서버 IP 자동 감지
SERVER_IP=$(hostname -I | awk '{print $1}')

# 런타임 설정 파일 생성
cat > /app/build/config.js << EOF
window.CONFIG = {
  API_URL: "${API_URL:-http://${SERVER_IP}:5001}",
  ADMIN_API_URL: "${ADMIN_API_URL:-http://${SERVER_IP}:5000}",
  SOCKET_URL: "${SOCKET_URL:-http://${SERVER_IP}:5001}",
  VERSION: "${APP_VERSION:-1.0.0}"
};
EOF

# 메인 프로세스 실행
exec "$@"
```

### Phase 2: 설치 시스템 구축 (2-3주)

#### 2.1 설치 스크립트
```bash
#!/bin/bash
# install.sh - 워드프레스 스타일 설치

echo "======================================"
echo "   고객센터 시스템 설치 마법사 v1.0"
echo "======================================"
echo ""

# 1. 시스템 요구사항 확인
check_requirements() {
  echo "📋 시스템 요구사항 확인 중..."
  
  # Docker 확인
  if ! command -v docker &> /dev/null; then
    echo "❌ Docker가 설치되어 있지 않습니다."
    read -p "Docker를 설치하시겠습니까? (y/n): " install_docker
    if [ "$install_docker" = "y" ]; then
      curl -fsSL https://get.docker.com -o get-docker.sh
      sh get-docker.sh
    else
      exit 1
    fi
  fi
  
  echo "✅ Docker 확인 완료"
  
  # Docker Compose 확인
  if ! command -v docker-compose &> /dev/null; then
    echo "📦 Docker Compose 설치 중..."
    sudo apt-get update
    sudo apt-get install -y docker-compose
  fi
  
  echo "✅ 모든 요구사항 충족"
}

# 2. 설정 정보 입력
configure_system() {
  echo ""
  echo "🔧 시스템 설정"
  echo "--------------"
  
  # 서버 정보
  DEFAULT_IP=$(hostname -I | awk '{print $1}')
  read -p "서버 IP 주소 [$DEFAULT_IP]: " SERVER_IP
  SERVER_IP=${SERVER_IP:-$DEFAULT_IP}
  
  # 데이터베이스 설정
  echo ""
  echo "💾 데이터베이스 설정"
  read -p "MySQL 호스트 [localhost]: " DB_HOST
  DB_HOST=${DB_HOST:-localhost}
  
  read -p "MySQL 포트 [3306]: " DB_PORT
  DB_PORT=${DB_PORT:-3306}
  
  read -p "데이터베이스 이름 [customer_center]: " DB_NAME
  DB_NAME=${DB_NAME:-customer_center}
  
  read -p "MySQL 사용자 [root]: " DB_USER
  DB_USER=${DB_USER:-root}
  
  read -sp "MySQL 비밀번호: " DB_PASSWORD
  echo ""
  
  # 관리자 계정
  echo ""
  echo "👤 관리자 계정 설정"
  read -p "관리자 이메일: " ADMIN_EMAIL
  read -sp "관리자 비밀번호: " ADMIN_PASSWORD
  echo ""
  
  # 포트 설정
  echo ""
  echo "🔌 포트 설정 (기본값 사용 권장)"
  read -p "User API 포트 [5001]: " USER_API_PORT
  USER_API_PORT=${USER_API_PORT:-5001}
  
  read -p "Admin API 포트 [5000]: " ADMIN_API_PORT
  ADMIN_API_PORT=${ADMIN_API_PORT:-5000}
  
  read -p "User Page 포트 [3000]: " USER_PAGE_PORT
  USER_PAGE_PORT=${USER_PAGE_PORT:-3000}
  
  read -p "Admin Dashboard 포트 [5173]: " ADMIN_DASH_PORT
  ADMIN_DASH_PORT=${ADMIN_DASH_PORT:-5173}
}

# 3. 설정 파일 생성
create_config_files() {
  echo ""
  echo "📝 설정 파일 생성 중..."
  
  # .env 파일 생성
  cat > .env << EOF
# 서버 설정
SERVER_IP=$SERVER_IP

# 데이터베이스
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# 포트 설정
USER_API_PORT=$USER_API_PORT
ADMIN_API_PORT=$ADMIN_API_PORT
USER_PAGE_PORT=$USER_PAGE_PORT
ADMIN_DASH_PORT=$ADMIN_DASH_PORT

# JWT
JWT_SECRET=$(openssl rand -base64 32)

# 관리자
ADMIN_EMAIL=$ADMIN_EMAIL
ADMIN_PASSWORD=$ADMIN_PASSWORD
EOF
  
  echo "✅ 설정 파일 생성 완료"
}

# 4. 데이터베이스 초기화
init_database() {
  echo ""
  echo "🗄️ 데이터베이스 초기화 중..."
  
  # 데이터베이스 생성
  mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD << EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME;
USE $DB_NAME;
EOF
  
  # 테이블 생성
  mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD $DB_NAME < ./sql/schema.sql
  
  # 초기 데이터 입력
  mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD $DB_NAME < ./sql/init-data.sql
  
  # 관리자 계정 생성
  HASHED_PASSWORD=$(node -e "console.log(require('bcrypt').hashSync('$ADMIN_PASSWORD', 10))")
  mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD $DB_NAME << EOF
INSERT INTO admins (email, password, name, role, created_at)
VALUES ('$ADMIN_EMAIL', '$HASHED_PASSWORD', '관리자', 'super_admin', NOW());
EOF
  
  echo "✅ 데이터베이스 초기화 완료"
}

# 5. Docker 이미지 빌드 및 실행
deploy_system() {
  echo ""
  echo "🐳 시스템 배포 중..."
  
  # Docker Compose 파일 생성
  envsubst < docker-compose.template.yml > docker-compose.yml
  
  # 이미지 빌드
  docker-compose build
  
  # 컨테이너 실행
  docker-compose up -d
  
  echo "✅ 시스템 배포 완료"
}

# 6. 설치 완료
finish_installation() {
  echo ""
  echo "======================================"
  echo "   🎉 설치가 완료되었습니다!"
  echo "======================================"
  echo ""
  echo "접속 정보:"
  echo "----------"
  echo "사용자 페이지: http://$SERVER_IP:$USER_PAGE_PORT"
  echo "관리자 페이지: http://$SERVER_IP:$ADMIN_DASH_PORT"
  echo ""
  echo "관리자 로그인:"
  echo "-------------"
  echo "이메일: $ADMIN_EMAIL"
  echo "비밀번호: (설정하신 비밀번호)"
  echo ""
  echo "다음 단계:"
  echo "----------"
  echo "1. 관리자 페이지에 로그인하세요"
  echo "2. 시스템 설정을 확인하세요"
  echo "3. SSL 인증서를 설정하세요 (권장)"
  echo ""
}

# 메인 실행
main() {
  check_requirements
  configure_system
  create_config_files
  init_database
  deploy_system
  finish_installation
}

main
```

#### 2.2 웹 기반 설치 마법사
```php
<!-- install/index.php -->
<!DOCTYPE html>
<html>
<head>
    <title>고객센터 설치 마법사</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
        }
        .step {
            display: none;
        }
        .step.active {
            display: block;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        input {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        button {
            background: #007cba;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        .progress {
            height: 4px;
            background: #e0e0e0;
            margin-bottom: 30px;
        }
        .progress-bar {
            height: 100%;
            background: #007cba;
            transition: width 0.3s;
        }
    </style>
</head>
<body>
    <h1>고객센터 설치 마법사</h1>
    
    <div class="progress">
        <div class="progress-bar" id="progress"></div>
    </div>
    
    <!-- Step 1: 요구사항 확인 -->
    <div class="step active" id="step1">
        <h2>시스템 요구사항 확인</h2>
        <ul id="requirements">
            <li>PHP 7.4+ ... 확인 중...</li>
            <li>MySQL 5.7+ ... 확인 중...</li>
            <li>Node.js 18+ ... 확인 중...</li>
            <li>Docker ... 확인 중...</li>
        </ul>
        <button onclick="nextStep(2)">다음</button>
    </div>
    
    <!-- Step 2: 데이터베이스 설정 -->
    <div class="step" id="step2">
        <h2>데이터베이스 설정</h2>
        <div class="form-group">
            <label>데이터베이스 호스트</label>
            <input type="text" id="db_host" value="localhost">
        </div>
        <div class="form-group">
            <label>데이터베이스 이름</label>
            <input type="text" id="db_name" value="customer_center">
        </div>
        <div class="form-group">
            <label>사용자명</label>
            <input type="text" id="db_user" value="root">
        </div>
        <div class="form-group">
            <label>비밀번호</label>
            <input type="password" id="db_pass">
        </div>
        <button onclick="testDatabase()">연결 테스트</button>
        <button onclick="nextStep(3)">다음</button>
    </div>
    
    <!-- Step 3: 관리자 계정 -->
    <div class="step" id="step3">
        <h2>관리자 계정 설정</h2>
        <div class="form-group">
            <label>관리자 이메일</label>
            <input type="email" id="admin_email">
        </div>
        <div class="form-group">
            <label>관리자 비밀번호</label>
            <input type="password" id="admin_pass">
        </div>
        <div class="form-group">
            <label>비밀번호 확인</label>
            <input type="password" id="admin_pass_confirm">
        </div>
        <button onclick="nextStep(4)">다음</button>
    </div>
    
    <!-- Step 4: 설치 진행 -->
    <div class="step" id="step4">
        <h2>설치 진행 중...</h2>
        <div id="install-log">
            <p>📦 파일 복사 중...</p>
            <p>🗄️ 데이터베이스 생성 중...</p>
            <p>⚙️ 설정 파일 생성 중...</p>
            <p>🚀 서비스 시작 중...</p>
        </div>
    </div>
    
    <!-- Step 5: 완료 -->
    <div class="step" id="step5">
        <h2>🎉 설치 완료!</h2>
        <p>고객센터 시스템이 성공적으로 설치되었습니다.</p>
        <div style="background: #f0f0f0; padding: 15px; border-radius: 4px;">
            <p><strong>사용자 페이지:</strong> <a href="http://localhost:3000">http://localhost:3000</a></p>
            <p><strong>관리자 페이지:</strong> <a href="http://localhost:5173">http://localhost:5173</a></p>
        </div>
        <button onclick="window.location.href='/admin'">관리자 페이지로 이동</button>
    </div>
    
    <script>
        let currentStep = 1;
        
        function nextStep(step) {
            document.getElementById('step' + currentStep).classList.remove('active');
            document.getElementById('step' + step).classList.add('active');
            currentStep = step;
            
            // 진행률 업데이트
            document.getElementById('progress').style.width = (step * 20) + '%';
            
            if (step === 4) {
                startInstallation();
            }
        }
        
        function testDatabase() {
            // AJAX로 데이터베이스 연결 테스트
            fetch('/install/test-db.php', {
                method: 'POST',
                body: JSON.stringify({
                    host: document.getElementById('db_host').value,
                    name: document.getElementById('db_name').value,
                    user: document.getElementById('db_user').value,
                    pass: document.getElementById('db_pass').value
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('✅ 데이터베이스 연결 성공!');
                } else {
                    alert('❌ 연결 실패: ' + data.error);
                }
            });
        }
        
        function startInstallation() {
            // 설치 프로세스 시작
            fetch('/install/process.php', {
                method: 'POST',
                body: JSON.stringify({
                    db: {
                        host: document.getElementById('db_host').value,
                        name: document.getElementById('db_name').value,
                        user: document.getElementById('db_user').value,
                        pass: document.getElementById('db_pass').value
                    },
                    admin: {
                        email: document.getElementById('admin_email').value,
                        pass: document.getElementById('admin_pass').value
                    }
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    nextStep(5);
                } else {
                    alert('설치 실패: ' + data.error);
                }
            });
        }
        
        // 요구사항 자동 확인
        window.onload = function() {
            checkRequirements();
        };
        
        function checkRequirements() {
            fetch('/install/check-requirements.php')
            .then(response => response.json())
            .then(data => {
                let html = '';
                for (let req in data) {
                    html += '<li>' + req + ' ... ' + 
                            (data[req] ? '✅ 확인' : '❌ 누락') + '</li>';
                }
                document.getElementById('requirements').innerHTML = html;
            });
        }
    </script>
</body>
</html>
```

### Phase 3: 관리 시스템 구축 (1개월)

#### 3.1 설정 관리 UI
```javascript
// AdminDashboard - 시스템 설정 페이지
import React, { useState, useEffect } from 'react';

const SystemSettings = () => {
  const [settings, setSettings] = useState({});
  
  const updateSetting = async (key, value) => {
    await fetch('/api/settings', {
      method: 'PUT',
      body: JSON.stringify({ key, value })
    });
    
    // 실시간 반영
    window.CONFIG[key] = value;
  };
  
  return (
    <div className="settings-page">
      <h2>시스템 설정</h2>
      
      <div className="setting-group">
        <h3>API 설정</h3>
        <input 
          type="text" 
          value={settings.API_URL}
          onChange={(e) => updateSetting('API_URL', e.target.value)}
          placeholder="API 서버 주소"
        />
      </div>
      
      <div className="setting-group">
        <h3>데이터베이스</h3>
        <button onClick={testDatabaseConnection}>연결 테스트</button>
      </div>
      
      <div className="setting-group">
        <h3>백업/복원</h3>
        <button onClick={createBackup}>백업 생성</button>
        <button onClick={restoreBackup}>백업 복원</button>
      </div>
    </div>
  );
};
```

#### 3.2 자동 업데이트 시스템
```javascript
// 업데이트 확인 및 적용
const checkForUpdates = async () => {
  const response = await fetch('https://update.server.com/check', {
    method: 'POST',
    body: JSON.stringify({
      version: window.CONFIG.VERSION,
      site: window.location.hostname
    })
  });
  
  const data = await response.json();
  
  if (data.updateAvailable) {
    if (confirm('새 버전이 있습니다. 업데이트하시겠습니까?')) {
      await applyUpdate(data.updateUrl);
    }
  }
};

const applyUpdate = async (updateUrl) => {
  // 백업 생성
  await createBackup();
  
  // 업데이트 다운로드 및 적용
  const response = await fetch(updateUrl);
  const updateScript = await response.text();
  
  // Docker 이미지 업데이트
  await fetch('/api/system/update', {
    method: 'POST',
    body: updateScript
  });
  
  // 시스템 재시작
  await restartSystem();
};
```

---

## 📊 예상 효과

### 설치 시간 단축
- 현재: 2-3시간 (수동 설정)
- 개선 후: 5분 (자동 설치)

### 서버 이전
- 현재: 소스 수정 → 재빌드 → 재배포 (2-3시간)
- 개선 후: 백업 → 새 서버 설치 → 복원 (10분)

### 관리 편의성
- GUI 기반 설정 관리
- 자동 업데이트
- 멀티사이트 지원

---

## 🚀 다음 단계

1. **즉시 시작 (Phase 1)**
   - IP 하드코딩 제거
   - 런타임 설정 시스템 구축
   - Docker entrypoint 스크립트 작성

2. **우선순위 작업 (Phase 2)**
   - 설치 스크립트 개발
   - 웹 기반 설치 마법사 구현
   - 자동 환경 감지 시스템

3. **장기 목표 (Phase 3)**
   - 관리 UI 구축
   - 자동 업데이트 시스템
   - 플러그인/테마 시스템

---

## 📚 참고 자료

- [WordPress Installation](https://wordpress.org/support/article/how-to-install-wordpress/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [12 Factor App](https://12factor.net/)
- [Configuration Management](https://www.redhat.com/en/topics/automation/what-is-configuration-management)

최종 업데이트: 2025-08-17
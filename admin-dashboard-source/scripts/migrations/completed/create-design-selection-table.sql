-- 디자인 템플릿 테이블 (기존 5개 디자인 정보 저장)
CREATE TABLE IF NOT EXISTS design_templates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  design_name VARCHAR(50) NOT NULL UNIQUE, -- '디자인1', '디자인2' 등
  admin_logo_url VARCHAR(500),
  admin_logo_width INT DEFAULT 200,
  admin_logo_height INT DEFAULT 60,
  user_main_logo_url VARCHAR(500),
  user_main_logo_width INT DEFAULT 180,
  user_main_logo_height INT DEFAULT 50,
  user_footer_logo_url VARCHAR(500),
  user_footer_logo_width INT DEFAULT 150,
  user_footer_logo_height INT DEFAULT 40,
  background_type ENUM('color', 'image') DEFAULT 'color',
  background_color VARCHAR(7) DEFAULT '#f5f5f5',
  background_image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 디자인 템플릿 슬라이드 테이블
CREATE TABLE IF NOT EXISTS design_template_slides (
  id INT PRIMARY KEY AUTO_INCREMENT,
  template_id INT NOT NULL,
  slide_order INT NOT NULL,
  title VARCHAR(100),
  image_url VARCHAR(500),
  FOREIGN KEY (template_id) REFERENCES design_templates(id) ON DELETE CASCADE,
  UNIQUE KEY unique_template_slide (template_id, slide_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 디자인 템플릿 SNS 설정 테이블
CREATE TABLE IF NOT EXISTS design_template_sns (
  id INT PRIMARY KEY AUTO_INCREMENT,
  template_id INT NOT NULL,
  platform VARCHAR(20) NOT NULL, -- 'facebook', 'twitter', 'instagram', 'youtube', 'telegram', 'kakao'
  icon_url VARCHAR(500),
  link_url VARCHAR(500),
  FOREIGN KEY (template_id) REFERENCES design_templates(id) ON DELETE CASCADE,
  UNIQUE KEY unique_template_sns (template_id, platform)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 도메인-디자인 매핑 테이블 (도메인별 디자인 선택)
CREATE TABLE IF NOT EXISTS domain_design_mapping (
  id INT PRIMARY KEY AUTO_INCREMENT,
  domain_id INT NOT NULL,
  template_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE,
  FOREIGN KEY (template_id) REFERENCES design_templates(id),
  UNIQUE KEY unique_domain_design (domain_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 회원-디자인 매핑 테이블 (부모 단계별 디자인 선택)
CREATE TABLE IF NOT EXISTS member_design_mapping (
  id INT PRIMARY KEY AUTO_INCREMENT,
  member_id INT NOT NULL,
  template_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  FOREIGN KEY (template_id) REFERENCES design_templates(id),
  UNIQUE KEY unique_member_design (member_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 디자인 선택 방식 설정 (시스템 전체 설정)
CREATE TABLE IF NOT EXISTS design_selection_settings (
  id INT PRIMARY KEY DEFAULT 1,
  selection_mode ENUM('parent', 'domain') DEFAULT 'domain', -- 부모 단계 or 도메인 단위
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 기본 디자인 템플릿 데이터 삽입
INSERT INTO design_templates (design_name) VALUES 
('디자인1'), ('디자인2'), ('디자인3'), ('디자인4'), ('디자인5')
ON DUPLICATE KEY UPDATE design_name=VALUES(design_name);

-- 각 템플릿에 대한 기본 슬라이드 생성
INSERT INTO design_template_slides (template_id, slide_order, title)
SELECT dt.id, s.slide_order, s.title
FROM design_templates dt
CROSS JOIN (
  SELECT 1 as slide_order, '슬라이드 1' as title
  UNION SELECT 2, '슬라이드 2'
  UNION SELECT 3, '슬라이드 3'
) s
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 각 템플릿에 대한 기본 SNS 플랫폼 생성
INSERT INTO design_template_sns (template_id, platform)
SELECT dt.id, s.platform
FROM design_templates dt
CROSS JOIN (
  SELECT 'facebook' as platform
  UNION SELECT 'twitter'
  UNION SELECT 'instagram'
  UNION SELECT 'youtube'
  UNION SELECT 'telegram'
  UNION SELECT 'kakao'
) s
ON DUPLICATE KEY UPDATE platform=VALUES(platform);

-- 기본 디자인 선택 방식 설정
INSERT INTO design_selection_settings (id, selection_mode) 
VALUES (1, 'domain')
ON DUPLICATE KEY UPDATE id=id;
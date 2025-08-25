-- 권한 시스템 스키마 업데이트
-- 작성일: 2025-06-28
-- 목적: agent_levels와 members 테이블에 권한 관련 컬럼 추가

-- 1. agent_levels 테이블에 default_permissions 컬럼 추가
ALTER TABLE agent_levels 
ADD COLUMN default_permissions JSON DEFAULT NULL 
COMMENT '단계별 기본 권한 설정' 
AFTER label;

-- 2. members 테이블에 permission_override 컬럼 추가
ALTER TABLE members 
ADD COLUMN permission_override JSON DEFAULT NULL 
COMMENT '회원별 권한 오버라이드 설정' 
AFTER agent_level_id;

-- 3. 기본 권한 데이터 설정 (예시)
-- 슈퍼관리자 (1단계)
UPDATE agent_levels 
SET default_permissions = JSON_OBJECT(
    'menus', JSON_ARRAY('*'),
    'buttons', JSON_ARRAY('*'),
    'features', JSON_ARRAY('*'),
    'restrictions', JSON_OBJECT(
        'menus', JSON_ARRAY(),
        'buttons', JSON_ARRAY(),
        'readOnly', JSON_ARRAY()
    )
)
WHERE id = 1;

-- 마스터 (999단계)
UPDATE agent_levels 
SET default_permissions = JSON_OBJECT(
    'menus', JSON_ARRAY('*'),
    'buttons', JSON_ARRAY('*'),
    'features', JSON_ARRAY('*'),
    'restrictions', JSON_OBJECT(
        'menus', JSON_ARRAY(),
        'buttons', JSON_ARRAY(),
        'readOnly', JSON_ARRAY()
    )
)
WHERE id = 999;

-- 대본 (2단계) - 예시
UPDATE agent_levels 
SET default_permissions = JSON_OBJECT(
    'menus', JSON_ARRAY('회원관리', '머니이동내역', '롤링내역', '베팅내역', '정산'),
    'buttons', JSON_ARRAY('조회', '엑셀다운로드', '회원추가', '머니이동'),
    'features', JSON_ARRAY('잔액확인', '베팅조회', '정산조회'),
    'restrictions', JSON_OBJECT(
        'menus', JSON_ARRAY('시스템설정', '권한설정'),
        'buttons', JSON_ARRAY('삭제'),
        'readOnly', JSON_ARRAY()
    )
)
WHERE id = 2;

-- 본사 (3단계) - 예시
UPDATE agent_levels 
SET default_permissions = JSON_OBJECT(
    'menus', JSON_ARRAY('회원관리', '머니이동내역', '롤링내역', '베팅내역', '정산'),
    'buttons', JSON_ARRAY('조회', '엑셀다운로드', '회원추가', '머니이동'),
    'features', JSON_ARRAY('잔액확인', '베팅조회', '정산조회'),
    'restrictions', JSON_OBJECT(
        'menus', JSON_ARRAY('시스템설정', '권한설정'),
        'buttons', JSON_ARRAY('삭제', '권한변경'),
        'readOnly', JSON_ARRAY()
    )
)
WHERE id = 3;

-- 나머지 단계들은 일단 기본값으로 설정
UPDATE agent_levels 
SET default_permissions = JSON_OBJECT(
    'menus', JSON_ARRAY('회원관리', '베팅내역', '정산'),
    'buttons', JSON_ARRAY('조회'),
    'features', JSON_ARRAY('잔액확인'),
    'restrictions', JSON_OBJECT(
        'menus', JSON_ARRAY(),
        'buttons', JSON_ARRAY(),
        'readOnly', JSON_ARRAY()
    )
)
WHERE id NOT IN (1, 2, 3, 999) AND default_permissions IS NULL;
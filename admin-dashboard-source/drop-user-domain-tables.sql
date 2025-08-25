-- 유저 도메인 관련 테이블 삭제

-- 1. 외래키 제약조건이 있는 테이블부터 삭제
DROP TABLE IF EXISTS domain_access_logs;
DROP TABLE IF EXISTS member_domains;
DROP TABLE IF EXISTS domain_permissions_delegation;

-- 2. 유저 도메인 데이터만 삭제 (도메인 권한 테이블에서)
DELETE FROM domain_permissions WHERE domain_id IN (SELECT id FROM domains WHERE domain_type = 'user');

-- 3. 유저 도메인만 삭제
DELETE FROM domains WHERE domain_type = 'user';

-- 4. 시스템 설정에서 도메인 관련 설정 삭제
DELETE FROM system_settings WHERE setting_key IN ('domain_setting_level', 'allow_multiple_domains', 'domain_access_log_retention_days');
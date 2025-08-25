-- honor_transactions 테이블에 metadata 컬럼 추가
ALTER TABLE honor_transactions 
ADD COLUMN metadata JSON DEFAULT NULL 
COMMENT 'Additional transaction metadata' 
AFTER object_id;

-- 인덱스 추가 (선택사항)
-- JSON 컬럼은 직접 인덱싱할 수 없지만, 가상 컬럼을 통해 가능
-- 예: ALTER TABLE honor_transactions ADD INDEX idx_metadata_queue_id ((JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.queue_id'))));
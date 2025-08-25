-- money_processing_history 테이블에 payment_method 컬럼 추가
-- 이미 존재하는 경우 무시

-- 컬럼 존재 여부 확인 후 추가
SET @dbname = 'newmoon';
SET @tablename = 'money_processing_history';
SET @columnname = 'payment_method';

SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE table_name = @tablename
      AND table_schema = @dbname
      AND column_name = @columnname
  ) > 0,
  "SELECT 'Column already exists' AS result;",
  CONCAT("ALTER TABLE ", @tablename, " ADD COLUMN `payment_method` VARCHAR(50) DEFAULT '무통장' COMMENT '결제수단';")
));

PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 기존 데이터 업데이트 (모두 무통장으로 설정)
UPDATE money_processing_history 
SET payment_method = '무통장' 
WHERE payment_method IS NULL;
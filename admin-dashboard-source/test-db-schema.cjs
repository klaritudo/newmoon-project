const mysql = require('mysql2/promise');

async function checkPopupSchema() {
  const connection = await mysql.createConnection({
    host: '125.187.89.85',
    port: 3306,
    user: 'gambling_db_user',
    password: 'a123456789!',
    database: 'gambling_platform'
  });

  try {
    // display_page 필드 정보 확인
    const [columns] = await connection.execute(
      "SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'gambling_platform' AND TABLE_NAME = 'popups' AND COLUMN_NAME = 'display_page'"
    );
    
    console.log('display_page 필드 정보:');
    console.log(columns);
    
    // ENUM 값들 확인
    if (columns.length > 0) {
      const columnType = columns[0].COLUMN_TYPE;
      console.log('\nCOLUMN_TYPE:', columnType);
      
      // ENUM 값 추출
      if (columnType.includes('enum')) {
        const enumValues = columnType.match(/enum\((.*?)\)/)[1];
        console.log('허용되는 ENUM 값들:', enumValues);
      }
    }
    
    // 현재 팝업들의 display_page 값 확인
    const [currentValues] = await connection.execute(
      "SELECT DISTINCT display_page FROM popups"
    );
    
    console.log('\n현재 DB에 저장된 display_page 값들:');
    currentValues.forEach(row => {
      console.log(`- "${row.display_page}"`);
    });

  } catch (error) {
    console.error('데이터베이스 오류:', error.message);
  } finally {
    await connection.end();
  }
}

checkPopupSchema();
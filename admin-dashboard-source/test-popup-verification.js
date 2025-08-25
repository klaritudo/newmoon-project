import { chromium } from 'playwright';
import fs from 'fs';

async function testPopupVerification() {
    const browser = await chromium.launch({ 
        headless: true
    });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        // 로그인 없이 접근 가능한 경우를 위한 설정
        ignoreHTTPSErrors: true
    });
    const page = await context.newPage();

    try {
        console.log('🚀 팝업 다이얼로그 수정사항 검증 시작...\n');
        
        // 1. 개발환경 접속
        console.log('📍 개발환경 접속 중...');
        await page.goto('http://125.187.89.85:5173/board/popup', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        const currentUrl = page.url();
        console.log('현재 URL:', currentUrl);
        
        // 페이지 로딩 확인
        await page.waitForTimeout(3000);
        
        // 로그인 페이지인지 확인
        if (currentUrl.includes('login')) {
            console.log('❌ 로그인이 필요한 페이지입니다.');
            console.log('📝 로그인 후 수동으로 팝업 페이지에 접근해주세요.');
            
            // 로그인 페이지 스크린샷
            await page.screenshot({ 
                path: './test-results/login-required.png',
                fullPage: true 
            });
            
            return await generateManualTestReport();
        }
        
        // 2. 팝업 페이지 분석
        console.log('🔍 팝업 페이지 구조 분석...');
        
        // 페이지 전체 스크린샷
        await page.screenshot({ 
            path: './test-results/popup-page-full.png',
            fullPage: true 
        });
        
        // 3. 등록 버튼 찾기 및 클릭
        console.log('🎯 팝업 등록 버튼 찾기...');
        
        const addButtons = await page.locator('button').all();
        let addButtonFound = false;
        
        for (let i = 0; i < addButtons.length; i++) {
            const buttonText = await addButtons[i].textContent();
            console.log(`  버튼 ${i + 1}: "${buttonText}"`);
            
            if (buttonText.includes('등록') || buttonText.includes('추가') || buttonText.includes('팝업')) {
                console.log(`✅ 등록 버튼 발견: "${buttonText}"`);
                await addButtons[i].click();
                addButtonFound = true;
                break;
            }
        }
        
        if (!addButtonFound && addButtons.length > 0) {
            console.log('🎯 첫 번째 버튼으로 시도...');
            await addButtons[0].click();
            addButtonFound = true;
        }
        
        if (!addButtonFound) {
            console.log('❌ 등록 버튼을 찾을 수 없습니다.');
            return;
        }
        
        // 다이얼로그 로딩 대기
        await page.waitForTimeout(2000);
        
        // 4. 다이얼로그 확인
        console.log('🔍 다이얼로그 확인...');
        
        const dialog = await page.locator('[role="dialog"], .MuiDialog-root').first();
        
        if (await dialog.count() === 0) {
            console.log('❌ 다이얼로그가 열리지 않았습니다.');
            await page.screenshot({ 
                path: './test-results/no-dialog.png',
                fullPage: true 
            });
            return;
        }
        
        console.log('✅ 다이얼로그가 성공적으로 열렸습니다!');
        
        // 다이얼로그 스크린샷
        await page.screenshot({ 
            path: './test-results/dialog-opened.png',
            fullPage: true 
        });
        
        // 5. 수정사항 1: 커스텀 위치 입력 필드 테스트
        console.log('\n🧪 테스트 1: 커스텀 위치 입력 필드');
        
        // 위치 선택 드롭다운 찾기
        const positionSelect = dialog.locator('select[name="position"], [name="position"]').first();
        
        if (await positionSelect.count() > 0) {
            console.log('✅ 위치 선택 필드 발견');
            
            // 커스텀 위치 선택 전 상태 확인
            const customFieldsBefore = await dialog.locator('input[name="topPosition"], input[name="leftPosition"]').count();
            console.log(`커스텀 필드 선택 전 개수: ${customFieldsBefore}`);
            
            // 커스텀 위치 선택
            await positionSelect.selectOption('custom');
            await page.waitForTimeout(1000);
            
            // 커스텀 필드가 나타났는지 확인
            const customFieldsAfter = await dialog.locator('input[name="topPosition"], input[name="leftPosition"]').count();
            console.log(`커스텀 필드 선택 후 개수: ${customFieldsAfter}`);
            
            if (customFieldsAfter > customFieldsBefore) {
                console.log('✅ 커스텀 위치 선택 시 입력 필드가 정상적으로 나타남');
                
                // 커스텀 필드에 값 입력 테스트
                const topField = dialog.locator('input[name="topPosition"]').first();
                const leftField = dialog.locator('input[name="leftPosition"]').first();
                
                if (await topField.count() > 0) {
                    await topField.fill('100');
                    console.log('✅ 상단 위치 필드에 값 입력 성공');
                }
                
                if (await leftField.count() > 0) {
                    await leftField.fill('200');
                    console.log('✅ 좌측 위치 필드에 값 입력 성공');
                }
                
                // 커스텀 필드 표시 상태 스크린샷
                await page.screenshot({ 
                    path: './test-results/custom-fields-visible.png',
                    fullPage: true 
                });
                
                // 다른 위치 선택하여 필드가 숨겨지는지 확인
                await positionSelect.selectOption('center');
                await page.waitForTimeout(1000);
                
                const customFieldsHidden = await dialog.locator('input[name="topPosition"], input[name="leftPosition"]').count();
                console.log(`다른 위치 선택 후 커스텀 필드 개수: ${customFieldsHidden}`);
                
                if (customFieldsHidden < customFieldsAfter) {
                    console.log('✅ 다른 위치 선택 시 커스텀 필드가 정상적으로 숨겨짐');
                } else {
                    console.log('⚠️ 커스텀 필드가 숨겨지지 않음 (확인 필요)');
                }
                
            } else {
                console.log('❌ 커스텀 위치 선택해도 입력 필드가 나타나지 않음');
            }
        } else {
            console.log('❌ 위치 선택 필드를 찾을 수 없음');
        }
        
        // 6. 수정사항 2: 링크 URL 입력 테스트
        console.log('\n🧪 테스트 2: 링크 URL 입력 기능');
        
        const linkField = dialog.locator('input[name="linkUrl"]').first();
        
        if (await linkField.count() > 0) {
            console.log('✅ 링크 URL 입력 필드 발견');
            
            // 테스트 URL 입력
            await linkField.fill('https://example.com');
            await page.waitForTimeout(500);
            
            const linkValue = await linkField.inputValue();
            if (linkValue === 'https://example.com') {
                console.log('✅ 링크 URL 입력 성공');
            } else {
                console.log('❌ 링크 URL 입력 실패');
            }
            
            // 링크 URL 입력 상태 스크린샷
            await page.screenshot({ 
                path: './test-results/link-url-input.png',
                fullPage: true 
            });
            
        } else {
            console.log('❌ 링크 URL 입력 필드를 찾을 수 없음');
        }
        
        // 7. 수정사항 3: 대상 선택 옵션 확인
        console.log('\n🧪 테스트 3: 대상 선택 옵션');
        
        const targetSelect = dialog.locator('select[name="target"], [name="target"]').first();
        
        if (await targetSelect.count() > 0) {
            console.log('✅ 대상 선택 필드 발견');
            
            // 옵션들 확인
            const options = await targetSelect.locator('option').all();
            console.log(`대상 선택 옵션 수: ${options.length}`);
            
            for (let i = 0; i < options.length; i++) {
                const optionText = await options[i].textContent();
                const optionValue = await options[i].getAttribute('value');
                console.log(`  옵션 ${i + 1}: "${optionText}" (value: ${optionValue})`);
            }
            
            if (options.length > 0) {
                console.log('✅ 대상 선택 옵션이 정상적으로 표시됨');
            }
        } else {
            console.log('❌ 대상 선택 필드를 찾을 수 없음');
        }
        
        // 8. 전체 폼 필드 구조 확인
        console.log('\n🧪 테스트 4: 전체 폼 필드 구조 확인');
        
        const allInputs = await dialog.locator('input, select, textarea').all();
        console.log(`다이얼로그 내 총 입력 필드 수: ${allInputs.length}`);
        
        const fieldInfo = [];
        for (let i = 0; i < allInputs.length; i++) {
            try {
                const tagName = await allInputs[i].evaluate(el => el.tagName);
                const type = await allInputs[i].getAttribute('type') || '';
                const name = await allInputs[i].getAttribute('name') || '';
                const label = await allInputs[i].getAttribute('aria-label') || '';
                const id = await allInputs[i].getAttribute('id') || '';
                
                const fieldData = {
                    index: i + 1,
                    tag: tagName,
                    type: type,
                    name: name,
                    label: label,
                    id: id
                };
                
                fieldInfo.push(fieldData);
                console.log(`  필드 ${i + 1}: ${tagName}${type ? `[${type}]` : ''} - name: "${name}" label: "${label}"`);
            } catch (e) {
                console.log(`  필드 ${i + 1}: 정보 확인 불가`);
            }
        }
        
        // 최종 다이얼로그 상태 스크린샷
        await page.screenshot({ 
            path: './test-results/dialog-final-state.png',
            fullPage: true 
        });
        
        // 9. 테스트 결과 보고서 생성
        const testResults = {
            timestamp: new Date().toISOString(),
            testUrl: 'http://125.187.89.85:5173/board/popup',
            results: {
                dialogOpened: true,
                customPositionFields: customFieldsAfter > customFieldsBefore,
                linkUrlInput: await linkField.count() > 0,
                targetSelectOptions: await targetSelect.count() > 0,
                totalFormFields: allInputs.length
            },
            fieldInfo: fieldInfo,
            screenshots: [
                'popup-page-full.png',
                'dialog-opened.png', 
                'custom-fields-visible.png',
                'link-url-input.png',
                'dialog-final-state.png'
            ]
        };
        
        // 결과를 JSON 파일로 저장
        fs.writeFileSync(
            './test-results/popup-test-results.json', 
            JSON.stringify(testResults, null, 2)
        );
        
        console.log('\n📊 테스트 완료! 결과 요약:');
        console.log('✅ 다이얼로그 열기: 성공');
        console.log(`${testResults.results.customPositionFields ? '✅' : '❌'} 커스텀 위치 입력 필드: ${testResults.results.customPositionFields ? '정상 동작' : '확인 필요'}`);
        console.log(`${testResults.results.linkUrlInput ? '✅' : '❌'} 링크 URL 입력: ${testResults.results.linkUrlInput ? '정상' : '확인 필요'}`);
        console.log(`${testResults.results.targetSelectOptions ? '✅' : '❌'} 대상 선택 옵션: ${testResults.results.targetSelectOptions ? '정상' : '확인 필요'}`);
        console.log(`📋 총 입력 필드 수: ${testResults.results.totalFormFields}개`);
        console.log('\n📁 테스트 결과 파일: test-results/popup-test-results.json');
        console.log('📸 스크린샷 파일들이 test-results/ 폴더에 저장되었습니다.');

    } catch (error) {
        console.error('❌ 테스트 중 오류 발생:', error.message);
        
        // 오류 상황 스크린샷
        try {
            await page.screenshot({ 
                path: './test-results/error-state.png',
                fullPage: true 
            });
            console.log('📸 오류 상태 스크린샷 저장: test-results/error-state.png');
        } catch (screenshotError) {
            console.log('스크린샷 저장 실패:', screenshotError.message);
        }
        
        return await generateErrorReport(error);
    } finally {
        await browser.close();
    }
}

// 수동 테스트 보고서 생성
async function generateManualTestReport() {
    const manualReport = {
        timestamp: new Date().toISOString(),
        status: 'manual_test_required',
        message: '로그인이 필요하여 자동 테스트를 완료할 수 없습니다.',
        instructions: [
            '1. http://125.187.89.85:5173/login 에서 로그인',
            '2. http://125.187.89.85:5173/board/popup 페이지로 이동',
            '3. "팝업 등록" 버튼 클릭',
            '4. 위치를 "커스텀"으로 선택하여 상단/좌측 위치 입력 필드 확인',
            '5. 링크 URL 입력 필드에 테스트 URL 입력',
            '6. 대상 선택 옵션들 확인',
            '7. 각 기능이 정상 작동하는지 확인'
        ],
        expectedFeatures: [
            '커스텀 위치 선택 시 상단 위치/좌측 위치 입력 필드 표시',
            '다른 위치 선택 시 커스텀 필드 숨김',
            '링크 URL 입력 필드 정상 동작',
            '링크 타겟이 _blank로 기본 설정',
            '대상 선택 옵션 중복 제거 확인'
        ]
    };
    
    fs.writeFileSync(
        './test-results/manual-test-guide.json', 
        JSON.stringify(manualReport, null, 2)
    );
    
    console.log('\n📋 수동 테스트 가이드가 생성되었습니다.');
    console.log('📁 파일 위치: test-results/manual-test-guide.json');
    
    return manualReport;
}

// 오류 보고서 생성
async function generateErrorReport(error) {
    const errorReport = {
        timestamp: new Date().toISOString(),
        status: 'error',
        error: error.message,
        stack: error.stack,
        recommendations: [
            '개발 서버가 실행 중인지 확인',
            '네트워크 연결 상태 확인',
            '브라우저 권한 설정 확인',
            '수동으로 페이지에 접근하여 기능 테스트'
        ]
    };
    
    fs.writeFileSync(
        './test-results/error-report.json', 
        JSON.stringify(errorReport, null, 2)
    );
    
    return errorReport;
}

testPopupVerification();
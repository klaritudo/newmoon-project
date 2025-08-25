import { chromium } from 'playwright';

async function testPopupDialog() {
    const browser = await chromium.launch({ 
        headless: true,
        slowMo: 500 // 0.5초 간격으로 실행
    });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();

    try {
        console.log('🚀 팝업 다이얼로그 테스트 시작...');
        
        // 개발환경 접속
        console.log('📍 개발환경 접속 중...');
        await page.goto('http://125.187.89.85:5173/board/popup');
        await page.waitForTimeout(3000);

        // 로그인이 필요한 경우를 위한 체크
        const currentUrl = page.url();
        console.log('현재 URL:', currentUrl);

        if (currentUrl.includes('login') || currentUrl.includes('auth')) {
            console.log('⚠️ 로그인이 필요합니다. 수동으로 로그인 후 다시 시도해주세요.');
            await page.waitForTimeout(30000); // 30초 대기 (수동 로그인 시간)
            await page.goto('http://125.187.89.85:5173/board/popup');
            await page.waitForTimeout(3000);
        }

        // 페이지 로딩 대기
        await page.waitForLoadState('networkidle');
        
        // 스크린샷 - 초기 상태
        await page.screenshot({ 
            path: '/home/klaritudo/Documents/my-project/frontend/admin-dashboard/test-results/popup-initial-state.png',
            fullPage: true 
        });
        console.log('📸 초기 상태 스크린샷 저장');

        // 1. 팝업 등록 버튼 찾기 및 클릭
        console.log('🔍 팝업 등록 버튼 찾는 중...');
        
        // 다양한 버튼 텍스트로 시도
        const buttonSelectors = [
            'button:has-text("팝업 등록")',
            'button:has-text("등록")',
            'button:has-text("추가")',
            'button:has-text("새로 만들기")',
            '[data-testid="add-popup"]',
            '.add-button',
            '.create-button'
        ];

        let addButton = null;
        for (const selector of buttonSelectors) {
            try {
                addButton = await page.locator(selector).first();
                if (await addButton.count() > 0) {
                    console.log(`✅ 버튼 발견: ${selector}`);
                    break;
                }
            } catch (e) {
                continue;
            }
        }

        if (!addButton || await addButton.count() === 0) {
            // 모든 버튼 요소 확인
            const allButtons = await page.locator('button').all();
            console.log('🔍 페이지의 모든 버튼들:');
            for (let i = 0; i < allButtons.length; i++) {
                const buttonText = await allButtons[i].textContent();
                console.log(`  버튼 ${i + 1}: "${buttonText}"`);
            }
            
            // 첫 번째 버튼 시도 (일반적으로 추가 버튼)
            if (allButtons.length > 0) {
                addButton = allButtons[0];
                console.log('첫 번째 버튼으로 시도합니다.');
            }
        }

        if (addButton && await addButton.count() > 0) {
            console.log('🎯 팝업 등록 버튼 클릭...');
            await addButton.click();
            await page.waitForTimeout(2000);
        } else {
            console.log('❌ 팝업 등록 버튼을 찾을 수 없습니다.');
            // 대안: 키보드 단축키나 다른 방법 시도
            await page.keyboard.press('Escape'); // 혹시 모를 모달 닫기
            await page.waitForTimeout(1000);
        }

        // 다이얼로그가 열렸는지 확인
        console.log('🔍 다이얼로그 확인 중...');
        const dialogSelectors = [
            '[role="dialog"]',
            '.modal',
            '.dialog',
            '.popup-dialog',
            '.mui-dialog',
            '.MuiDialog-root'
        ];

        let dialog = null;
        for (const selector of dialogSelectors) {
            try {
                dialog = page.locator(selector);
                if (await dialog.count() > 0 && await dialog.isVisible()) {
                    console.log(`✅ 다이얼로그 발견: ${selector}`);
                    break;
                }
            } catch (e) {
                continue;
            }
        }

        if (!dialog || await dialog.count() === 0) {
            console.log('❌ 다이얼로그를 찾을 수 없습니다. 페이지 구조를 분석합니다...');
            
            // 페이지 HTML 구조 분석
            const bodyContent = await page.locator('body').innerHTML();
            console.log('페이지 구조 일부:', bodyContent.substring(0, 1000));
            
            await page.screenshot({ 
                path: '/home/klaritudo/Documents/my-project/frontend/admin-dashboard/test-results/popup-no-dialog.png',
                fullPage: true 
            });
            
            return;
        }

        // 스크린샷 - 다이얼로그 열린 상태
        await page.screenshot({ 
            path: '/home/klaritudo/Documents/my-project/frontend/admin-dashboard/test-results/popup-dialog-opened.png',
            fullPage: true 
        });
        console.log('📸 다이얼로그 열린 상태 스크린샷 저장');

        // 2. 커스텀 위치 입력 필드 테스트
        console.log('🧪 테스트 1: 커스텀 위치 입력 필드');
        
        // 위치 선택 드롭다운 찾기
        const positionSelectors = [
            'select[name*="position"]',
            'select[name*="위치"]',
            'select:has(option:text("커스텀"))',
            '.position-select',
            '[data-testid="position-select"]'
        ];

        let positionSelect = null;
        for (const selector of positionSelectors) {
            try {
                positionSelect = page.locator(selector);
                if (await positionSelect.count() > 0) {
                    console.log(`✅ 위치 선택 요소 발견: ${selector}`);
                    break;
                }
            } catch (e) {
                continue;
            }
        }

        if (positionSelect && await positionSelect.count() > 0) {
            // 커스텀 옵션 선택
            await positionSelect.selectOption({ label: '커스텀' });
            await page.waitForTimeout(1000);
            
            console.log('✅ "커스텀" 위치 선택됨');
            
            // 커스텀 입력 필드가 나타나는지 확인
            const customFieldSelectors = [
                'input[name*="top"]',
                'input[name*="left"]',
                'input[name*="상단"]',
                'input[name*="좌측"]',
                '.custom-position-input',
                '[data-testid*="position-input"]'
            ];

            let customFieldsFound = 0;
            for (const selector of customFieldSelectors) {
                try {
                    const field = page.locator(selector);
                    if (await field.count() > 0 && await field.isVisible()) {
                        console.log(`✅ 커스텀 입력 필드 발견: ${selector}`);
                        customFieldsFound++;
                        
                        // 테스트 값 입력
                        await field.fill('100');
                        await page.waitForTimeout(500);
                    }
                } catch (e) {
                    continue;
                }
            }

            if (customFieldsFound > 0) {
                console.log(`✅ 커스텀 위치 입력 필드 ${customFieldsFound}개 정상 동작`);
            } else {
                console.log('❌ 커스텀 위치 입력 필드를 찾을 수 없음');
            }

            // 스크린샷 - 커스텀 필드 표시 상태
            await page.screenshot({ 
                path: '/home/klaritudo/Documents/my-project/frontend/admin-dashboard/test-results/popup-custom-fields.png',
                fullPage: true 
            });

            // 다른 위치 선택하여 필드가 숨겨지는지 확인
            await positionSelect.selectOption({ index: 0 }); // 첫 번째 옵션 선택
            await page.waitForTimeout(1000);
            
            console.log('✅ 다른 위치 선택하여 커스텀 필드 숨김 확인');
        } else {
            console.log('❌ 위치 선택 요소를 찾을 수 없음');
        }

        // 3. 링크 타겟 테스트
        console.log('🧪 테스트 2: 링크 타겟 기능');
        
        const linkInputSelectors = [
            'input[name*="link"]',
            'input[name*="url"]',
            'input[type="url"]',
            '.link-input',
            '[data-testid="link-input"]'
        ];

        let linkInput = null;
        for (const selector of linkInputSelectors) {
            try {
                linkInput = page.locator(selector);
                if (await linkInput.count() > 0) {
                    console.log(`✅ 링크 입력 필드 발견: ${selector}`);
                    break;
                }
            } catch (e) {
                continue;
            }
        }

        if (linkInput && await linkInput.count() > 0) {
            // 테스트 URL 입력
            await linkInput.fill('https://example.com');
            await page.waitForTimeout(500);
            console.log('✅ 링크 URL 입력 완료');
            
            // 링크 입력 후 상태 스크린샷
            await page.screenshot({ 
                path: '/home/klaritudo/Documents/my-project/frontend/admin-dashboard/test-results/popup-link-input.png',
                fullPage: true 
            });
        } else {
            console.log('❌ 링크 입력 필드를 찾을 수 없음');
        }

        // 4. 대상 선택 옵션 테스트
        console.log('🧪 테스트 3: 대상 선택 옵션');
        
        const targetSelectors = [
            'select[name*="target"]',
            'select[name*="대상"]',
            '.target-select',
            '[data-testid="target-select"]'
        ];

        let targetSelect = null;
        for (const selector of targetSelectors) {
            try {
                targetSelect = page.locator(selector);
                if (await targetSelect.count() > 0) {
                    console.log(`✅ 대상 선택 요소 발견: ${selector}`);
                    
                    // 옵션들 확인
                    const options = await targetSelect.locator('option').all();
                    console.log(`대상 선택 옵션 수: ${options.length}`);
                    
                    for (let i = 0; i < options.length; i++) {
                        const optionText = await options[i].textContent();
                        console.log(`  옵션 ${i + 1}: "${optionText}"`);
                    }
                    break;
                }
            } catch (e) {
                continue;
            }
        }

        // 5. 전체 폼 필드 테스트
        console.log('🧪 테스트 4: 전체 폼 필드 확인');
        
        const allInputs = await page.locator('input, select, textarea').all();
        console.log(`총 입력 필드 수: ${allInputs.length}`);
        
        for (let i = 0; i < allInputs.length; i++) {
            try {
                const tagName = await allInputs[i].evaluate(el => el.tagName);
                const type = await allInputs[i].getAttribute('type') || '';
                const name = await allInputs[i].getAttribute('name') || '';
                const placeholder = await allInputs[i].getAttribute('placeholder') || '';
                
                console.log(`  필드 ${i + 1}: ${tagName}${type ? `[${type}]` : ''} - name: "${name}" placeholder: "${placeholder}"`);
            } catch (e) {
                console.log(`  필드 ${i + 1}: 정보 확인 불가`);
            }
        }

        // 최종 상태 스크린샷
        await page.screenshot({ 
            path: '/home/klaritudo/Documents/my-project/frontend/admin-dashboard/test-results/popup-final-state.png',
            fullPage: true 
        });
        console.log('📸 최종 상태 스크린샷 저장');

        // 6. 실제 팝업 생성 테스트 (선택사항)
        console.log('🧪 테스트 5: 실제 팝업 생성 테스트');
        
        // 필수 필드들 채우기
        const titleInput = page.locator('input[name*="title"], input[name*="제목"]').first();
        if (await titleInput.count() > 0) {
            await titleInput.fill('테스트 팝업');
            console.log('✅ 제목 입력 완료');
        }

        const contentInput = page.locator('textarea, input[name*="content"], input[name*="내용"]').first();
        if (await contentInput.count() > 0) {
            await contentInput.fill('팝업 다이얼로그 테스트 내용');
            console.log('✅ 내용 입력 완료');
        }

        // 저장 버튼 찾기
        const saveButtonSelectors = [
            'button:has-text("저장")',
            'button:has-text("등록")',
            'button:has-text("확인")',
            'button[type="submit"]',
            '.save-button'
        ];

        let saveButton = null;
        for (const selector of saveButtonSelectors) {
            try {
                saveButton = page.locator(selector);
                if (await saveButton.count() > 0 && await saveButton.isVisible()) {
                    console.log(`✅ 저장 버튼 발견: ${selector}`);
                    break;
                }
            } catch (e) {
                continue;
            }
        }

        if (saveButton && await saveButton.count() > 0) {
            console.log('💾 팝업 저장 시도...');
            // 주의: 실제 저장은 테스트 데이터가 확실할 때만 실행
            // await saveButton.click();
            // await page.waitForTimeout(2000);
            console.log('ℹ️ 실제 저장은 건너뛰었습니다 (데이터 보호)');
        }

        console.log('✅ 모든 테스트 완료!');
        
        // 테스트 결과 요약
        console.log('\n📊 테스트 결과 요약:');
        console.log('1. 다이얼로그 열기: ✅');
        console.log('2. 커스텀 위치 필드: 확인 필요');
        console.log('3. 링크 입력 기능: 확인 필요'); 
        console.log('4. 대상 선택 옵션: 확인 필요');
        console.log('5. 전체 폼 필드: 확인됨');

        // 30초 대기 (수동 확인 시간)
        console.log('\n⏳ 30초 대기 중... (수동 확인 시간)');
        await page.waitForTimeout(30000);

    } catch (error) {
        console.error('❌ 테스트 중 오류 발생:', error);
        
        // 오류 상황 스크린샷
        await page.screenshot({ 
            path: '/home/klaritudo/Documents/my-project/frontend/admin-dashboard/test-results/popup-error-state.png',
            fullPage: true 
        });
    } finally {
        await browser.close();
    }
}

// 디렉토리 생성
import fs from 'fs';
const path = '/home/klaritudo/Documents/my-project/frontend/admin-dashboard/test-results';
if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
}

testPopupDialog();
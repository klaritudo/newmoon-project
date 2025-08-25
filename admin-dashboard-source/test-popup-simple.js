import { chromium } from 'playwright';

async function testPopupSimple() {
    const browser = await chromium.launch({ 
        headless: true
    });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();

    try {
        console.log('🚀 팝업 페이지 구조 분석 테스트 시작...');
        
        // 1. 먼저 로그인 페이지 접속
        await page.goto('http://125.187.89.85:5173/login');
        await page.waitForTimeout(3000);
        
        console.log('📊 로그인 페이지 분석...');
        await page.screenshot({ 
            path: './test-results/login-page.png',
            fullPage: true 
        });
        
        // 로그인 폼 요소 찾기
        const loginFormElements = await page.locator('input, button').all();
        console.log(`로그인 폼 요소 수: ${loginFormElements.length}`);
        
        for (let i = 0; i < loginFormElements.length; i++) {
            try {
                const tagName = await loginFormElements[i].evaluate(el => el.tagName);
                const type = await loginFormElements[i].getAttribute('type') || '';
                const name = await loginFormElements[i].getAttribute('name') || '';
                const placeholder = await loginFormElements[i].getAttribute('placeholder') || '';
                const text = await loginFormElements[i].textContent() || '';
                
                console.log(`  요소 ${i + 1}: ${tagName}${type ? `[${type}]` : ''} - name: "${name}" placeholder: "${placeholder}" text: "${text}"`);
            } catch (e) {
                console.log(`  요소 ${i + 1}: 정보 확인 불가`);
            }
        }

        // 2. 일반적인 관리자 로그인 시도 (admin/admin 또는 test/test)
        const usernameSelectors = [
            'input[type="text"]',
            'input[name="username"]',
            'input[name="email"]',
            'input[name="id"]'
        ];
        
        const passwordSelectors = [
            'input[type="password"]',
            'input[name="password"]'
        ];

        let loginSuccess = false;
        const commonCredentials = [
            { username: 'admin', password: 'admin' },
            { username: 'admin', password: 'admin123' },
            { username: 'test', password: 'test' },
            { username: 'admin', password: 'password' }
        ];

        for (const cred of commonCredentials) {
            try {
                console.log(`🔐 로그인 시도: ${cred.username}/${cred.password}`);
                
                // 사용자명 입력
                for (const selector of usernameSelectors) {
                    const usernameField = page.locator(selector).first();
                    if (await usernameField.count() > 0) {
                        await usernameField.clear();
                        await usernameField.fill(cred.username);
                        break;
                    }
                }
                
                // 비밀번호 입력
                for (const selector of passwordSelectors) {
                    const passwordField = page.locator(selector).first();
                    if (await passwordField.count() > 0) {
                        await passwordField.clear();
                        await passwordField.fill(cred.password);
                        break;
                    }
                }
                
                // 로그인 버튼 클릭
                const loginButton = page.locator('button:has-text("로그인"), button[type="submit"]').first();
                if (await loginButton.count() > 0) {
                    await loginButton.click();
                    await page.waitForTimeout(3000);
                    
                    // 로그인 성공 확인 (URL 변경 또는 에러 메시지 없음)
                    const currentUrl = page.url();
                    if (!currentUrl.includes('/login')) {
                        console.log('✅ 로그인 성공!');
                        loginSuccess = true;
                        break;
                    }
                }
            } catch (e) {
                console.log(`❌ 로그인 실패: ${e.message}`);
                continue;
            }
        }

        if (!loginSuccess) {
            console.log('❌ 자동 로그인 실패. 수동 로그인이 필요합니다.');
            console.log('📝 페이지 소스 분석을 위해 스크린샷을 확인하세요.');
            return;
        }

        // 3. 팝업 페이지로 이동
        console.log('📍 팝업 페이지로 이동...');
        await page.goto('http://125.187.89.85:5173/board/popup');
        await page.waitForTimeout(3000);
        
        const popupPageUrl = page.url();
        console.log('현재 URL:', popupPageUrl);
        
        // 팝업 페이지 스크린샷
        await page.screenshot({ 
            path: './test-results/popup-page.png',
            fullPage: true 
        });
        
        // 4. 페이지 구조 분석
        console.log('🔍 팝업 페이지 구조 분석...');
        
        // 모든 버튼 요소 찾기
        const allButtons = await page.locator('button').all();
        console.log(`팝업 페이지 버튼 수: ${allButtons.length}`);
        
        for (let i = 0; i < allButtons.length; i++) {
            try {
                const buttonText = await allButtons[i].textContent();
                const className = await allButtons[i].getAttribute('class') || '';
                const isVisible = await allButtons[i].isVisible();
                console.log(`  버튼 ${i + 1}: "${buttonText}" (visible: ${isVisible}) class: "${className}"`);
            } catch (e) {
                console.log(`  버튼 ${i + 1}: 정보 확인 불가`);
            }
        }

        // 테이블 또는 리스트 구조 찾기
        const tables = await page.locator('table, .table, [role="table"]').all();
        console.log(`테이블 수: ${tables.length}`);
        
        const lists = await page.locator('ul, ol, .list').all();
        console.log(`리스트 수: ${lists.length}`);

        // 5. 팝업 추가 버튼 찾기 및 클릭 시도
        const addButtonSelectors = [
            'button:has-text("추가")',
            'button:has-text("등록")',
            'button:has-text("새로")',
            'button:has-text("생성")',
            'button[aria-label*="추가"]',
            'button[title*="추가"]',
            '.add-button',
            '.create-button',
            '[data-testid*="add"]'
        ];

        let addButtonClicked = false;
        for (const selector of addButtonSelectors) {
            try {
                const addButton = page.locator(selector).first();
                if (await addButton.count() > 0 && await addButton.isVisible()) {
                    console.log(`✅ 추가 버튼 발견: ${selector}`);
                    await addButton.click();
                    await page.waitForTimeout(2000);
                    addButtonClicked = true;
                    break;
                }
            } catch (e) {
                continue;
            }
        }

        if (!addButtonClicked) {
            // 첫 번째 버튼 시도
            if (allButtons.length > 0) {
                console.log('🎯 첫 번째 버튼 클릭 시도...');
                try {
                    await allButtons[0].click();
                    await page.waitForTimeout(2000);
                    addButtonClicked = true;
                } catch (e) {
                    console.log('❌ 첫 번째 버튼 클릭 실패');
                }
            }
        }

        // 6. 다이얼로그 확인
        if (addButtonClicked) {
            console.log('🔍 다이얼로그 확인 중...');
            
            const dialogSelectors = [
                '[role="dialog"]',
                '.modal',
                '.dialog',
                '.popup-dialog',
                '.MuiDialog-root',
                '.MuiModal-root'
            ];

            let dialogFound = false;
            for (const selector of dialogSelectors) {
                try {
                    const dialog = page.locator(selector);
                    if (await dialog.count() > 0 && await dialog.isVisible()) {
                        console.log(`✅ 다이얼로그 발견: ${selector}`);
                        dialogFound = true;
                        
                        // 다이얼로그 스크린샷
                        await page.screenshot({ 
                            path: './test-results/popup-dialog.png',
                            fullPage: true 
                        });
                        
                        // 다이얼로그 내부 구조 분석
                        const dialogInputs = await dialog.locator('input, select, textarea').all();
                        console.log(`다이얼로그 내 입력 필드 수: ${dialogInputs.length}`);
                        
                        for (let i = 0; i < dialogInputs.length; i++) {
                            try {
                                const tagName = await dialogInputs[i].evaluate(el => el.tagName);
                                const type = await dialogInputs[i].getAttribute('type') || '';
                                const name = await dialogInputs[i].getAttribute('name') || '';
                                const placeholder = await dialogInputs[i].getAttribute('placeholder') || '';
                                const label = await dialogInputs[i].getAttribute('aria-label') || '';
                                
                                console.log(`  입력필드 ${i + 1}: ${tagName}${type ? `[${type}]` : ''} - name: "${name}" placeholder: "${placeholder}" label: "${label}"`);
                            } catch (e) {
                                console.log(`  입력필드 ${i + 1}: 정보 확인 불가`);
                            }
                        }
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }

            if (!dialogFound) {
                console.log('❌ 다이얼로그를 찾을 수 없습니다.');
                // 전체 페이지 다시 스크린샷
                await page.screenshot({ 
                    path: './test-results/popup-no-dialog.png',
                    fullPage: true 
                });
            }
        }

        console.log('✅ 팝업 페이지 분석 완료!');

    } catch (error) {
        console.error('❌ 테스트 중 오류 발생:', error);
        
        await page.screenshot({ 
            path: './test-results/error-state.png',
            fullPage: true 
        });
    } finally {
        await browser.close();
    }
}

testPopupSimple();
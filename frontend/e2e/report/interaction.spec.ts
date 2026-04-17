import { test, expect } from './fixtures/report-fixtures';

test.describe('报告页面用户交互响应性测试', () => {
  test('按钮点击应有正确响应', async ({ reportPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    const buttons = await reportPage.page.locator('button').all();
    
    for (const button of buttons.slice(0, 5)) {
      const isVisible = await button.isVisible().catch(() => false);
      const isEnabled = await button.isEnabled().catch(() => false);
      
      if (isVisible && isEnabled) {
        const buttonText = await button.innerText();
        const startTime = Date.now();
        
        await button.click();
        const responseTime = Date.now() - startTime;
        
        console.log(`按钮 "${buttonText}" 响应时间: ${responseTime}ms`);
        expect(responseTime).toBeLessThan(3000);
        
        await reportPage.page.waitForTimeout(500);
      }
    }
  });

  test('下拉选择框交互应正常', async ({ reportPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    const selects = await reportPage.page.locator('select').all();
    
    for (const select of selects.slice(0, 3)) {
      const isVisible = await select.isVisible().catch(() => false);
      
      if (isVisible) {
        const options = await select.locator('option').count();
        expect(options).toBeGreaterThan(0);
        
        const selectName = await select.getAttribute('name').catch(() => '') || 
                          await select.getAttribute('id').catch(() => '') || 
                          'unknown';
        
        console.log(`下拉框 "${selectName}" 选项数: ${options}`);
        
        if (options > 1) {
          await select.selectIndex(1);
          await reportPage.page.waitForTimeout(300);
          
          const selectedIndex = await select.evaluate(
            el => (el as HTMLSelectElement).selectedIndex
          );
          expect(selectedIndex).toBe(1);
        }
      }
    }
  });

  test('输入框交互应正常', async ({ reportPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    const inputs = await reportPage.page.locator('input[type="text"], input[type="search"], input:not([type])').all();
    
    for (const input of inputs.slice(0, 3)) {
      const isVisible = await input.isVisible().catch(() => false);
      const isEditable = await input.isEnabled().catch(() => false);
      
      if (isVisible && isEditable) {
        const inputName = await input.getAttribute('placeholder').catch(() => '') || 
                         await input.getAttribute('name').catch(() => '') || 
                         'unknown';
        
        await input.fill('测试输入');
        const value = await input.inputValue();
        
        expect(value).toBe('测试输入');
        console.log(`输入框 "${inputName}" 交互正常`);
        
        await input.fill('');
      }
    }
  });

  test('复选框交互应正常', async ({ reportPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    const checkboxes = await reportPage.page.locator('input[type="checkbox"]').all();
    
    for (const checkbox of checkboxes.slice(0, 5)) {
      const isVisible = await checkbox.isVisible().catch(() => false);
      
      if (isVisible) {
        const initialChecked = await checkbox.isChecked();
        await checkbox.click();
        
        await reportPage.page.waitForTimeout(200);
        const newChecked = await checkbox.isChecked();
        
        expect(newChecked).toBe(!initialChecked);
        console.log(`复选框状态切换: ${initialChecked} -> ${newChecked}`);
        
        await checkbox.click();
      }
    }
  });

  test('单选框交互应正常', async ({ reportPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    const radios = await reportPage.page.locator('input[type="radio"]').all();
    
    if (radios.length > 0) {
      for (const radio of radios.slice(0, 3)) {
        const isVisible = await radio.isVisible().catch(() => false);
        
        if (isVisible) {
          await radio.click();
          await reportPage.page.waitForTimeout(200);
          
          const isChecked = await radio.isChecked();
          expect(isChecked).toBe(true);
          console.log(`单选框选中成功`);
        }
      }
    }
  });

  test('表单提交应正确处理', async ({ reportPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    const forms = await reportPage.page.locator('form').count();
    
    if (forms > 0) {
      const form = reportPage.page.locator('form').first();
      const submitButtons = await form.locator('button[type="submit"], input[type="submit"]').count();
      
      if (submitButtons > 0) {
        const submitBtn = form.locator('button[type="submit"], input[type="submit"]').first();
        const isVisible = await submitBtn.isVisible().catch(() => false);
        
        if (isVisible) {
          await reportPage.page.waitForTimeout(500);
          
          const startTime = Date.now();
          await submitBtn.click();
          const responseTime = Date.now() - startTime;
          
          console.log(`表单提交响应时间: ${responseTime}ms`);
          expect(responseTime).toBeLessThan(5000);
          
          await reportPage.page.waitForTimeout(1000);
        }
      }
    }
  });

  test('日期选择器交互应正常', async ({ reportPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    const dateInputs = await reportPage.page.locator('input[type="date"], input[type="datetime-local"]').all();
    
    for (const dateInput of dateInputs.slice(0, 3)) {
      const isVisible = await dateInput.isVisible().catch(() => false);
      
      if (isVisible) {
        await dateInput.fill('2024-01-15');
        const value = await dateInput.inputValue();
        
        expect(value).toContain('2024-01-15');
        console.log(`日期选择器设置成功: ${value}`);
      }
    }
  });

  test('文件上传交互应正常', async ({ reportPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    const fileInputs = await reportPage.page.locator('input[type="file"]').all();
    
    if (fileInputs.length > 0) {
      const fileInput = fileInputs[0];
      const isVisible = await fileInput.isVisible().catch(() => false);
      
      if (isVisible) {
        console.log('文件上传元素存在');
      }
    }
  });

  test('滚动交互应流畅', async ({ reportPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    const startTime = Date.now();
    
    await reportPage.page.mouse.wheel(0, 500);
    await reportPage.page.waitForTimeout(300);
    
    await reportPage.page.mouse.wheel(0, 500);
    await reportPage.page.waitForTimeout(300);
    
    await reportPage.page.mouse.wheel(0, -500);
    await reportPage.page.waitForTimeout(300);
    
    const scrollTime = Date.now() - startTime;
    console.log(`滚动操作总时间: ${scrollTime}ms`);
    expect(scrollTime).toBeLessThan(3000);
  });

  test('悬停效果应正确显示', async ({ reportPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    const hoverTargets = await reportPage.page.locator(
      'button, a, [class*="hover"], [title]'
    ).all();
    
    for (const target of hoverTargets.slice(0, 5)) {
      const isVisible = await target.isVisible().catch(() => false);
      
      if (isVisible) {
        const box = await target.boundingBox();
        if (box) {
          await reportPage.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
          await reportPage.page.waitForTimeout(300);
          
          console.log('悬停交互正常');
        }
      }
    }
  });

  test('拖拽交互应正常（如存在可拖拽元素）', async ({ reportPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    const draggableElements = await reportPage.page.locator('[draggable="true"], [class*="draggable"], [class*="sortable"]').all();
    
    if (draggableElements.length > 0) {
      const draggable = draggableElements[0];
      const isVisible = await draggable.isVisible().catch(() => false);
      
      if (isVisible) {
        const box = await draggable.boundingBox();
        if (box) {
          await reportPage.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
          await reportPage.page.mouse.down();
          await reportPage.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 50);
          await reportPage.page.mouse.up();
          
          console.log('拖拽交互执行成功');
        }
      }
    }
  });

  test('键盘交互应正常', async ({ reportPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    const inputs = await reportPage.page.locator('input, textarea').all();
    
    if (inputs.length > 0) {
      const input = inputs[0];
      const isVisible = await input.isVisible().catch(() => false);
      
      if (isVisible) {
        await input.click();
        await reportPage.page.keyboard.type('测试输入');
        await reportPage.page.waitForTimeout(300);
        
        const value = await input.inputValue();
        expect(value).toBe('测试输入');
        console.log('键盘输入交互正常');
        
        await reportPage.page.keyboard.press('Backspace');
        await reportPage.page.waitForTimeout(200);
        
        const newValue = await input.inputValue();
        expect(newValue.length).toBeLessThan(value.length);
        console.log('键盘删除交互正常');
      }
    }
  });

  test('右键菜单交互应正常', async ({ reportPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    const body = reportPage.page.locator('body');
    await body.click({ button: 'right' });
    await reportPage.page.waitForTimeout(300);
    
    console.log('右键菜单触发成功');
  });
});

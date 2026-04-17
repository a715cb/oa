import { test, expect } from '@playwright/test';

test.describe('安全修复验证测试', () => {
  test.describe('TC-01: 前端错误信息脱敏测试', () => {
    test('403 错误不应暴露 URL 路径', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[placeholder*="用户名"]', 'admin');
      await page.fill('input[placeholder*="密码"]', '123456');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/*', { timeout: 10000 });

      // 监听页面通知
      const notifications = [];
      page.on('console', msg => {
        if (msg.type() === 'log') {
          notifications.push(msg.text());
        }
      });

      // 尝试访问一个不存在的 API 路径触发错误
      await page.evaluate(async () => {
        try {
          await fetch('/api/nonexistent/path', {
            headers: { 'Authorization': 'Bearer test-token' }
          });
        } catch (e) {
          // ignore
        }
      });

      await page.waitForTimeout(2000);

      // 检查页面内容不应包含 URL 路径信息
      const pageContent = await page.content();
      expect(pageContent).not.toMatch(/\/api\//);
      expect(pageContent).not.toMatch(/status.*:.*url/i);
    });

    test('网络错误应显示通用提示', async ({ page }) => {
      // 阻断所有请求模拟网络错误
      await page.route('**/adminapi/**', route => route.abort('failed'));

      await page.goto('/login');
      
      await page.fill('input[placeholder*="用户名"]', 'admin');
      await page.fill('input[placeholder*="密码"]', '123456');
      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(3000);

      // 检查页面是否显示了友好的错误提示而不是技术细节
      const pageContent = await page.content();
      expect(pageContent).not.toMatch(/ERR_NETWORK|ECONNABORTED/);
    });
  });

  test.describe('TC-02: 登录接口输入验证测试', () => {
    test('用户名包含特殊字符应被拒绝', async ({ request }) => {
      const response = await request.post('http://localhost:8000/adminapi/login', {
        data: {
          username: "admin' OR '1'='1",
          password: '123456'
        }
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.code).not.toBe(0);
      expect(body.msg).toContain('用户名格式不正确');
    });

    test('用户名超长应被拒绝', async ({ request }) => {
      const response = await request.post('http://localhost:8000/adminapi/login', {
        data: {
          username: 'a'.repeat(51),
          password: '123456'
        }
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.code).not.toBe(0);
      expect(body.msg).toContain('长度超出限制');
    });

    test('密码超长应被拒绝', async ({ request }) => {
      const response = await request.post('http://localhost:8000/adminapi/login', {
        data: {
          username: 'admin',
          password: 'p'.repeat(101)
        }
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.code).not.toBe(0);
      expect(body.msg).toContain('长度超出限制');
    });

    test('用户名和密码为空应被拒绝', async ({ request }) => {
      const response = await request.post('http://localhost:8000/adminapi/login', {
        data: {
          username: '',
          password: ''
        }
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.code).not.toBe(0);
    });

    test('正常登录应成功', async ({ request }) => {
      const response = await request.post('http://localhost:8000/adminapi/login', {
        data: {
          username: 'admin',
          password: '123456'
        }
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.code).toBe(0);
    });

    test('XSS 载荷在用户名中应被拒绝', async ({ request }) => {
      const response = await request.post('http://localhost:8000/adminapi/login', {
        data: {
          username: '<script>alert("xss")</script>',
          password: '123456'
        }
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.code).not.toBe(0);
      expect(body.msg).toContain('用户名格式不正确');
    });
  });

  test.describe('TC-03: 菜单控制器输入验证测试', () => {
    let token: string;

    test.beforeAll(async ({ request }) => {
      const loginResponse = await request.post('http://localhost:8000/adminapi/login', {
        data: {
          username: 'admin',
          password: '123456'
        }
      });
      const loginBody = await loginResponse.json();
      token = loginBody.data.access_token;
    });

    test('菜单名称包含 XSS 应被拒绝', async ({ request }) => {
      const response = await request.post('http://localhost:8000/adminapi/menu', {
        headers: { 'Authorization': token },
        data: {
          name: '<script>alert("xss")</script>',
          type: 1
        }
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.code).not.toBe(0);
      expect(body.msg).toContain('非法字符');
    });

    test('菜单路径包含非法字符应被拒绝', async ({ request }) => {
      const response = await request.post('http://localhost:8000/adminapi/menu', {
        headers: { 'Authorization': token },
        data: {
          name: 'Test Menu',
          path: '../../etc/passwd',
          type: 1
        }
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.code).not.toBe(0);
    });

    test('排序值超出范围应被拒绝', async ({ request }) => {
      const response = await request.post('http://localhost:8000/adminapi/menu', {
        headers: { 'Authorization': token },
        data: {
          name: 'Test Menu',
          sort: 99999,
          type: 1
        }
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.code).not.toBe(0);
      expect(body.msg).toContain('超出范围');
    });

    test('删除菜单无效 ID 应被拒绝', async ({ request }) => {
      // 测试负数 ID
      const response1 = await request.delete('http://localhost:8000/adminapi/menu/-1', {
        headers: { 'Authorization': token }
      });
      expect(response1.status()).toBe(200);
      const body1 = await response1.json();
      expect(body1.code).not.toBe(0);

      // 测试非数字 ID - 由于路由限制，可能返回 404
      const response2 = await request.delete('http://localhost:8000/adminapi/menu/abc', {
        headers: { 'Authorization': token }
      });
      // 404 或错误都是可接受的
      expect([200, 404]).toContain(response2.status());
    });
  });

  test.describe('TC-04: 部门控制器输入验证测试', () => {
    let token: string;

    test.beforeAll(async ({ request }) => {
      const loginResponse = await request.post('http://localhost:8000/adminapi/login', {
        data: {
          username: 'admin',
          password: '123456'
        }
      });
      const loginBody = await loginResponse.json();
      token = loginBody.data.access_token;
    });

    test('部门名称包含特殊字符应被拒绝', async ({ request }) => {
      const response = await request.post('http://localhost:8000/adminapi/department', {
        headers: { 'Authorization': token },
        data: {
          name: '<script>alert("hack")</script>',
          parent_id: 0
        }
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.code).not.toBe(0);
      expect(body.msg).toContain('非法字符');
    });

    test('部门名称超长应被拒绝', async ({ request }) => {
      const response = await request.post('http://localhost:8000/adminapi/department', {
        headers: { 'Authorization': token },
        data: {
          name: 'A'.repeat(101),
          parent_id: 0
        }
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.code).not.toBe(0);
      expect(body.msg).toContain('长度超出限制');
    });

    test('负数父级 ID 应被拒绝', async ({ request }) => {
      const response = await request.post('http://localhost:8000/adminapi/department', {
        headers: { 'Authorization': token },
        data: {
          name: '测试部门',
          parent_id: -1
        }
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.code).not.toBe(0);
    });

    test('删除部门无效 ID 应被拒绝', async ({ request }) => {
      const response = await request.delete('http://localhost:8000/adminapi/department/0', {
        headers: { 'Authorization': token }
      });
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.code).not.toBe(0);
    });

    test('正常部门创建应成功', async ({ request }) => {
      const response = await request.post('http://localhost:8000/adminapi/department', {
        headers: { 'Authorization': token },
        data: {
          name: '安全测试部门',
          parent_id: 0,
          sort: 100
        }
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.code).toBe(0);
    });
  });

  test.describe('TC-05: 回归测试 - 正常功能不受影响', () => {
    let token: string;

    test.beforeAll(async ({ request }) => {
      const loginResponse = await request.post('http://localhost:8000/adminapi/login', {
        data: {
          username: 'admin',
          password: '123456'
        }
      });
      const loginBody = await loginResponse.json();
      token = loginBody.data.access_token;
    });

    test('获取用户信息应正常', async ({ request }) => {
      const response = await request.get('http://localhost:8000/adminapi/getUserInfo', {
        headers: { 'Authorization': token }
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.code).toBe(0);
    });

    test('获取菜单列表应正常', async ({ request }) => {
      const response = await request.get('http://localhost:8000/adminapi/menu', {
        headers: { 'Authorization': token }
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.code).toBe(0);
    });

    test('获取部门列表应正常', async ({ request }) => {
      const response = await request.get('http://localhost:8000/adminapi/department', {
        headers: { 'Authorization': token }
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.code).toBe(0);
    });

    test('获取字典列表应正常', async ({ request }) => {
      const response = await request.get('http://localhost:8000/adminapi/dict', {
        headers: { 'Authorization': token }
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.code).toBe(0);
    });
  });

  test.describe('TC-06: 刷新令牌异常处理测试', () => {
    test('无效刷新令牌应返回通用错误', async ({ request }) => {
      const response = await request.get('http://localhost:8000/adminapi/refreshToken', {
        headers: { 'Authorization': 'Bearer invalid-refresh-token' }
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      // 不应返回成功，且不应暴露具体异常信息
      expect(body.code).not.toBe(0);
      expect(body.msg).not.toContain('Exception');
      expect(body.msg).not.toContain('Error in');
      expect(body.msg).toContain('令牌刷新失败');
    });
  });
});
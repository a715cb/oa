import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

export const options = {
  stages: [
    { duration: '5s', target: 10 },
    { duration: '10s', target: 10 },
    { duration: '5s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.05'],
  },
};

const BASE_URL = 'http://127.0.0.1:8000/adminapi';
let token = '';

export function setup() {
  // 登录获取 token
  const loginRes = http.post(`${BASE_URL}/login`, JSON.stringify({
    username: 'admin',
    password: 'admin123'
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(loginRes, {
    'login status is 200': (r) => r.status === 200,
    'login successful': (r) => JSON.parse(r.body).code === 1,
  });

  const loginBody = JSON.parse(loginRes.body);
  return { token: loginBody.data.token };
}

export default function (data) {
  const headers = {
    'Authorization': data.token,
    'Content-Type': 'application/json',
  };

  group('用户管理 - 获取用户列表', () => {
    const res = http.get(`${BASE_URL}/user`, { headers });
    
    check(res, {
      '获取用户列表 status 200': (r) => r.status === 200,
      '返回成功 code': (r) => JSON.parse(r.body).code === 1,
      '返回 data 字段': (r) => JSON.parse(r.body).data !== undefined,
      '返回 total 字段': (r) => JSON.parse(r.body).data.total !== undefined,
      '返回 data.data 数组': (r) => Array.isArray(JSON.parse(r.body).data.data),
    });

    const body = JSON.parse(res.body);
    if (body.data && body.data.data) {
      console.log(`用户总数: ${body.data.total}, 当前页数据: ${body.data.data.length}`);
    }
  });

  group('用户管理 - 带参数搜索', () => {
    const res = http.get(`${BASE_URL}/user?page=1&pageSize=15&key=admin`, { headers });
    
    check(res, {
      '关键词搜索 status 200': (r) => r.status === 200,
      '搜索结果返回': (r) => JSON.parse(r.body).code === 1,
    });
  });

  group('用户管理 - 回收站视图', () => {
    const res = http.get(`${BASE_URL}/user?page=1&pageSize=15&is_deleted=1`, { headers });
    
    check(res, {
      '回收站视图 status 200': (r) => r.status === 200,
      '回收站数据返回': (r) => JSON.parse(r.body).code === 1,
    });
  });

  sleep(1);
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: '  ', enableColors: true }),
  };
}

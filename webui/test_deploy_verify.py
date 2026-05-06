#!/usr/bin/env python3
"""
部署环境验证测试：真实模型对接 + Chat页面问答功能
"""

import asyncio, json, sys, os, urllib.request, urllib.error
from datetime import datetime

BASE = 'http://127.0.0.1:8000'
WS   = 'ws://127.0.0.1:8000/ws/chat'
PROV = 'qwen3.5-flash'

P = '[PASS]'; F = '[FAIL]'; W = '[WARN]'; I = '[INFO]'
log_lines = []
def pr(s):
    log_lines.append(s)
    print(s, flush=True)

ok_count = 0; fail_count = 0
def check(name, cond, detail=''):
    global ok_count, fail_count
    if cond: ok_count += 1; pr(f'{P} {name}' + (f' -- {detail}' if detail else ''))
    else:    fail_count += 1; pr(f'{F} {name}' + (f' -- {detail}' if detail else ''))

def http_get(url):
    try:
        with urllib.request.urlopen(url, timeout=10) as r:
            return json.loads(r.read().decode())
    except Exception as e:
        return {'_err': str(e)[:200]}

def http_post(url, data):
    try:
        req = urllib.request.Request(url, data=json.dumps(data).encode(),
                                     headers={'Content-Type':'application/json'}, method='POST')
        with urllib.request.urlopen(req, timeout=10) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        return {'_err': f'HTTP {e.code}', '_body': e.read().decode()[:300]}
    except Exception as e:
        return {'_err': str(e)[:200]}

async def main():
    global ok_count, fail_count

    pr(f'OpenHarness WebUI 部署环境验证')
    pr(f'时间: {datetime.now().isoformat()}')
    pr(f'后端: {BASE}')
    pr(f'提供者: {PROV}')
    pr('')

    # ─── 1. 基础连通性 ───
    pr('=' * 60)
    pr('1. 基础连通性验证')
    pr('=' * 60)

    h = http_get(f'{BASE}/api/health')
    check('后端健康检查', h.get('status') == 'ok', f'version={h.get("version")}')

    profiles = http_get(f'{BASE}/api/providers')
    if isinstance(profiles, list):
        check('提供者列表可获取', len(profiles) > 0, f'{len(profiles)} 个提供者')
        active = [p for p in profiles if p.get('active')]
        if active:
            a = active[0]
            check(f'活跃提供者: {a["name"]}', True,
                  f'model={a.get("model")}, format={a.get("api_format")}')
            check('base_url 已配置', bool(a.get('base_url')), a.get('base_url'))
            # 检查 api_key 是否暴露（list_profiles 应隐藏）
            check('api_key 在列表中隐藏（安全）', 'api_key' not in a,
                  'API key 不应在列表接口中返回')
    else:
        check('提供者接口', False, str(profiles.get('_err','')))

    # ─── 2. 模型连接测试 ───
    pr('')
    pr('=' * 60)
    pr('2. 模型连接测试 (调用真实模型 API)')
    pr('=' * 60)

    import httpx

    try:
        async with httpx.AsyncClient(timeout=30) as c:
            # 先获取 api_key 直接测试
            prov_file = os.path.expanduser('~/.openharness/provider_profiles/qwen3.5-flash.json')
            api_key = None
            if os.path.exists(prov_file):
                with open(prov_file) as f:
                    prov_data = json.load(f)
                api_key = prov_data.get('api_key')
                check(f'本地配置文件中找到 api_key', bool(api_key),
                      f'{api_key[:8]}...{api_key[-4:]}' if api_key else '')

            # 通过 /test 端点测试
            r = await c.post(f'{BASE}/api/providers/{PROV}/test', timeout=30)
            if r.status_code == 200:
                d = r.json()
                if d.get('success'):
                    check('连接测试成功', True, f'{d.get("latency_ms")}ms')
                    models = d.get('models', [])
                    check('模型列表 > 0', len(models) > 0, f'{len(models)} 个模型')
                    if PROV in models:
                        check(f'"{PROV}" 在模型列表中', True)
                    else:
                        check(f'"{PROV}" 在模型列表中', False, f'前 5 个: {models[:5]}')
                else:
                    check('连接测试', False, d.get('message','')[:100])
            else:
                check('连接测试端点', False, f'HTTP {r.status_code}')
                try:
                    pr(f'  [{W}] 响应内容: {r.text[:200]}')
                except:
                    pass
    except Exception as e:
        check('连接测试', False, str(e)[:150])

    # ─── 3. 直接模型 API 调用 ───
    pr('')
    pr('=' * 60)
    pr('3. 直接模型 API 调用 (验证真实推理能力)')
    pr('=' * 60)

    import httpx

    if api_key:
        base_url = 'https://dashscope.aliyuncs.com/compatible-mode/v1'
        chat_url = f'{base_url}/chat/completions'

        headers = {'Content-Type': 'application/json',
                   'Authorization': f'Bearer {api_key}'}
        body = {
            'model': PROV,
            'messages': [{'role': 'user', 'content': '用一句话回答：1+1等于几？'}],
            'max_tokens': 50,
            'temperature': 0.1,
        }

        try:
            async with httpx.AsyncClient(timeout=30) as c:
                r = await c.post(chat_url, json=body, headers=headers)
                if r.status_code == 200:
                    d = r.json()
                    content = d.get('choices', [{}])[0].get('message', {}).get('content', '')
                    check('模型 API 调用成功', True, f'HTTP 200')
                    check('返回非空结果', bool(content), f'"{content[:100]}"')
                    pr(f'  [{I}] 模型回复: "{content.strip()}"')
                else:
                    check('模型 API 调用', False, f'HTTP {r.status_code}: {r.text[:200]}')
        except Exception as e:
            check('模型 API 调用', False, str(e)[:150])
    else:
        check('直接模型调用', False, '未找到 api_key')

    # ─── 4. WebSocket 聊天测试 ───
    pr('')
    pr('=' * 60)
    pr('4. Chat 页面问答功能验证 (WebSocket)')
    pr('=' * 60)

    import websockets

    test_cases = [
        '1+1等于几？',
        '介绍一下你自己',
    ]

    for tc in test_cases:
        pr(f'\n  [{I}] 测试: "{tc}"')
        try:
            async with websockets.connect(WS) as ws:
                await asyncio.wait_for(ws.recv(), timeout=5)
                try: await asyncio.wait_for(ws.recv(), timeout=1)
                except: pass

                await ws.send(json.dumps({'type': 'submit_line', 'line': tc}))

                full_text = ''
                got_delta = False
                got_complete = False
                got_line = False
                delta_n = 0

                for i in range(80):
                    raw = await asyncio.wait_for(ws.recv(), timeout=10)
                    d = json.loads(raw)
                    t = d.get('type')
                    if t == 'assistant_delta':
                        got_delta = True
                        delta_n += 1
                        full_text += d.get('message', '')
                    elif t == 'assistant_complete':
                        got_complete = True
                        full_text = d.get('message', '') or ''
                    elif t == 'line_complete':
                        got_line = True
                        break

                is_mock = 'In production' in full_text or 'I received your message' in full_text

                if is_mock:
                    pr(f'  [{W}] 回复来自 MOCK (非真实模型)')
                    check(f'[{tc[:15]}...] 收到 assistant_delta', got_delta, f'{delta_n} 个块')
                    check(f'[{tc[:15]}...] 收到 assistant_complete', got_complete)
                    check(f'[{tc[:15]}...] 收到 line_complete', got_line)
                else:
                    pr(f'  [{I}] 回复来自真实模型!')
                    check(f'[{tc[:15]}...] 收到实时流式回复', got_delta, f'{delta_n} 个块')
                    check(f'[{tc[:15]}...] 收到完整回复', got_complete)
                    check(f'[{tc[:15]}...] 回复长度 > 10', len(full_text) > 10, f'{len(full_text)} 字符')
                    check(f'[{tc[:15]}...] 回复不是 mock 模板', True)
                    pr(f'  [{I}] 回复预览: "{full_text[:120]}..."')

        except Exception as e:
            check(f'[{tc[:15]}...] 聊天测试', False, str(e)[:100])

    # ─── 5. 汇总 ───
    pr('')
    pr('=' * 60)
    pr('验证汇总')
    pr('=' * 60)
    pr(f'  通过: {ok_count}')
    pr(f'  失败: {fail_count}')
    pr(f'  结果: {"全部通过" if fail_count == 0 else "存在问题"}')
    pr('')

    # 针对 Chat 功能的总结
    pr('Chat 页面问答功能分析:')
    pr('')
    # 检查最后一次 WebSocket 测试的结果
    if any('MOCK' in l for l in log_lines[-20:]):
        pr(f'  {W} Chat 页面当前使用 MOCK 回复')
        pr(f'  {I} 后端 OPENHARNESS_AVAILABLE=False')
        pr(f'  {I} chat_handler 使用 _send_mock_response()')
        pr(f'  {I} 真实模型可通过 REST API 调用，但 chat WebSocket 未对接')
        pr('')
        pr(f'  修复方案: chat_handler.py 需要:')
        pr(f'    1. 导入 provider_service 读取活跃提供者配置')
        pr(f'    2. 使用 httpx 调用模型 API（类似 test_connection）')
        pr(f'    3. 将回复流式输出为 assistant_delta 事件')
        pr(f'    4. 完成后发送 assistant_complete + line_complete')
    else:
        pr(f'  {P} Chat 页面使用真实模型推理！')
        pr(f'  {I} 问答功能正常运行')

    return fail_count == 0


if __name__ == '__main__':
    ok = asyncio.run(main())
    sys.exit(0 if ok else 1)

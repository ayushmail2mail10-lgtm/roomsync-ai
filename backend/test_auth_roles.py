import urllib.request
import json

def test():
    # 1. Login as Admin
    payload = json.dumps({'email': 'admin@roomsync.ai', 'password': 'adminpassword123'}).encode()
    req = urllib.request.Request('http://127.0.0.1:8000/api/auth/login', data=payload, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as res:
        admin_data = json.loads(res.read())
        print('Admin login status:', res.status, 'role:', admin_data.get('role'))

    # 2. Get Admin Metrics
    req = urllib.request.Request('http://127.0.0.1:8000/api/admin/metrics', headers={'Authorization': f'Bearer {admin_data["access_token"]}'})
    with urllib.request.urlopen(req) as res:
        metrics = json.loads(res.read())
        print('Admin metrics:', metrics)

    # 3. Login as Arjun (flat_owner)
    payload = json.dumps({'email': 'arjun@roomsync.ai', 'password': 'password123'}).encode()
    req = urllib.request.Request('http://127.0.0.1:8000/api/auth/login', data=payload, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as res:
        arjun_data = json.loads(res.read())
        print('Arjun login status:', res.status, 'role:', arjun_data.get('role'))

    # 4. Attempt to access admin metrics with Arjun's token (should be 403 Forbidden)
    req = urllib.request.Request('http://127.0.0.1:8000/api/admin/metrics', headers={'Authorization': f'Bearer {arjun_data["access_token"]}'})
    try:
        urllib.request.urlopen(req)
        print('SECURITY FAILURE: Non-admin accessed admin endpoint!')
    except urllib.error.HTTPError as e:
        print(f'Security check passed: non-admin returned HTTP {e.code} ({e.reason})')

    # 5. Check user info for both
    req = urllib.request.Request('http://127.0.0.1:8000/api/auth/me', headers={'Authorization': f'Bearer {admin_data["access_token"]}'})
    with urllib.request.urlopen(req) as res:
        me_admin = json.loads(res.read())
        print('GET /me for admin:', me_admin.get('email'), 'role:', me_admin.get('role'))

    req = urllib.request.Request('http://127.0.0.1:8000/api/auth/me', headers={'Authorization': f'Bearer {arjun_data["access_token"]}'})
    with urllib.request.urlopen(req) as res:
        me_arjun = json.loads(res.read())
        print('GET /me for arjun:', me_arjun.get('email'), 'role:', me_arjun.get('role'))

    # 6. Test public registration role tampering
    reg_payload = json.dumps({
        'email': 'hacker@test.com',
        'password': 'password123',
        'full_name': 'Attacker Bob',
        'role': 'admin' # maliciously requesting admin
    }).encode()
    req = urllib.request.Request('http://127.0.0.1:8000/api/auth/register', data=reg_payload, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as res:
        hacker_data = json.loads(res.read())
        print('Malicious registration role received:', hacker_data.get('role'), '(Must NOT be admin)')

if __name__ == '__main__':
    test()

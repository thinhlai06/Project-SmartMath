import requests
import json
import sys
import os

os.environ['PYTHONIOENCODING'] = 'utf-8'

s = requests.Session()
r = s.post('http://localhost:8000/api/auth/login', data={'username': 'teacher@demo.com', 'password': '123456'})
token = r.json()['access_token']
headers = {'Authorization': f'Bearer {token}'}

# Get topics
r_topics = s.get('http://localhost:8000/api/topics?grade=1', headers=headers)
topics = r_topics.json()
print(f"Total topics grade=1: {len(topics)}", flush=True)
for t in topics:
    safe_name = t['topic_name'].encode('ascii', 'replace').decode('ascii')
    print(f"  id={t['id']} name={safe_name} cat={t['category']}", flush=True)

print("\n--- Testing CPA Bundle each topic ---", flush=True)
for t in topics[:8]:
    r_t = s.post(
        'http://localhost:8000/api/ai/generate-cpa-bundle',
        json={'topic_id': t['id'], 'grade': 1, 'objective': 'test', 'bundle_count': 1},
        headers=headers
    )
    safe_name = t['topic_name'].encode('ascii', 'replace').decode('ascii')
    print(f"  topic_id={t['id']} ({safe_name}): HTTP {r_t.status_code} - {r_t.text[:200]}", flush=True)

print("\n--- Testing legacy CPA generate ---", flush=True)
r_legacy = s.post(
    'http://localhost:8000/api/ai/generate-cpa',
    json={'topic_id': 1, 'grade': 1, 'objective': 'test', 'counts': {'concrete': 2, 'pictorial': 2, 'abstract': 2}},
    headers=headers
)
print(f"Legacy CPA: HTTP {r_legacy.status_code} - {r_legacy.text[:400]}", flush=True)

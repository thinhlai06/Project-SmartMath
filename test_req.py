import requests
import json
import logging
import sys

sys.stdout.reconfigure(encoding='utf-8')

url = "http://localhost:8000"

def run_test():
    # Login as teacher
    rs = requests.post(f"{url}/api/auth/login", data={"username": "teacher@demo.com", "password": "password"})
    if rs.status_code != 200:
        print("Login failed:", rs.text)
        # Maybe demo password is '123456'? Let's try it from the browser agent note
        rs = requests.post(f"{url}/api/auth/login", data={"username": "teacher@demo.com", "password": "123456"})
        if rs.status_code != 200:
            print("Login totally failed:", rs.text)
            return

    token = rs.json().get("access_token")
    cookies = rs.cookies

    print("Logged in. Testing /api/dashboard/stats...")
    try:
        res = requests.get(f"{url}/api/dashboard/stats", cookies=cookies, headers={"Authorization": f"Bearer {token}"})
        print(f"Status: {res.status_code}")
        try:
            print(json.dumps(res.json(), indent=2))
        except:
            print(res.text)
    except Exception as e:
        print("Error calling endpoint:", e)

if __name__ == "__main__":
    run_test()

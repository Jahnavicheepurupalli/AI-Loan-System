import os
import base64
import requests
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")
print("API Key exists:", bool(api_key))

def test_vision():
    image_path = "aadhaar_dummy.jpg"
    if not os.path.exists(image_path):
        print(f"Image {image_path} not found")
        return
        
    with open(image_path, "rb") as f:
        image_data = f.read()
    base64_image = base64.b64encode(image_data).decode("utf-8")
    
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "meta-llama/llama-4-scout-17b-16e-instruct",
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "Identify what type of document this is, and extract text from it. Output JSON only."
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}"
                        }
                    }
                ]
            }
        ],
        "temperature": 0.1,
        "max_tokens": 500
    }
    
    try:
        response = requests.post(url, headers=headers, json=data, timeout=15)
        print("Status code:", response.status_code)
        if response.status_code == 200:
            print("Response JSON:", response.json()["choices"][0]["message"]["content"])
        else:
            print("Response Text:", response.text)
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    test_vision()

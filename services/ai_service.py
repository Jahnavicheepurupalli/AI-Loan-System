import json
import requests
from config import Config


class AIService:

    @staticmethod
    def _call_groq_api(messages):
        if not Config.GROQ_API_KEY:
            return None

        try:
            response = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {Config.GROQ_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "llama-3.1-8b-instant",
                    "messages": messages,
                    "temperature": 0.3
                },
                timeout=10
            )

            if response.status_code == 200:
                return response.json()["choices"][0]["message"]["content"]

        except Exception as e:
            print("Groq Error:", e)

        return None

    @staticmethod
    def get_loan_recommendation(user_data):

        income = float(user_data.get("income", 0))
        amount = float(user_data.get("loan_amount", 0))

        if amount > 2000000:
            loan_type = "Home Loan"
            rate = 8.4
        elif amount > 500000:
            loan_type = "Business Loan"
            rate = 12.0
        else:
            loan_type = "Personal Loan"
            rate = 11.5

        return {
            "recommended_loan": loan_type,
            "why_recommended": "Based on your income and requested amount.",
            "benefits": [
                "Quick approval",
                "Flexible repayment",
                "Digital processing"
            ],
            "estimated_emi": round(amount * 0.03, 2),
            "risk_level": "Low Risk",
            "approval_chance": "90%"
        }

    @staticmethod
    def get_chat_response(history, user_message, language="en"):
        # Store last 10 messages for memory (5 rounds)
        recent_history = history[-10:]
        
        msg_clean = user_message.strip().lower().rstrip("?.!")
        
        # English & Telugu greeting/casual maps
        greetings = {
            "hi", "hello", "hey", "hii", "helo", "namaste", "good morning", "good afternoon", "good evening",
            "హలో", "నమస్తే", "శుభోదయం", "శుభ సాయంత్రం"
        }
        thanks = {
            "thanks", "thank you", "thankyou", "ధన్యవాదాలు", "థాంక్స్"
        }
        byes = {
            "bye", "goodbye", "good bye", "బై", "సెలవు"
        }
        oks = {
            "ok", "okay", "సరే", "ఓకే"
        }
        
        if msg_clean in greetings:
            if language == "te" or any(x in msg_clean for x in ["హలో", "నమస్తే", "శుభోదయం", "శుభ సాయంత్రం"]):
                return "నమస్తే! 👋 AI స్మార్ట్ లోన్ సిస్టమ్‌కు స్వాగతం. ఈరోజు రుణాలు, పత్రాలు, EMI లెక్కలు, అర్హత లేదా అప్లికేషన్ ట్రాకింగ్‌లో నేను మీకు ఎలా సహాయపడగలను?"
            else:
                return "Hello! 👋 Welcome to AI Smart Loan System. How can I help you with loans, documents, EMI calculations, eligibility, or application tracking today?"
                
        if msg_clean in thanks:
            if msg_clean in ["thank you", "thankyou"] or "ధన్యవాదాలు" in msg_clean:
                if language == "te" or "ధన్యవాదాలు" in msg_clean:
                    return "సహాయం చేసినందుకు సంతోషంగా ఉంది! రుణాలు లేదా బ్యాంకింగ్ సేవల గురించి మీకు ఏవైనా ప్రశ్నలు ఉంటే నన్ను అడగండి. 😊"
                else:
                    return "Happy to help! Let me know if you have any questions about loans or banking services."
            else:
                if language == "te" or "థాంక్స్" in msg_clean:
                    return "మీకు స్వాగతం! 😊 రుణాలు, పత్రాలు, EMI లెక్కలు లేదా అప్లికేషన్ ట్రాకింగ్‌తో మీకు సహాయం కావాలంటే, సంకోచించకుండా అడగండి."
                else:
                    return "You're welcome! 😊 If you need help with loans, documents, EMI calculations, or application tracking, feel free to ask."
                    
        if msg_clean in byes:
            if language == "te" or any(x in msg_clean for x in ["బై", "సెలవు"]):
                return "సెలవు! 👋 ఈరోజు మీకు మంచి రోజై ఉండాలని కోరుకుంటున్నాను. రుణ సహాయం కోసం ఎప్పుడైనా మళ్ళీ రండి."
            else:
                return "Goodbye! 👋 Have a great day. Feel free to return anytime for loan assistance."
                
        if msg_clean in oks:
            if language == "te" or any(x in msg_clean for x in ["సరే", "ఓకే"]):
                return "చాలా మంచిది! 👍 మీ రుణ దరఖాస్తు లేదా బ్యాంకింగ్ ప్రశ్నలతో నేను మీకు మరింత ఎలా సహాయపడగలను?"
            else:
                return "Great! 👍 Let me know how I can assist you further with your loan application or banking queries."
        
        # Build prompt and instructions
        lang_str = "Telugu (తెలుగు)" if language == "te" else "English"
        off_topic_reply = "Please ask questions related to loans and banking services."
        if language == "te":
            off_topic_reply = "దయచేసి రుణాలు మరియు బ్యాంకింగ్ సేవలకు సంబంధించిన ప్రశ్నలను అడగండి."

        system_instructions = (
            "You are a helpful and polite AI Loan Assistant for a banking system.\n"
            "Your main role is to answer questions related to loans, EMI, eligibility, documents, interest rates, tracking, face verification, and recommendations.\n"
            "STRICT RULES:\n"
            f"1. ONLY answer questions within the loan and banking domain. If the user asks about anything outside this domain (such as general knowledge, programming, coding, science, weather, general conversation, or any non-banking topics), you MUST reply EXACTLY with: '{off_topic_reply}'. Do not add any greeting or explanation if it is off-topic. Just return that exact sentence.\n"
            "2. Keep your response concise, friendly, and natural. Your response MUST be between 3 and 5 sentences long.\n"
            "3. Do not repeat the same answer or phrases from history.\n"
            f"4. You MUST respond in {lang_str}. If the user speaks or asks in Telugu, respond in Telugu. If in English, respond in English.\n"
            "5. Understand previous context (like income details, loan category, eligibility criteria) from the chat history when answering."
        )

        messages = [{"role": "system", "content": system_instructions}]
        for msg in recent_history:
            role = "user" if msg.get("sender") == "user" else "assistant"
            messages.append({"role": role, "content": msg.get("text", "")})
            
        messages.append({"role": "user", "content": user_message})

        # Call Groq API
        reply = AIService._call_groq_api(messages)
        if not reply:
            if language == "te":
                return "క్షమించండి, ప్రస్తుతం సేవ అందుబాటులో లేదు. దయచేసి తర్వాత ప్రయత్నించండి."
            return "I am sorry, but the chat service is currently unavailable. Please try again later."
            
        # Clean up any potential markdown wraps
        reply_cleaned = reply.strip()
        return reply_cleaned
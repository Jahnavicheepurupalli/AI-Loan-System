import os
import sys

# Configure standard output to use UTF-8
sys.stdout.reconfigure(encoding='utf-8')

sys.path.append(os.path.abspath("."))

from services.ai_service import AIService

def test_chatbot():
    print("Testing Chatbot responses...")
    
    # 1. Greetings (English)
    res_en_hello = AIService.get_chat_response([], "Hello", language="en")
    print(f"EN Greet: {res_en_hello}")
    assert "assist" in res_en_hello.lower() or "help" in res_en_hello.lower() or "hello" in res_en_hello.lower() or "welcome" in res_en_hello.lower()
    
    # 2. Greetings (Telugu)
    res_te_hello = AIService.get_chat_response([], "హలో", language="te")
    print(f"TE Greet: {res_te_hello}")
    assert "సహాయం" in res_te_hello or "హలో" in res_te_hello

    # 3. Off-topic (English)
    res_en_off = AIService.get_chat_response([], "What is the capital of France?", language="en")
    print(f"EN Off-topic: {res_en_off}")
    assert "sorry" in res_en_off.lower() or "loans" in res_en_off.lower()

    # 4. Off-topic (Telugu)
    res_te_off = AIService.get_chat_response([], "భారతదేశం రాజధాని ఏది?", language="te")
    print(f"TE Off-topic: {res_te_off}")
    assert "క్షమించండి" in res_te_off or "లోన్లు" in res_te_off

    # 5. Banking (English)
    res_en_loan = AIService.get_chat_response([], "Tell me about interest rates", language="en")
    print(f"EN Banking: {res_en_loan}")
    assert "personal loan" in res_en_loan.lower() or "interest" in res_en_loan.lower()

    # 6. Thanks (English)
    res_en_thanks = AIService.get_chat_response([], "Thank you", language="en")
    print(f"EN Thanks: {res_en_thanks}")
    assert "welcome" in res_en_thanks.lower()

    # 7. Bye (English)
    res_en_bye = AIService.get_chat_response([], "Bye", language="en")
    print(f"EN Bye: {res_en_bye}")
    assert "goodbye" in res_en_bye.lower() or "day ahead" in res_en_bye.lower()

    print("ALL CHATBOT BACKEND TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_chatbot()

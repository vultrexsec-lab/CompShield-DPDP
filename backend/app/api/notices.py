"""Multilingual DPDP consent notices."""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/notices", tags=["Consent Notices"])

NOTICES = {
    "en": {"language": "English", "code": "en", "title": "Consent notice",
           "body": "We process your personal data for the purpose of {purpose}. You may withdraw this consent at any time as easily as you gave it. Withdrawal will not affect processing already lawfully done. For rights requests use the Data Principal portal or contact the DPO.",
           "withdraw": "Withdraw consent", "rights": "Exercise your rights"},
    "hi": {"language": "Hindi — हिन्दी", "code": "hi", "title": "सहमति सूचना",
           "body": "हम आपके व्यक्तिगत डेटा को {purpose} के उद्देश्य से संसाधित करते हैं। आप यह सहमति किसी भी समय उतनी ही आसानी से वापस ले सकते हैं जितनी आसानी से दी थी। अधिकारों के लिए डेटा प्रिंसिपल पोर्टल या डीपीओ से संपर्क करें।",
           "withdraw": "सहमति वापस लें", "rights": "अपने अधिकार प्रयोग करें"},
    "bn": {"language": "Bengali — বাংলা", "code": "bn", "title": "সম্মতি বিজ্ঞপ্তি",
           "body": "আমরা {purpose} উদ্দেশ্যে আপনার ব্যক্তিগত ডেটা প্রক্রিয়া করি। আপনি যেভাবে সম্মতি দিয়েছেন একই সহজে প্রত্যাহার করতে পারেন।",
           "withdraw": "সম্মতি প্রত্যাহার", "rights": "আপনার অধিকার প্রয়োগ করুন"},
    "ta": {"language": "Tamil — தமிழ்", "code": "ta", "title": "ஒப்புதல் அறிவிப்பு",
           "body": "{purpose} நோக்கத்திற்காக உங்கள் தனிப்பட்ட தரவை நாங்கள் செயலாக்குகிறோம். நீங்கள் வழங்கியது போல எளிதாக ஒப்புதலை திரும்பப் பெறலாம்.",
           "withdraw": "ஒப்புதலை திரும்பப் பெறுக", "rights": "உங்கள் உரிமைகளைப் பயன்படுத்துக"},
    "te": {"language": "Telugu — తెలుగు", "code": "te", "title": "సమ్మతి నోటీసు",
           "body": "{purpose} ప్రయోజనం కోసం మీ వ్యక్తిగత డేటాను మేము ప్రాసెస్ చేస్తాము. మీరు ఇచ్చినంత సులభంగా సమ్మతిని ఉపసంహరించుకోవచ్చు.",
           "withdraw": "సమ్మతి ఉపసంహరించు", "rights": "మీ హక్కులు వినియోగించండి"},
    "mr": {"language": "Marathi — मराठी", "code": "mr", "title": "संमती सूचना",
           "body": "आम्ही तुमचा वैयक्तिक डेटा {purpose} या उद्देशाने प्रक्रिया करतो. तुम्ही दिली तितक्या सहजतेने संमती मागे घेऊ शकता.",
           "withdraw": "संमती मागे घ्या", "rights": "तुमचे अधिकार वापरा"},
    "gu": {"language": "Gujarati — ગુજરાતી", "code": "gu", "title": "સંમતિ સૂચના",
           "body": "અમે તમારા વ્યક્તિગત ડેટાને {purpose} હેતુ માટે પ્રક્રિયા કરીએ છીએ. તમે આપી હોય તેટલી સરળતાથી સંમતિ પાછી ખેંચી શકો છો.",
           "withdraw": "સંમતિ પાછી ખેંચો", "rights": "તમારા અધિકારો વાપરો"},
}

@router.get("")
def list_languages(current_user: User = Depends(get_current_user)):
    return {
        "note": "DPDP Rules — notices in English or Eighth Schedule languages",
        "available": [{"code": v["code"], "language": v["language"]} for v in NOTICES.values()],
        "count": len(NOTICES),
    }

class RenderNoticeIn(BaseModel):
    language: str = "en"
    purpose: str = "providing services"
    organization_name: Optional[str] = "Your Organisation"

@router.post("/render")
def render_notice(body: RenderNoticeIn, current_user: User = Depends(get_current_user)):
    lang = body.language if body.language in NOTICES else "en"
    n = NOTICES[lang]
    return {
        "language": n["language"], "code": n["code"], "title": n["title"],
        "body": n["body"].format(purpose=body.purpose),
        "withdraw_label": n["withdraw"], "rights_label": n["rights"],
        "organization_name": body.organization_name,
        "dpdp_note": "Notice must be clear and in a language the Data Principal understands.",
    }

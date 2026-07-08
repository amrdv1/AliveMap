import sys
import re

def detect_threat_type(text):
    text_lower = text.lower()
    if re.search(r'\b(шахед|мопед|бпла|дрони|герань)\b', text_lower):
        return 'DRONE'
    if re.search(r'\b(х-?59|х-?69|крилата ракета|кр\b)\b', text_lower):
        return 'CRUISE_MISSILE'
    if re.search(r'\b(х-?101|х-?555|х101|х555)\b', text_lower):
        return 'KH101'
    if re.search(r'\b(калібр|калибр)\b', text_lower):
        return 'KALIBR'
    if re.search(r'\b(іскандер|искандер|балістика|баллистика|балістична)\b', text_lower):
        return 'BALLISTIC_MISSILE'
    if re.search(r'\b(кинджал|кинжал)\b', text_lower):
        return 'KINZHAL'
    if re.search(r'\b(циркон)\b', text_lower):
        return 'ZIRCON'
    if re.search(r'\b(ракета|ракети)\b', text_lower):
        return 'MISSILE'
    if re.search(r'\b(каб|фаб|авіабомба|керована бомба)\b', text_lower):
        return 'KAB'
    if re.search(r'\b(міг|mig|су-?34|су-?35|су-?57|авіація|борт)\b', text_lower):
        return 'AIRCRAFT'
    if re.search(r'\b(фпв|fpv|ланцет)\b', text_lower):
        return 'FPV'
    if re.search(r'\b(розвідник|орлан|zala|зала|supercam|суперкам)\b', text_lower):
        return 'RECON'
    if re.search(r'\b(вибух|вибухи|ppo|ппо|відбиття|знищено)\b', text_lower):
        return 'PPO'
    return None

from parser import parse_telegram_text

text = "Обидва реактивних підлітають до Городні з різних сторін...\nОстанній реактивний над Сновськом інколи відлітає, но кружляє по колу."
results = parse_telegram_text(text)
for r in results:
    print(r.model_dump())

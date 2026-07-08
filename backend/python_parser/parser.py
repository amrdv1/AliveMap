import re
import pymorphy3
from typing import List, Optional
from pydantic import BaseModel

morph_uk = pymorphy3.MorphAnalyzer(lang='uk')
morph_ru = pymorphy3.MorphAnalyzer(lang='ru')

class ParsedThreat(BaseModel):
    type: str
    lat: Optional[float] = None
    lng: Optional[float] = None
    confidence: int
    direction: Optional[int] = None
    quantity: int = 1
    targetName: Optional[str] = None
    targetLat: Optional[float] = None
    targetLng: Optional[float] = None

def detect_threat_type(text: str) -> Optional[str]:
    t = text.lower().replace('a', 'а').replace('o', 'о').replace('e', 'е').replace('i', 'і').replace('p', 'р').replace('c', 'с').replace('x', 'х').replace('y', 'у')
    t_padded = f" {re.sub(r'[^а-яіїєґa-z0-9]', ' ', t)} "
    
    if re.search(r'(збито|знищено|мінус|ppo|рро|ппо|робота ппо|вибух|відпрацю|збиття|гучно|не фіксує|не фиксиру|впав|відбилися)', t):
        if not re.search(r'(загроза|увага|політ|рух|вектор)', t):
            return 'PPO'
            
    if re.search(r'(відбій|немає загроз|загрози немає|немає загрози|не активні|тихої ночі|без цілей|спокійно|поки чисто|не фіксується|локаційно втрачено|дорозвідка)', t) or re.search(r' (реб|рєб|чисто|зник) ', t_padded):
        return 'INFO'
        
    if re.search(r'(результат|підсумок|зведення|залишилося|продовжують|по шахедах)', t) and re.search(r'(атак|напад|бпла|ракет|шахед|дрон|ціл|збит|відбит|перехопл|мопед)', t):
        return 'SUMMARY'
    if re.search(r'по шахедах', t):
        return 'SUMMARY'
            
    if re.search(r'(циркон|3м22)', t): return 'ZIRCON'
    if re.search(r'(кинджал|кинжал|х-47)', t): return 'KINZHAL'
    if re.search(r'(іскандер|iskander)', t): return 'ISKANDER'
    if re.search(r'(калібр|kalibr)', t): return 'KALIBR'
    if re.search(r'(х-101|х-55|kh-101|крилат)', t): return 'KH101'
    if re.search(r'(балістик|баллистик)', t): return 'BALLISTIC_MISSILE'
    if re.search(r'(ракет|missile)', t): return 'MISSILE'
    if re.search(r'авіабомб', t) or re.search(r' (каб|каби|кабів|фаб|фаби|бомб|бомби|бомбу) ', t_padded): return 'KAB'
    if re.search(r'(fpv|fрv|фпв|фпві)', t): return 'FPV'
    if re.search(r'(молнія|блискавка|molniya)', t): return 'MOLNIYA'
    if re.search(r'(гербер|імітатор|пародія|decoy|parodi|gerbera)', t): return 'DECOY'
    if re.search(r'(розвідник|орлан|zala|зала|supercam|suрercam|суперкам|recon)', t): return 'RECON'
    if re.search(r'(реактивн|шахед|бпла|мопед|геран|shahed|италмас|італмас)', t) or re.search(r' (дрон|дрони|drone) ', t_padded): return 'DRONE'
    if re.search(r'(авіація|су-3|су-2|міг|ту-9|ту-2|літак|борти)', t): return 'AIRCRAFT'
    
    if re.search(r'(швидкісна ціль|швидкісні цілі|швидкісна п\.ц\.|швидкісні п\.ц\.)', t): return 'UNKNOWN'
    if re.search(r'(невідом\S*\s+(тип|об.єкт|ціль|засіб)|об.єкт\s+невідом|ціль\s+невідом|невстановлен\S*\s+тип|повітряна?\s+ціль|п\.ц\.)', t): return 'UNKNOWN'
    
    return None

def parse_quantity(text: str) -> int:
    # Remove times like 16:13 so they aren't parsed as quantities
    text_no_time = re.sub(r'\b\d{1,2}:\d{2}\b', '', text)
    
    num_match = re.search(r'(?:[^\d]|^)(\d{1,2})\s*(?:шахед|ракет|бпла|каб|дрон|ціл)', text_no_time, re.IGNORECASE)
    if num_match: return min(int(num_match.group(1)), 30)
    
    num_match_reverse = re.search(r'(?:шахед|ракет|бпла|каб|дрон|ціл)[^\d]{0,20}(\d{1,2})(?![a-zа-яіїєґ])', text_no_time, re.IGNORECASE)
    if num_match_reverse: return min(int(num_match_reverse.group(1)), 30)
    
    t_padded = f" {re.sub(r'[^а-яіїєґa-z0-9]', ' ', text.lower())} "
    if re.search(r' (пара|пару) ', t_padded): return 2
    if re.search(r' (кілька|декілька) ', t_padded): return 3
    if re.search(r' (група|зграя) ', t_padded): return 5
    if re.search(r' (багато|масова) ', t_padded): return 8
    return 1

def lemmatize_word(word: str) -> str:
    word = word.strip().lower()
    p_uk = morph_uk.parse(word)
    p_ru = morph_ru.parse(word)
    
    # Prefer Ukrainian dictionary match
    if p_uk and p_uk[0].is_known:
        return p_uk[0].normal_form.capitalize()
    # Prefer Russian dictionary match
    if p_ru and p_ru[0].is_known:
        return p_ru[0].normal_form.capitalize()
        
    # If both are predicted, use the one with the higher score, or default to Ukrainian
    if p_uk and p_ru:
        if p_ru[0].score > p_uk[0].score:
            return p_ru[0].normal_form.capitalize()
        return p_uk[0].normal_form.capitalize()
        
    return word.capitalize()

def parse_telegram_text(text: str) -> List[ParsedThreat]:
    # Fix mixed english/cyrillic letters while preserving case
    text = text.replace('a', 'а').replace('o', 'о').replace('e', 'е').replace('i', 'і').replace('p', 'р').replace('c', 'с').replace('x', 'х').replace('y', 'у')
    text = text.replace('A', 'А').replace('O', 'О').replace('E', 'Е').replace('I', 'І').replace('P', 'Р').replace('C', 'С').replace('X', 'Х').replace('Y', 'У')
    
    lower_text = text.lower()
    
    if re.search(r'(озер|нафтопродукт|рятувальник|дтп|аварі|пожеж|забруднення|економік|засідання|президент|крадіжк|ремонт|комунальн|клімат|наслідок|наслідки|депутат|санкці|врятував|врятувала|на жаль|помер|загинув|постражда|фото|відео|наживо|пишуть|повідомляє|заявив|інтерв.ю|стаття|новина|деталі|читайте|джерело|коментар|підписав|впк|виробництво|комплектуючих|російського|зведення|брифінг|поранений|евакуація|смерт|колишнього|нардеп|закупівл|розкрадання|бюджетн|слідств|вартість|фіктивн|фоп|готівк|розслідують|расследуют|хищение|закупке|производителе|стоимость|средств|заволодіння|розслідує|гроші|мільярд|млрд|обмін|валют|obmin|реклама|знижка|розіграш|магазин|ціна|грн|гривень|клієнт|підпишись|канал|працюємо|vpn|crypto|крипта|одяг|спорядження|промокод|акція|бонус|казино|slots)', lower_text):
        return []

    lower_text = re.sub(r'[.!?;:]', ' ', lower_text)
    text = re.sub(r'[.!?;:]', ' ', text)
    base_type = detect_threat_type(lower_text)
    
    if not base_type:
        return []
        
    if base_type in ['INFO', 'SUMMARY', 'PPO']:
        return [ParsedThreat(type=base_type, confidence=100)]
        
    chunks = [c for c in re.split(r'(?i)(?:\n|,|(?:а|і|та)\s+також\s+|\s+та\s+)', text) if len(c.strip()) > 3]
    results = []
    
    for chunk in chunks:
        chunk_lower = chunk.lower()
        chunk_type = detect_threat_type(chunk_lower) or base_type
        if chunk_type in ['INFO', 'SUMMARY', 'PPO']:
            continue
            
        qty = parse_quantity(chunk_lower)
        
        # Search for targets using PyMorphy3 to get proper Nominative case!
        target_match = re.search(r'(?:на|курсом на|напрямку|до|над|біля|поблизу|район|в районі|у|в|зпр:|через)\s+([А-ЯІЇЄҐ][а-яіїєґ\'\`\-]{2,}(?:\s+[А-ЯІЇЄҐа-яіїєґ\'\`\-]{2,}){0,2})', chunk)
        
        if not target_match:
            # Fallback: time followed by a Capitalized word (e.g. "19:22 Марганецька ТГ")
            target_match = re.search(r'(?:\d{1,2}:\d{2})\s+([А-ЯІЇЄҐ][а-яіїєґ\'\`\-]{2,}(?:\s+[А-ЯІЇЄҐа-яіїєґ\'\`\-]{2,}){0,2})', chunk)
            
        if not target_match:
            # Fallback: Just look for a capitalized word that isn't at the very start
            target_match = re.search(r'(?:\s+|-)([А-ЯІЇЄҐ][а-яіїєґ\'\`\-]{3,}(?:\s+[А-ЯІЇЄҐ][а-яіїєґ\'\`\-]{2,}){0,1})', chunk)

        target_name = None
        if target_match:
            extracted_name = target_match.group(1).strip()
            skip_words = ['також', 'шахед', 'дрон', 'бпла', 'ракет', 'район', 'область', 'типу', 'невідом', 'ударний', 'реактивний', 'загроза', 'увага', 'відбій']
            if not any(extracted_name.lower().startswith(w) for w in skip_words):
                # Split by space and lemmatize each word
                parts = extracted_name.split()
                lemmatized_parts = [lemmatize_word(p) for p in parts]
                target_name = " ".join(lemmatized_parts)
                
        results.append(ParsedThreat(
            type=chunk_type,
            quantity=qty,
            confidence=30,
            targetName=target_name
        ))
        
    # Deduplicate
    unique_results = []
    for res in results:
        is_dup = False
        for u in unique_results:
            if u.type == res.type and u.targetName == res.targetName:
                is_dup = True
                break
        if not is_dup:
            unique_results.append(res)
            
    return unique_results

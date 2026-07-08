import os
import sys
import json
import re
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from backend.python_parser.parser import detect_threat_type, parse_quantity, lemmatize_word, parse_telegram_text

text1 = """🪖 ⛔ Загроза ФПВ
⬛ 00:07 🍉 Херсонський узвіз
🟪 00:06 Стара 🏡 Частина
🟪 00:04 Нікополь"""

text2 = """Донеччина:
3х БпЛА курсом на Слов'янськ.

Запорізька область:
2х БпЛА курсом на Новомиколаївку.
---
Дніпропетровщина:
10х БпЛА з Запорізької області курсом на Синельникове."""

def debug_text(text):
    text = text.replace('a', 'а').replace('o', 'о').replace('e', 'е').replace('i', 'і').replace('p', 'р').replace('c', 'с').replace('x', 'х').replace('y', 'у')
    text = text.replace('A', 'А').replace('O', 'О').replace('E', 'Е').replace('I', 'І').replace('P', 'Р').replace('C', 'С').replace('X', 'Х').replace('Y', 'У')
    text = re.sub(r'[^\w\s.,:;!?\'\`\-]', ' ', text, flags=re.UNICODE)
    text = re.sub(r'\s+', ' ', text).strip()
    print("Cleaned text:", repr(text))
    
    chunks = [c for c in re.split(r'(?i)(?:\n|,|(?:а|і|та)\s+також\s+|\s+та\s+)', text) if len(c.strip()) > 3]
    for i, chunk in enumerate(chunks):
        print(f"Chunk {i}: {repr(chunk)}")
        
        target_match = re.search(r'(?i:на|курсом на|напрямку|в напрямку|у напрямку|до|над|біля|поблизу|район|в районі|у районі|у бік|в бік|у|в|зпр:|через)\s+(?:[а-яіїєґА-ЯІЇЄҐa-zA-Z\.\-]{1,15}\s+){0,2}([А-ЯІЇЄҐ][а-яіїєґ\'\`\-]{2,}(?:\s+[А-ЯІЇЄҐ][а-яіїєґ\'\`\-]{2,}){0,2})', chunk)
        if not target_match:
            target_match = re.search(r'(?:\d{1,2}:\d{2})\s+([а-яіїєґА-ЯІЇЄҐ\'\`\-]{3,}(?:\s+[а-яіїєґА-ЯІЇЄҐ\'\`\-]{2,}){0,2})', chunk)
        if not target_match:
            target_match = re.search(r'^\s*([А-ЯІЇЄҐ][а-яіїєґ\'\`\-]{2,}(?:\s+[А-ЯІЇЄҐ][а-яіїєґ\'\`\-]{2,}){0,2})', chunk)
        
        if target_match:
            print(f"  Target raw: {target_match.group(1)}")
        else:
            print("  No target")
        
        print(f"  Quantity: {parse_quantity(chunk.lower())}")

print("TEXT 1:")
debug_text(text1)
res1 = parse_telegram_text(text1)
print(json.dumps([r.__dict__ for r in res1], ensure_ascii=False, indent=2))

print("\nTEXT 2:")
debug_text(text2)
res2 = parse_telegram_text(text2)
print(json.dumps([r.__dict__ for r in res2], ensure_ascii=False, indent=2))

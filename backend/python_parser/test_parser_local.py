import json
import re
from parser import parse_telegram_text

text1 = "Шостка шах до вас\n---\nреактивний завертає туди ж"
text2 = "Пара реактивних дронів на Шостку, буде гучно!"

with open('debug_out.txt', 'w', encoding='utf-8') as f:
    for text in [text1, text2]:
        f.write(f"TEXT: {text}\n")
        text_clean = re.sub(r'[^\w\s.,:;!?\'\`\-]', ' ', text, flags=re.UNICODE)
        chunks = [c for c in re.split(r'(?i)(?:\n|,|(?:а|і|та)\s+також\s+|\s+та\s+)', text_clean) if len(c.strip()) > 3]
        for chunk in chunks:
            f.write(f"  CHUNK: {chunk}\n")
            m = re.search(r'(?:на|курсом на|напрямку|до|над|біля|поблизу|район|в районі|у|в|зпр:|через)\s+([А-ЯІЇЄҐ][а-яіїєґ\'\`\-]{2,}(?:\s+[А-ЯІЇЄҐ][а-яіїєґ\'\`\-]{2,}){0,2})', chunk)
            f.write(f"  MATCH: {m.group(1) if m else None}\n")

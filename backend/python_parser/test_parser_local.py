import json
import re
from parser import parse_telegram_text

text = "Обидва реактивних підлітають до Городні з різних сторін...\nОстанній реактивний над Сновськом інколи відлітає, но кружляє по колу."
results = parse_telegram_text(text)
with open('test_out.json', 'w', encoding='utf-8') as f:
    json.dump([r.model_dump() for r in results], f, ensure_ascii=False, indent=2)

import pymorphy3
morph_uk = pymorphy3.MorphAnalyzer(lang='uk')
with open('morph_out.txt', 'w', encoding='utf-8') as f:
    for p in morph_uk.parse('Городні'):
        f.write(f"Городні: {p.normal_form} - {p.tag}\n")
    for p in morph_uk.parse('Городня'):
        f.write(f"Городня: {p.normal_form} - {p.tag}\n")

import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from backend.python_parser.parser import parse_telegram_text
import json

text = """🪖 ⛔ Загроза ФПВ
⬛ 00:07 🍉 Херсонський узвіз
🟪 00:06 Стара 🏡 Частина
🟪 00:04 Нікополь"""

res = parse_telegram_text(text)
print(json.dumps([r.__dict__ for r in res], ensure_ascii=False, indent=2))

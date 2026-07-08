import json
from parser import parse_telegram_text

text = '” район≥ селища јнтон≥вка Ч активн≥сть дрона типу FPV, пов≥домл€ють очевидц≥'
result = parse_telegram_text(text)
print(json.dumps([t.model_dump() for t in result], ensure_ascii=False, indent=2))

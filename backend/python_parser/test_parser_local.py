import pymorphy3
morph_uk = pymorphy3.MorphAnalyzer(lang='uk')
with open('morph_out.txt', 'w', encoding='utf-8') as f:
    f.write(f"Сумщині: {morph_uk.parse('Сумщині')[0].normal_form}\n")
    for p in morph_uk.parse('Сумщині'):
        f.write(f"  {p.normal_form} - {p.tag}\n")
    for p in morph_uk.parse('Городня'):
        f.write(f"Городня: {p.normal_form} - {p.tag}\n")

import os
from datetime import datetime
from jinja2 import Environment, FileSystemLoader
from weasyprint import HTML

import re

def generate_petition_pdf(petition_content: str, client_name: str) -> bytes:
    """
    Dilekçe içeriğini ve müvekkil adını alarak WeasyPrint ile PDF bytelarına çevirir.
    Akıllı metin ayıklama sayesinde gereksiz boşlukları ve şablon hatalarını önler.
    """
    # Jinja2 ortamını ayarla
    current_dir = os.path.dirname(os.path.abspath(__file__))
    templates_dir = os.path.join(current_dir, "../templates")
    env = Environment(loader=FileSystemLoader(templates_dir))
    template = env.get_template("petition_template.html")
    
    safe_content = petition_content or "Dilekçe içeriği bulunamadı."
    raw_lines = [p.strip() for p in safe_content.split("\n") if p.strip()]
    
    paragraphs = []
    for line in raw_lines:
        line_type = "para"
        
        # Eğer satır tamamı büyük harfse (İTİRAZ EDEN, KONU, AÇIKLAMALAR vb) veya ':' içeriyorsa (MÜVEKKİL: Ahmet)
        if re.match(r'^[A-ZÇĞİÖŞÜ\s]{3,}:?\s*$', line) or re.match(r'^[A-ZÇĞİÖŞÜ][A-ZÇĞİÖŞÜa-zçğıöşü\s]+:\s', line):
            line_type = "header"
        # Eğer numaralandırılmış liste ise (1., 2), - )
        elif re.match(r'^[\d]+\.[\s\-]', line) or re.match(r'^[\-\*]\s', line):
            line_type = "list_item"
            
        paragraphs.append({"text": line, "type": line_type})
    
    # Türkçe tarih oluşturma
    months = ["", "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"]
    now = datetime.now()
    date_str = f"{now.day} {months[now.month]} {now.year}"
    
    # HTML'i Jinja2 ile değişkenleri bağlayarak oluştur
    rendered_html = template.render(
        paragraphs=paragraphs,
        client_name=client_name,
        current_date=date_str
    )
    
    # WeasyPrint ile HTML'i render edip PDF byteları olarak döndür
    pdf_bytes = HTML(string=rendered_html).write_pdf()
    
    return pdf_bytes

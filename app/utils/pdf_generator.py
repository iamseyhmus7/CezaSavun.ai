import os
from datetime import datetime
import markdown
from jinja2 import Environment, FileSystemLoader
from weasyprint import HTML

TEMPLATE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'templates')

def generate_petition_pdf(petition_data: dict) -> bytes:
    """
    Markdown formatındaki dilekçe metnini Jinja2 HTML şablonuna yerleştirir
    ve WeasyPrint kullanarak profesyonel bir PDF dosyasına çevirir.
    
    Beklenen petition_data anahtarları:
    - content: Markdown formatındaki dilekçe metni
    - client_name: İtiraz edenin adı soyadı
    - penalty_serial_no: Ceza tutanak seri no (Filigran veya footer için)
    """
    # 1. Jinja2 Ortamını Yükle
    env = Environment(loader=FileSystemLoader(TEMPLATE_DIR))
    template = env.get_template('petition_template.html')
    
    # 2. Markdown'ı HTML'e Çevir (Başlıklar, listeler, kalın yazılar vs.)
    md_content = petition_data.get('content', '')
    html_content = markdown.markdown(md_content)
    
    # 3. Şablon Değişkenlerini Hazırla
    context = {
        'content': html_content,
        'client_name': petition_data.get('client_name', ''),
        'penalty_serial_no': petition_data.get('penalty_serial_no', 'Bilinmiyor'),
        'current_date': datetime.now().strftime("%d.%m.%Y")
    }
    
    # 4. HTML Çıktısını Oluştur
    rendered_html = template.render(context)
    
    # 5. WeasyPrint ile PDF Byte Dizisine Çevir
    pdf_bytes = HTML(string=rendered_html).write_pdf()
    
    return pdf_bytes

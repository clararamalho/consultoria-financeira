import os
import re

def inject_components():
    # 1. Read components
    with open('components/header.html', 'r', encoding='utf-8') as f:
        header_content = f.read()
    
    with open('components/footer.html', 'r', encoding='utf-8') as f:
        footer_content = f.read()

    # 2. Find all HTML files
    html_files = [f for f in os.listdir('.') if f.endswith('.html')]
    
    for filename in html_files:
        print(f"Processando {filename}...")
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()

        # Inject Header
        if '<!-- HEADER_START -->' in content and '<!-- HEADER_END -->' in content:
            new_content = re.sub(
                r'<!-- HEADER_START -->.*?<!-- HEADER_END -->',
                f'<!-- HEADER_START -->\n{header_content}\n<!-- HEADER_END -->',
                content,
                flags=re.DOTALL
            )
            content = new_content
        
        # Inject Footer
        if '<!-- FOOTER_START -->' in content and '<!-- FOOTER_END -->' in content:
            new_content = re.sub(
                r'<!-- FOOTER_START -->.*?<!-- FOOTER_END -->',
                f'<!-- FOOTER_START -->\n{footer_content}\n<!-- FOOTER_END -->',
                content,
                flags=re.DOTALL
            )
            content = new_content

        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)

if __name__ == "__main__":
    inject_components()
    print("Injeção de componentes concluída com sucesso!")

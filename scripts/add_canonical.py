#!/usr/bin/env python3
"""
Adiciona <link rel="canonical"> após <meta name="robots"> em páginas HTML
"""

import os
import re

files_and_canonicals = {
    'newsletter.html': 'https://clararamalho.com.br/newsletter',
    'sobre.html': 'https://clararamalho.com.br/sobre',
    'politica-de-privacidade.html': 'https://clararamalho.com.br/politica-de-privacidade',
    'termos-de-uso.html': 'https://clararamalho.com.br/termos-de-uso',
    'confirmar.html': 'https://clararamalho.com.br/confirmar',
    'descadastrar.html': 'https://clararamalho.com.br/descadastrar',
    '404.html': 'https://clararamalho.com.br/404',
    'post.html': 'https://clararamalho.com.br/post',
}

script_dir = os.path.dirname(os.path.abspath(__file__))

for filename, canonical_url in files_and_canonicals.items():
    filepath = os.path.join(script_dir, filename)

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Procura pela linha <meta name="robots" ...> e insere canonical na linha seguinte
        # Pattern: <meta name="robots" ... /> seguido de \n
        pattern = r'(<meta name="robots"[^>]*/>)\n'
        replacement = r'\1\n  <link rel="canonical" href="' + canonical_url + '" />\n'

        new_content = re.sub(pattern, replacement, content)

        # Verifica se houve mudança
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"✓ {filename} — canonical adicionado")
        else:
            print(f"⚠ {filename} — <meta name=\"robots\"> não encontrado ou canonical já existe")

    except FileNotFoundError:
        print(f"❌ {filename} — arquivo não encontrado")
    except Exception as e:
        print(f"❌ {filename} — erro: {e}")

print("\nConcluído!")

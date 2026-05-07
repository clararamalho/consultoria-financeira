#!/usr/bin/env python3
import os
import json
import re
from pathlib import Path

def extrair_conteudo(caminho_arquivo):
    """Remove frontmatter YAML e retorna apenas o conteúdo textual."""
    with open(caminho_arquivo, 'r', encoding='utf-8') as f:
        conteudo = f.read()

    # Remove frontmatter: tudo entre os primeiros --- e o próximo ---
    match = re.match(r'^---\s*\n(.*?)\n---\s*\n(.*)', conteudo, re.DOTALL)
    if match:
        return match.group(2).strip()

    return conteudo.strip()

def gerar_search_index():
    """Percorre posts/ e gera search-index.json."""
    pasta_posts = 'posts'
    arquivos_md = sorted([
        f for f in os.listdir(pasta_posts)
        if f.endswith('.md') and os.path.isfile(os.path.join(pasta_posts, f))
    ])

    search_index = []

    for arquivo in arquivos_md:
        slug = arquivo.replace('.md', '')
        caminho = os.path.join(pasta_posts, arquivo)
        conteudo = extrair_conteudo(caminho)

        search_index.append({
            'slug': slug,
            'conteudo': conteudo
        })

    # Salva o JSON
    with open('posts/search-index.json', 'w', encoding='utf-8') as f:
        json.dump(search_index, f, ensure_ascii=False, indent=2)

    print(f'[OK] search-index.json gerado com {len(search_index)} posts')

if __name__ == '__main__':
    gerar_search_index()

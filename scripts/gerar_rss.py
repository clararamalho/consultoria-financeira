#!/usr/bin/env python3
"""
Gera rss.xml a partir de posts/index.json
"""

import json
import os
from datetime import datetime
from xml.etree.ElementTree import Element, SubElement, tostring
from xml.dom import minidom

def formatar_data_rss(data_str):
    """Converte data ISO (YYYY-MM-DD) para formato RFC 2822 (RSS)"""
    try:
        dt = datetime.strptime(data_str, "%Y-%m-%d")
        # Formato RFC 2822: Wed, 02 Oct 2002 15:30:00 +0000
        return dt.strftime("%a, %d %b %Y 00:00:00 +0000")
    except:
        return ""

def escapar_xml(texto):
    """Escapa caracteres especiais para XML"""
    if not texto:
        return ""
    return (texto
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace('"', "&quot;")
            .replace("'", "&apos;"))

def gerar_rss():
    """Lê posts/index.json e gera rss.xml"""

    # Caminho dos arquivos
    script_dir = os.path.dirname(os.path.abspath(__file__))
    repo_root = os.path.dirname(script_dir)
    posts_file = os.path.join(repo_root, "posts", "index.json")
    rss_file = os.path.join(repo_root, "rss.xml")

    # Ler posts
    try:
        with open(posts_file, "r", encoding="utf-8") as f:
            posts = json.load(f)
    except FileNotFoundError:
        print(f"Erro: {posts_file} não encontrado")
        return False
    except json.JSONDecodeError:
        print(f"Erro: {posts_file} contém JSON inválido")
        return False

    # Criar elemento raiz RSS
    rss = Element("rss")
    rss.set("version", "2.0")

    # Adicionar namespace para conteúdo
    rss.set("xmlns:content", "http://purl.org/rss/1.0/modules/content/")

    # Criar channel
    channel = SubElement(rss, "channel")

    # Metadados do canal
    SubElement(channel, "title").text = "Clara Ramalho · Consultoria Financeira"
    SubElement(channel, "link").text = "https://clararamalho.com.br/"
    SubElement(channel, "description").text = "Educação financeira, análise de mercado e planejamento. Quinzenal, sem enrolação."
    SubElement(channel, "language").text = "pt-br"
    SubElement(channel, "copyright").text = "© 2026 Clara Ramalho. Todos os direitos reservados."
    SubElement(channel, "lastBuildDate").text = datetime.now().strftime("%a, %d %b %Y %H:%M:%S +0000")
    SubElement(channel, "docs").text = "https://www.rssboard.org/rss-specification"
    SubElement(channel, "generator").text = "gerar_rss.py"

    # Adicionar posts
    for post in posts:
        item = SubElement(channel, "item")

        SubElement(item, "title").text = escapar_xml(post.get("titulo", ""))
        SubElement(item, "link").text = f"https://clararamalho.com.br/post.html?slug={post.get('slug', '')}"
        SubElement(item, "description").text = escapar_xml(post.get("resumo", ""))
        SubElement(item, "pubDate").text = formatar_data_rss(post.get("data", ""))
        SubElement(item, "category").text = escapar_xml(post.get("categoria", ""))
        SubElement(item, "guid").text = f"https://clararamalho.com.br/post.html?slug={post.get('slug', '')}"

    # Escrever arquivo XML
    try:
        xml_str = tostring(rss, encoding="unicode")

        # Formatar XML com indentação
        dom = minidom.parseString(xml_str)
        xml_formatted = dom.toprettyxml(indent="  ", encoding="UTF-8").decode("utf-8")

        # Remover linhas vazias em excesso
        xml_lines = [line for line in xml_formatted.split("\n") if line.strip()]
        xml_formatted = "\n".join(xml_lines)

        with open(rss_file, "w", encoding="utf-8") as f:
            f.write(xml_formatted)

        print(f"[OK] RSS feed gerado com sucesso: {rss_file}")
        print(f"     {len(posts)} posts incluidos")
        return True

    except Exception as e:
        print(f"Erro ao escrever {rss_file}: {e}")
        return False

if __name__ == "__main__":
    sucesso = gerar_rss()
    exit(0 if sucesso else 1)

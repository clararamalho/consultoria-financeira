import codecs
with codecs.open('assets/index.page.css', 'r', encoding='utf-8') as f:
    lines = f.readlines()
override = [
    '\n',
    '/* servicos dark mode override */\n',
    '[data-theme="dark"] #servicos { background: var(--dark-bg); }\n',
    '[data-theme="dark"] #servicos .servico-mockup {\n',
    '  background: var(--dark-surface-2);\n',
    '  border-color: var(--dark-border);\n',
    '}\n',
    '[data-theme="dark"] #servicos .mock-card {\n',
    '  background: var(--dark-surface);\n',
    '  border-color: var(--dark-border);\n',
    '}\n',
    '[data-theme="dark"] #servicos .mock-card-title { color: var(--dark-text); }\n',
    '[data-theme="dark"] #servicos .mock-bar-track { background: var(--dark-surface); }\n',
    '\n',
]
for i, line in enumerate(override):
    lines.insert(420 + i, line)
with codecs.open('assets/index.page.css', 'w', encoding='utf-8') as f:
    f.writelines(lines)
print('Feito. Linhas inseridas:', len(override))

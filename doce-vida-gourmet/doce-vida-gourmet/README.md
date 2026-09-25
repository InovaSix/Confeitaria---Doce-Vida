# Doce Vida Gourmet — Branding Page

Site estático (HTML + CSS + JS puro, sem build).

## Como rodar
1. Abra a pasta no VS Code.
2. Instale a extensão **Live Server** e clique em "Go Live" no `index.html`
   (ou apenas abra o `index.html` no navegador).

## Estrutura
```
index.html      página
css/style.css   estilos (cores em :root, no topo)
js/app.js       vitrine, sacola, encomendas, calendário e WhatsApp
img/            fotos recortadas da arte da marca
```

## Onde editar
- **Número do WhatsApp:** `const ZAP` no início de `js/app.js` (e os links `wa.me` no `index.html`).
- **Produtos da pronta entrega e estoque:** `DEFAULT_PRODUCTS` em `js/app.js`.
- **Agenda:** `DEFAULT_AGENDA` — `leadDays` (antecedência), `bloqueados` (datas `AAAA-MM-DD`), `fechado` (dias da semana, 0 = domingo).
- **Opções de encomenda:** `TIPOS`, `TAM`, `MASSA`, `RECHEIO`, `COB`, `EXTRAS`, `QTD`, `SABORES`, `KITS`, `HORAS`.
- **Cores:** variáveis `--creme`, `--rosa`, `--framboesa`, `--choco`, `--ouro` em `css/style.css`.

## Painel da equipe
A seção `#painel` (estoque e agenda) só aparece quando existe um back-end.
Na versão publicada no Claude ela usa o banco do artefato; aqui ela fica oculta.
Para ativar, conecte `db` na função `boot()` de `js/app.js` a um serviço como Firebase ou Supabase.

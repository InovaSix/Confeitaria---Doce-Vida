# Doce Vida Gourmet — Branding Page

Site estático (HTML + CSS + JS puro, sem build), pronto para o GitHub Pages.

**Endereço de teste:** https://inovasix.github.io/Confeitaria---Doce-Vida/

## Publicar no GitHub Pages
1. Envie as alterações para a branch `main`.
2. No GitHub: **Settings → Pages → Build and deployment**
   - Source: **Deploy from a branch**
   - Branch: **main** · pasta **/ (root)** → **Save**
3. Em 1 a 2 minutos o site fica no ar no endereço acima.
   Cada novo push na `main` atualiza o site automaticamente.

O arquivo `.nojekyll` faz o GitHub servir os arquivos exatamente como estão.

## Rodar no computador
Abra a pasta no VS Code, instale a extensão **Live Server** e clique em "Go Live"
no `index.html` (ou apenas abra o `index.html` no navegador).

## Estrutura
```
index.html      página
css/style.css   estilos (cores em :root, no topo)
js/app.js       vitrine, sacola, encomendas, calendário e envio pelo WhatsApp
img/logo-dv.png logo (também usada como ícone e na prévia do link)
img/real/       fotos reais dos trabalhos da confeitaria
```

## Onde editar
- **Número do WhatsApp:** `const ZAP` no início de `js/app.js` (e os links `wa.me` no `index.html`).
- **Produtos da pronta entrega e estoque:** `DEFAULT_PRODUCTS` em `js/app.js`.
- **Agenda:** `DEFAULT_AGENDA` — `leadDays` (antecedência), `bloqueados` (datas `AAAA-MM-DD`), `fechado` (dias da semana, 0 = domingo).
- **Opções de encomenda:** `TIPOS`, `TAM`, `MASSA`, `RECHEIO`, `COB`, `EXTRAS`, `QTD`, `SABORES`, `KITS`, `HORAS`.
- **Cores:** variáveis em `:root` no topo de `css/style.css`.
- **Trocar uma foto:** substitua o arquivo em `img/real/` mantendo o mesmo nome.

## Depois de alterar CSS ou JS
O navegador guarda os arquivos em cache. Ao mudar `css/style.css` ou `js/app.js`,
aumente o número da versão no `index.html` (`style.css?v=8` → `?v=9`, `app.js?v=3` → `?v=4`)
para os visitantes receberem a versão nova.

## Painel da equipe
A seção `#painel` (estoque e agenda) fica oculta no site estático.
Para ativar, conecte `db` na função `boot()` de `js/app.js` a um serviço como Firebase ou Supabase.

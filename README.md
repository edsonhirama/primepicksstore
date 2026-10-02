# 🌐 PrimePicks Store

Repositório de páginas estáticas independentes para produtos de afiliado, publicado e otimizado para **Cloudflare Pages**.

---

## 📁 Estrutura do Projeto

O projeto é estruturado de forma que cada produto possua sua própria pasta isolada com ativos dedicados (CSS, JavaScript e imagens), acessível diretamente pelo seu respectivo caminho de rota:

```text
primepicksstore/
├── index.html                   # Página inicial simples da raiz
├── .gitignore                   # Arquivos ignorados pelo Git
├── LICENSE                      # Licença MIT
├── README.md                    # Documentação do projeto
└── derila-ergo/                 # Página do produto Derila Ergo (/derila-ergo/)
    ├── index.html               # Estrutura HTML da página
    └── assets/
        ├── css/
        │   └── style.css        # Estilos específicos da página
        ├── js/
        │   └── main.js          # Scripts específicos da página
        └── images/              # Imagens e mídia do produto
```

---

## 🚀 Publicação no Cloudflare Pages

1. Conecte este repositório do GitHub ao **Cloudflare Pages**.
2. Configurações de Build:
   - **Framework preset**: None (HTML estático)
   - **Build command**: *(deixar em branco)*
   - **Build output directory**: `.` (ou `/`)
3. As páginas estão disponíveis nas rotas:
   - Raiz: `https://primepicksstore.store/`
   - Derila Ergo: `https://primepicksstore.store/derila-ergo/`

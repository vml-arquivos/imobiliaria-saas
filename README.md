# Casa DF Imóveis - SaaS Imobiliário

## 🏠 Visão Geral do Projeto

O **Casa DF Imóveis** é uma solução SaaS completa para imobiliárias e corretores, focada na gestão de imóveis (CRM) e na presença digital (Site Builder). O sistema foi projetado para ser robusto, escalável e altamente integrado com ferramentas de automação de marketing e comunicação.

## ⚙️ Arquitetura e Tecnologias

O projeto segue uma arquitetura moderna baseada em monorepo, utilizando as seguintes tecnologias:

| Componente | Tecnologia | Função |
| :--- | :--- | :--- |
| **Frontend (Site Builder)** | React, TypeScript, Wouter, TailwindCSS | Interface do usuário, site público e painel administrativo. |
| **Backend (API)** | Node.js, Express, tRPC, TypeScript | Lógica de negócios, autenticação, rotas de API e integração com serviços externos. |
| **Banco de Dados** | **PostgreSQL** (Compatível com Supabase) | Persistência de dados (usuários, imóveis, leads, configurações). Gerenciado via Drizzle ORM. |
| **ORM/Migrações** | Drizzle ORM, Drizzle Kit | Mapeamento Objeto-Relacional e controle de versão do banco de dados. **Configurado para PostgreSQL.** |
| **Autenticação** | Local (scrypt) | Sistema de login e registro próprio, sem dependências OAuth. |
| **Storage** | AWS S3 (ou compatível, ex: MinIO) | Armazenamento de imagens de imóveis e arquivos. |
| **Automação/CRM** | N8n (Webhooks) | Integração com fluxos de trabalho externos, como envio de WhatsApp e automação de leads. |
| **Containerização** | Docker, Docker Compose | Empacotamento e orquestração para deploy simplificado. |

## 🚀 Instruções de Deploy (VPS)

O deploy é realizado via Docker Compose, utilizando o script de automação `setup_vps.sh`.

### Pré-requisitos

1.  **VPS com Docker e Docker Compose** instalados.
2.  **Banco de Dados PostgreSQL** (ex: Supabase, ElephantSQL ou local).
3.  **Credenciais de Storage S3** (ou compatível).
4.  **URLs dos Webhooks N8n** para automação de leads e chat.

### Passo a Passo

1.  **Clonar o Repositório e Tornar o Script Executável:**

    ```bash
    git clone https://github.com/vml-arquivos/imobiliaria-saas.git
    cd imobiliaria-saas
    chmod +x setup_vps.sh
    ```

2.  **Executar o Script de Setup:**

    O script irá guiá-lo, criando o arquivo `.env` e solicitando a configuração das variáveis críticas.

    ```bash
    ./setup_vps.sh
    ```

3.  **Configurar o Arquivo `.env` (CRÍTICO):**

    O script irá pausar e solicitar que você edite o arquivo `.env` com suas credenciais. **Este passo é obrigatório.**

    ```ini
    # Exemplo de variáveis críticas
    DATABASE_URL="postgresql://user:password@host:port/db_name"
    JWT_SECRET="sua_chave_secreta_de_32_caracteres"
    
    # Configurações S3
    STORAGE_BUCKET="seu-bucket-s3"
    STORAGE_REGION="sua-regiao"
    STORAGE_ACCESS_KEY="sua-chave-de-acesso"
    STORAGE_SECRET_KEY="sua-chave-secreta"
    
    # Webhooks N8n
    N8N_LEAD_WEBHOOK_URL="https://seu.n8n.url/webhook/lead"
    VITE_N8N_CHAT_WEBHOOK_URL="https://seu.n8n.url/webhook/chat"
    
    # Porta de Exposição
    APP_PORT=8000
    ```

4.  **Finalizar o Deploy:**

    Após editar o `.env`, execute o script novamente. Ele irá:
    *   Instalar dependências.
    *   Criar o primeiro usuário administrador.
    *   Executar as migrações do banco de dados (Drizzle Kit).
    *   Construir e subir os containers Docker.

### Acesso Inicial

*   **URL:** `http://seu_ip_ou_dominio:8000`
*   **Usuário Admin Inicial:**
    *   **Email:** `admin@casadf.com.br`
    *   **Senha:** `secure_initial_password`
    
    **⚠️ ATENÇÃO:** Altere a senha imediatamente após o primeiro login!

## 🛠️ Desenvolvimento Local

Para rodar o projeto localmente, você precisará de Node.js (v22+) e pnpm.

1.  **Instalação:**
    ```bash
    pnpm install
    ```
2.  **Configuração:**
    Crie o arquivo `.env` e configure as variáveis.
3.  **Desenvolvimento:**
    ```bash
    pnpm run dev
    ```
    O frontend e o backend serão iniciados em modo de desenvolvimento.
4.  **Migrações:**
    ```bash
    pnpm run db:push
    ```
    (Requer que o `DATABASE_URL` esteja configurado e o banco de dados esteja acessível).
    
## 📝 Scripts Disponíveis

| Comando | Descrição |
| :--- | :--- |
| `pnpm dev` | Inicia o servidor de desenvolvimento (frontend + backend). |
| `pnpm build` | Compila o frontend e o backend para produção. |
| `pnpm start` | Inicia o servidor de produção (após o build). |
| `pnpm db:push` | Executa as migrações do Drizzle no banco de dados. |
| `pnpm db:studio` | Abre a interface visual do Drizzle Kit. |
| `pnpm test` | Executa os testes unitários. |

---

Desenvolvido com ❤️ por [Manus AI](https://manus.im)

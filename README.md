# 🏡 IMOBILIÁRIA-SAAS  
### Plataforma imobiliária completa, open-source, com IA + n8n + Chatwoot

Bem-vindo ao **Imobiliária-SaaS**, um sistema completo para imobiliárias, corretores e gestores que precisam de:

- Um site/vitrine moderno (estilo QuintoAndar)  
- CRM interno de fácil uso (pipeline, funil, tarefas, contatos)  
- Inteligência Artificial integrada em toda a jornada  
- Automação avançada usando n8n  
- Atendimento omnichannel via Chatwoot  
- Módulos de locação, carteira de imóveis e contratos  
- Gestão financeira (aluguéis, comissões, repasses)  

Este projeto segue arquitetura **100% open-source**, organizado em um **monorepo** para facilitar desenvolvimento e deploy.

---

## 📂 Estrutura do Monorepo

imobiliaria-saas/
│
├── frontend-public/ # Site público inspirado em Property Pulse
├── app-crm/ # CRM interno inspirado em Twenty CRM
├── backend-core/ # API principal (NestJS + Prisma + Postgres)
│
├── automations/ # Workflows n8n (JSON)
│ ├── lead_qualificacao.json
│ ├── matching.json
│ ├── followup.json
│ ├── contrato_automatico.json
│ └── repasse_aluguel.json
│
└── infra/
├── docker-compose.yml # Sobe todo ecossistema
├── traefik/ # Proxy reverso
└── env.example # Variáveis de ambiente

yaml
Copiar código

---

## 🚀 1. Como rodar em ambiente local (Docker)

Requisitos:
- Docker + Docker Compose  
- Git  

### Passos:

```bash
# 1. Clone o repositório
git clone https://github.com/SEU-USUARIO/imobiliaria-saas

cd imobiliaria-saas

# 2. Copie o arquivo de ambiente
cp infra/env.example .env

# 3. Suba todos os serviços
docker compose -f infra/docker-compose.yml up -d --build
Serviços após iniciar:

Serviço	URL
Site Público	http://localhost:3000
CRM Interno	http://localhost:4000
API Backend	http://localhost:3333
Chatwoot	http://localhost:3100
n8n	http://localhost:5678
Traefik	http://localhost:8080

🤖 2. Integração com IA (ChatGPT / Gemini)
A IA funciona como o “motor” do sistema:

Qualificação automática de leads

Matching inteligente de imóveis

Follow-up personalizado

Geração de contratos

Planejamento de campanhas

Auxílio na gestão financeira da carteira

Para ativar:

Crie uma API Key (OpenAI, Gemini ou outra LLM)

Edite seu .env:

ini
Copiar código
AI_PROVIDER=openai
AI_API_KEY=SUA_CHAVE_AQUI
ou

ini
Copiar código
AI_PROVIDER=google
AI_API_KEY=SUA_CHAVE_DO_GEMINI
💬 3. Integração com Chatwoot (WhatsApp / Webchat)
O Chatwoot recebe os leads (WhatsApp, site, Instagram, Facebook)

Configuração:

Acesse:

arduino
Copiar código
http://localhost:3100
Crie uma conta e um inbox

Vá em Settings > Automation > Webhooks
E adicione:

bash
Copiar código
https://seu-n8n-endpoint/webhook/chatwoot
No n8n, importe os workflows (em /automations)

🔄 4. Integração com n8n
Os workflows que fazem o sistema funcionar:

lead_qualificacao.json

matching.json

followup.json

contrato_automatico.json

repasse_aluguel.json

No n8n:

Vá em Import > From File

Importe cada JSON

Ative o workflow

📦 5. Desenvolvimento usando Codecs (ChatGPT)
Este repositório é otimizado para desenvolvimento via Codecs do ChatGPT.

Para ativar:
Abra o ChatGPT

Entre na aba Codecs

Conecte ao repositório imobiliaria-saas

Cole o prompt:

css
Copiar código
Quero expandir e atualizar o monorepo imobiliaria-saas.
Você é um engenheiro sênior e deve criar, editar e atualizar arquivos reais dentro deste repositório.
Siga a estrutura existente e mantenha padrões de código.
A partir daí, você pode pedir:

criar novas rotas

editar o frontend

gerar componentes

adicionar APIs

ajustar workflows

melhorar a arquitetura

📊 6. Roadmap do Projeto
Fase 1: Base do sistema, vitrine e CRM

Fase 2: IA para leads

Fase 3: IA para matching de imóveis

Fase 4: Contratos automáticos

Fase 5: Carteira de aluguel e repasses

Fase 6: Campanhas automáticas

Fase 7: Multi-tenant (SaaS)

🧱 7. Licença
Open-source (MIT)


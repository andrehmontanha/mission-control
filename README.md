# 🚀 Mission Control — Dashboard Multi-Equipe

Dashboard em tempo real com IA para acompanhamento de resultados de vendas por equipe, com rotação automática entre equipes, filtros dinâmicos, fórmulas personalizadas e notificações sonoras.

## Funcionalidades

- **Multi-equipe**: Configure até 6 equipes, cada uma com sua planilha Google Sheets
- **Fórmulas personalizadas**: Crie métricas com SUM, COUNT, AVG + condições IF/AND/OR
- **Filtro por data**: Selecione período de análise
- **Filtro por colunas**: Filtre por STATUS, VENDEDOR, PLANO, ORIGEM, etc.
- **Rotação automática**: Alterna entre equipes a cada 15 segundos
- **Notificação sonora**: Toca um som quando novas propostas são adicionadas
- **Auto-refresh**: Puxa dados do Google Sheets automaticamente a cada 60 segundos
- **Modo TV/Apresentação**: Fullscreen para monitor/TV na parede
- **Ranking de vendedores**: Com barra de progresso da meta individual
- **Meta da equipe**: Barra de progresso com glow ao atingir 100%
- **Gráficos**: Evolução mensal, por plano, por origem

## Deploy na Vercel (5 minutos)

### Pré-requisitos
- Conta no [GitHub](https://github.com)
- Conta na [Vercel](https://vercel.com) (gratuita)
- Node.js 18+ instalado localmente

### Passo 1: Crie o repositório no GitHub

```bash
# Navegue até a pasta do projeto
cd mission-control

# Inicialize o git
git init
git add .
git commit -m "Initial commit - Mission Control Dashboard"

# Crie um repo no GitHub e conecte
git remote add origin https://github.com/SEU_USUARIO/mission-control.git
git branch -M main
git push -u origin main
```

### Passo 2: Deploy na Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login com GitHub
2. Clique em **"Add New" → "Project"**
3. Selecione o repositório `mission-control`
4. Framework Preset: **Vite** (detectado automaticamente)
5. Clique **"Deploy"**
6. Aguarde ~1 minuto. Pronto! Sua URL será algo como `mission-control-abc.vercel.app`

### Passo 3: Configure as planilhas

1. Abra cada planilha Google Sheets
2. Vá em **Compartilhar → Geral → "Qualquer pessoa com o link"** → Leitor
3. No dashboard, cole a URL de cada planilha na tela de Setup

## Estrutura das Planilhas

O dashboard é otimizado para planilhas com estas colunas:

| Coluna | Descrição |
|--------|-----------|
| DATA INCLUSÃO | Data de entrada da proposta |
| VENDEDOR: | Nome do vendedor |
| NOME/RAZÃO SOCIAL: | Nome do cliente |
| N° VIDAS: | Quantidade de vidas/beneficiários |
| PLANO: | Tipo de plano vendido |
| VALOR: | Valor da proposta (R$) |
| VALOR ADM: | Valor administrativo |
| STATUS: | FINALIZADO / CANCELADO / etc. |
| ORIGEM: | Canal de origem da venda |

## Fórmulas Personalizadas

Na tela de Setup, você pode criar métricas como:

- **Total Finalizado** = `SUM(VALOR) ONDE STATUS = FINALIZADO`
- **Cancelados** = `SUM(VALOR) ONDE STATUS = CANCELADO`
- **Resultado Líquido** = `Total Finalizado - Cancelados`
- **Ticket Médio** = `AVG(VALOR) ONDE STATUS = FINALIZADO`

Operações suportadas: `+` (somar), `-` (subtrair), `×` (multiplicar), `÷` (dividir)
Condições: `Igual`, `Diferente`, `Contém`, `Não contém`, com lógica `AND` / `OR`

## Desenvolvimento Local

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`

## Tech Stack

- React 18 + Vite
- Recharts (gráficos)
- PapaParse (parsing CSV)
- Lucide React (ícones)
- Tailwind CSS
- Web Audio API (notificações sonoras)
- Google Sheets CSV API (dados em tempo real)

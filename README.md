# Oasis - Dashboard de Produtividade Gamificado

## Sobre o Projeto
O Oasis é uma aplicação web de produtividade baseada em conceitos de gamificação e elementos de RPG (Role-Playing Game), desenvolvida para auxiliar usuários no gerenciamento de suas tarefas diárias e no desenvolvimento de hábitos consistentes. Através de um ecossistema focado na experiência do usuário, a plataforma transforma a conclusão de obrigações cotidianas em conquistas de experiência (XP), evolução de nível dinâmico e manutenção de ofensivas de constância.

## Principais Funcionalidades
* **Dashboard de Foco:** Apresenta um cronômetro minimalista integrado para execução de períodos de foco com aviso sonoro nativo via Web Audio API ao término do tempo. Possui gerenciamento de missões diárias através de listas sanfonadas e suporte a reordenação de prioridades via arrastar e soltar (Drag and Drop).
* **Métricas Individuais por Dia:** Painel estatístico que calcula o tempo total de foco dedicado e a quantidade de missões concluídas individualmente para a data selecionada.
* **Visão Mensal (Calendário):** Grade interativa de 42 posições que exibe o histórico de consistência mensal, marcações visuais de status das tarefas e interface para agendamento rápido de missões em datas futuras ou passadas.
* **Sistema de Nível Dinâmico:** Algoritmo baseado em progressão aritmética que calcula em tempo real o nível do usuário e o progresso da barra de experiência a partir do XP acumulado, sem sobrecarregar o armazenamento do banco de dados.
* **Mural de Constância (Ranking Global):** Classificação geral que lista os usuários da plataforma de acordo com seus respectivos dias de ofensiva ativa, estimulando a regularidade no uso do sistema.
* **Notificações Customizadas (Toasts):** Sistema de avisos dinâmicos e assíncronos renderizados na interface para validações de formulários e confirmações de ações sem interrupção do fluxo de navegação.

## Tecnologias Utilizadas
* **React.js:** Biblioteca principal para construção da interface declarativa baseada em componentes.
* **React Router DOM:** Gerenciamento de rotas e navegação interna da aplicação.
* **Lucide React:** Conjunto de ícones vetoriais padronizados.
* **Axios:** Cliente HTTP para comunicação e requisições assíncronas junto à API do servidor.
* **Web Audio API:** API nativa do navegador utilizada para sintetizar frequências sonoras via código para o alarme de foco.

## Pré-requisitos
Antes de iniciar a instalação, certifique-se de ter as seguintes ferramentas configuradas em seu ambiente local:
* Node.js (versão 18.0.0 ou superior)
* Gerenciador de pacotes NPM (instalado nativamente junto com o Node)
* API do Backend em execução

## Como Rodar a Aplicação
Siga as instruções abaixo para instalar as dependências e iniciar o servidor de desenvolvimento:

**Instalar as Dependências:**
Navegue até a pasta do backend e instale os pacotes necessários. Depois, repita o processo na pasta do frontend:
```
# No terminal do Backend:
cd nome-da-pasta-backend
npm install

# No terminal do Frontend:
cd nome-da-pasta-frontend
npm install
```

**Configurar o Serviço de API:**
Abra o arquivo localizado em `src/services/api.js` e verifique se a URL base corresponde ao endereço correto do seu servidor local ou de produção:
```javascript
import axios from 'axios';
const api = axios.create({
  baseURL: 'http://localhost:3333' // Altere para a porta correspondente ao seu backend
});
export default api;
```

**Executar em Modo de Desenvolvimento:**
Com as dependências instaladas em ambas as pastas, inicie o servidor local em cada um dos terminais:
```
# No terminal do Backend:
npm run dev

# No terminal do Frontend:
npm run dev
```

A aplicação estará disponível para acesso através do endereço fornecido no terminal.

## Script de Criação do Banco de Dados (SQL)
Copie ou baixe o arquivo .sql do site no seu gerenciador de banco de dados (como MySQL Workbench, phpMyAdmin ou via terminal) para criar o esquema e as tabelas necessárias.

## Dados de Teste (Opcional)
Caso queira testar o funcionamento do Dashboard, do Calendário e do Ranking imediatamente com dados fictícios, você pode inserir alguns registros iniciais.

## Como Configurar no Backend (Node.js)
Para que o seu servidor backend se conecte a este banco de dados, certifique-se de configurar as variáveis de ambiente no arquivo `.env` do seu projeto Node.js:

```env
DB_HOST=localhost
DB_USER=seu_usuario_mysql
DB_PASS=sua_senha_mysql
DB_NAME=oasis_db
PORT=3333
```

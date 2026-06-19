-- 1. Apaga o banco antigo (se existir) e cria um novo limpo
DROP DATABASE IF EXISTS oasis_db;
CREATE DATABASE oasis_db;
USE oasis_db;

-- 2. Cria a Tabela de Usuários (Agora com a coluna ofensiva)
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    xp_total INT DEFAULT 0,
    nivel INT DEFAULT 1,
    ofensiva INT DEFAULT 0, 
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Cria a Tabela de Tarefas (Prioridade virou 'ordem')
CREATE TABLE tarefas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    nome VARCHAR(255) NOT NULL,
    tempo_estimado INT NOT NULL,
    ordem INT DEFAULT 0, 
    data_agendada DATE DEFAULT NULL,
    concluida BOOLEAN DEFAULT FALSE,
    xp_ganho INT DEFAULT 0,
    data_conclusao DATE DEFAULT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 4. Inserção dos usuários para validação do Login (Já com dias de ofensiva para testar o Ranking)
INSERT INTO usuarios (nome, email, senha, xp_total, nivel, ofensiva) VALUES 
('Emmanuel', 'emmanuel@gmail.com', '123', 950, 1, 8),
('Gabriel', 'gabriel@oasis.com', '123', 2750, 2, 15),
('Lucas Mendes', 'lucas@gmail.com', '123', 5000, 4, 21),
('Maria Souza', 'maria@gmail.com', '123', 3200, 3, 12);
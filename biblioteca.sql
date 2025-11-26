CREATE DATABASE bibliotecaad;
USE bibliotecaad;

CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    matricula VARCHAR(9) NOT NULL,
    email VARCHAR(100) NOT NULL,
    telefone VARCHAR(100) NOT NULL,
    tipo ENUM('CLIENTE', 'FUNCIONARIO') NOT NULL DEFAULT 'CLIENTE'
);

CREATE TABLE livro (
    id_livro INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    autor VARCHAR(100) NOT NULL,
    ano_publicacao VARCHAR(4) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    isbn VARCHAR(50),
    disponivel BOOLEAN DEFAULT TRUE
);

CREATE TABLE emprestimo (
    id_emprestimo INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_livro INT NOT NULL,
    data_retirada DATE NOT NULL,
    data_prevista_devolucao DATE NOT NULL,
    data_devolucao DATE,
    id_multa INT,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
    FOREIGN KEY (id_livro) REFERENCES livro(id_livro)
);

CREATE TABLE multas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_emprestimo INT NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    forma_pagamento VARCHAR(50) NULL,
    pago BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (id_emprestimo) REFERENCES emprestimo(id_emprestimo)
);
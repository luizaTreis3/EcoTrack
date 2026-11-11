ALTER TABLE relatos
ADD COLUMN status ENUM('Pendente', 'Em análise', 'Resolvido')
NOT NULL DEFAULT 'Pendente';

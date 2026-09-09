const express = require("express");
const cors = require("cors");
const db = require("./dbconfig");
const bcrypt = require("bcrypt");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


app.post("/usuarios", async (req, res) => {
    const {
        nome_completo,
        email,
        cep,
        endereco,
        telefone,
        cpf,
        senha,
        aceitou_termos,
        deseja_notificacoes
    } = req.body;

    if (
        !nome_completo ||
        !email ||
        !cep ||
        !telefone ||
        !cpf ||
        !senha
    ) {
        return res.status(400).json({
            mensagem: "Preencha todos os campos obrigatórios."
        });
    }

    try {
        const senhaHash = await bcrypt.hash(senha, 10);

        const sql = `
            INSERT INTO usuarios
            (
                nome_completo,
                email,
                cep,
                endereco,
                telefone,
                cpf,
                senha,
                aceitou_termos,
                deseja_notificacoes
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const valores = [
            nome_completo,
            email,
            cep,
            endereco,
            telefone,
            cpf,
            senhaHash,
            aceitou_termos,
            deseja_notificacoes
        ];

        db.query(sql, valores, (err, result) => {
            if (err) {
                console.error("Erro ao cadastrar usuário:", err);

                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(400).json({
                        mensagem: "E-mail ou CPF já cadastrado."
                    });
                }

                return res.status(500).json({
                    mensagem: "Erro ao cadastrar usuário."
                });
            }

            res.status(201).json({
                mensagem: "Usuário cadastrado com sucesso!",
                id_usuario: result.insertId
            });
        });

    } catch (error) {
        console.error("Erro ao gerar hash da senha:", error);

        res.status(500).json({
            mensagem: "Erro interno do servidor."
        });
    }
});


app.post("/login", async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({
            mensagem: "Informe o e-mail e a senha."
        });
    }

    const sql = "SELECT * FROM usuarios WHERE email = ?";

    db.query(sql, [email], async (err, results) => {
        if (err) {
            console.error("Erro ao realizar login:", err);

            return res.status(500).json({
                mensagem: "Erro interno do servidor."
            });
        }

        if (results.length === 0) {
            return res.status(401).json({
                mensagem: "E-mail ou senha inválidos."
            });
        }

        const usuario = results[0];

        try {
            const senhaValida = await bcrypt.compare(
                senha,
                usuario.senha
            );

            if (!senhaValida) {
                return res.status(401).json({
                    mensagem: "E-mail ou senha inválidos."
                });
            }

            res.status(200).json({
                mensagem: "Login realizado com sucesso!",
                usuario: {
                    id_usuario: usuario.id_usuario,
                    nome_completo: usuario.nome_completo,
                    email: usuario.email
                }
            });

        } catch (error) {
            console.error("Erro ao comparar senha:", error);

            res.status(500).json({
                mensagem: "Erro interno do servidor."
            });
        }
    });
});


app.get("/usuarios/:id", (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT
            id_usuario,
            nome_completo,
            email,
            cep,
            endereco,
            telefone,
            cpf,
            aceitou_termos,
            deseja_notificacoes,
            data_cadastro
        FROM usuarios
        WHERE id_usuario = ?
    `;

    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error("Erro ao buscar usuário:", err);

            return res.status(500).json({
                mensagem: "Erro interno do servidor."
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                mensagem: "Usuário não encontrado."
            });
        }

        res.status(200).json({
            usuario: results[0]
        });
    });
});


app.put("/usuarios/:id", (req, res) => {
    const { id } = req.params;

    const {
        nome_completo,
        email,
        cep,
        endereco,
        telefone,
        cpf,
        aceitou_termos,
        deseja_notificacoes
    } = req.body;

    if (
        !nome_completo ||
        !email ||
        !cep ||
        !telefone ||
        !cpf
    ) {
        return res.status(400).json({
            mensagem: "Preencha todos os campos obrigatórios."
        });
    }

    const sql = `
        UPDATE usuarios
        SET
            nome_completo = ?,
            email = ?,
            cep = ?,
            endereco = ?,
            telefone = ?,
            cpf = ?,
            aceitou_termos = ?,
            deseja_notificacoes = ?
        WHERE id_usuario = ?
    `;

    const valores = [
        nome_completo,
        email,
        cep,
        endereco,
        telefone,
        cpf,
        aceitou_termos,
        deseja_notificacoes,
        id
    ];

    db.query(sql, valores, (err, result) => {
        if (err) {
            console.error("Erro ao atualizar usuário:", err);

            if (err.code === "ER_DUP_ENTRY") {
                return res.status(400).json({
                    mensagem: "E-mail ou CPF já cadastrado."
                });
            }

            return res.status(500).json({
                mensagem: "Erro ao atualizar usuário."
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                mensagem: "Usuário não encontrado."
            });
        }

        res.status(200).json({
            mensagem: "Usuário atualizado com sucesso!"
        });
    });
});


app.delete("/usuarios/:id", (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM usuarios WHERE id_usuario = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Erro ao excluir usuário:", err);

            return res.status(500).json({
                mensagem: "Erro ao excluir usuário."
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                mensagem: "Usuário não encontrado."
            });
        }

        res.status(200).json({
            mensagem: "Usuário excluído com sucesso!"
        });
    });
});

app.get("/notificacoes/:id_usuario", (req, res) => {
    const { id_usuario } = req.params;

    const sql = `
        SELECT
            id_notificacao,
            id_usuario,
            titulo,
            mensagem,
            lida,
            data_notificacao
        FROM notificacoes
        WHERE id_usuario = ?
        ORDER BY data_notificacao DESC
    `;

    db.query(sql, [id_usuario], (err, results) => {
        if (err) {
            console.error("Erro ao buscar notificações:", err);

            return res.status(500).json({
                mensagem: "Erro ao buscar notificações."
            });
        }

        res.status(200).json({
            notificacoes: results
        });
    });
});


app.put("/notificacoes/:id/ler", (req, res) => {
    const { id } = req.params;

    const sql = `
        UPDATE notificacoes
        SET lida = TRUE
        WHERE id_notificacao = ?
    `;

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Erro ao marcar notificação como lida:", err);

            return res.status(500).json({
                mensagem: "Erro ao marcar notificação como lida."
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                mensagem: "Notificação não encontrada."
            });
        }

        res.status(200).json({
            mensagem: "Notificação marcada como lida!"
        });
    });
});

app.get("/pontos-coleta", (req, res) => {
    const sql = `
        SELECT
            id_ponto,
            nome,
            endereco,
            cep,
            latitude,
            longitude,
            tipo_residuo,
            descricao,
            horario_funcionamento,
            telefone
        FROM pontos_coleta
        ORDER BY nome
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Erro ao buscar pontos de coleta:", err);

            return res.status(500).json({
                mensagem: "Erro ao buscar pontos de coleta."
            });
        }

        res.status(200).json({
            pontos: results
        });
    });
});


app.get("/pontos-coleta/:id", (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT
            id_ponto,
            nome,
            endereco,
            cep,
            latitude,
            longitude,
            tipo_residuo,
            descricao,
            horario_funcionamento,
            telefone
        FROM pontos_coleta
        WHERE id_ponto = ?
    `;

    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error("Erro ao buscar ponto de coleta:", err);

            return res.status(500).json({
                mensagem: "Erro ao buscar ponto de coleta."
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                mensagem: "Ponto de coleta não encontrado."
            });
        }

        res.status(200).json({
            ponto: results[0]
        });
    });
});


app.post("/pontos-coleta", (req, res) => {
    const {
        nome,
        endereco,
        cep,
        latitude,
        longitude,
        tipo_residuo,
        descricao,
        horario_funcionamento,
        telefone
    } = req.body;

    if (!nome || !endereco || !tipo_residuo) {
        return res.status(400).json({
            mensagem: "Preencha os campos obrigatórios: nome, endereço e tipo de resíduo."
        });
    }

    const sql = `
        INSERT INTO pontos_coleta
        (
            nome,
            endereco,
            cep,
            latitude,
            longitude,
            tipo_residuo,
            descricao,
            horario_funcionamento,
            telefone
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const valores = [
        nome,
        endereco,
        cep,
        latitude,
        longitude,
        tipo_residuo,
        descricao,
        horario_funcionamento,
        telefone
    ];

    db.query(sql, valores, (err, result) => {
        if (err) {
            console.error("Erro ao cadastrar ponto de coleta:", err);

            return res.status(500).json({
                mensagem: "Erro ao cadastrar ponto de coleta."
            });
        }

        res.status(201).json({
            mensagem: "Ponto de coleta cadastrado com sucesso!",
            id_ponto: result.insertId
        });
    });
});


app.put("/pontos-coleta/:id", (req, res) => {
    const { id } = req.params;

    const {
        nome,
        endereco,
        cep,
        latitude,
        longitude,
        tipo_residuo,
        descricao,
        horario_funcionamento,
        telefone
    } = req.body;

    if (!nome || !endereco || !tipo_residuo) {
        return res.status(400).json({
            mensagem: "Preencha os campos obrigatórios: nome, endereço e tipo de resíduo."
        });
    }

    const sql = `
        UPDATE pontos_coleta
        SET
            nome = ?,
            endereco = ?,
            cep = ?,
            latitude = ?,
            longitude = ?,
            tipo_residuo = ?,
            descricao = ?,
            horario_funcionamento = ?,
            telefone = ?
        WHERE id_ponto = ?
    `;

    const valores = [
        nome,
        endereco,
        cep,
        latitude,
        longitude,
        tipo_residuo,
        descricao,
        horario_funcionamento,
        telefone,
        id
    ];

    db.query(sql, valores, (err, result) => {
        if (err) {
            console.error("Erro ao atualizar ponto de coleta:", err);

            return res.status(500).json({
                mensagem: "Erro ao atualizar ponto de coleta."
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                mensagem: "Ponto de coleta não encontrado."
            });
        }

        res.status(200).json({
            mensagem: "Ponto de coleta atualizado com sucesso!"
        });
    });
});


app.delete("/pontos-coleta/:id", (req, res) => {
    const { id } = req.params;

    const sql = `
        DELETE FROM pontos_coleta
        WHERE id_ponto = ?
    `;

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Erro ao excluir ponto de coleta:", err);

            return res.status(500).json({
                mensagem: "Erro ao excluir ponto de coleta."
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                mensagem: "Ponto de coleta não encontrado."
            });
        }

        res.status(200).json({
            mensagem: "Ponto de coleta excluído com sucesso!"
        });
    });
});

// BUSCAR TODOS OS RELATOS
app.get("/relatos", (req, res) => {
    const sql = `
        SELECT
            id_relato,
            id_usuario,
            titulo,
            bairro,
            endereco,
            categoria,
            descricao,
            imagem,
            atualizar_status,
            data_criacao
        FROM relatos
        ORDER BY data_criacao DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Erro ao buscar relatos:", err);

            return res.status(500).json({
                mensagem: "Erro ao buscar relatos."
            });
        }

        res.status(200).json({
            relatos: results
        });
    });
});


// BUSCAR UM RELATO
app.get("/relatos/:id", (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT
            id_relato,
            id_usuario,
            titulo,
            bairro,
            endereco,
            categoria,
            descricao,
            imagem,
            atualizar_status,
            data_criacao
        FROM relatos
        WHERE id_relato = ?
    `;

    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error("Erro ao buscar relato:", err);

            return res.status(500).json({
                mensagem: "Erro ao buscar relato."
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                mensagem: "Relato não encontrado."
            });
        }

        res.status(200).json({
            relato: results[0]
        });
    });
});

app.post("/relatos", (req, res) => {
    const {
        id_usuario,
        titulo,
        bairro,
        endereco,
        categoria,
        descricao,
        imagem,
        atualizar_status
    } = req.body;

    // Verifica o ID do usuário
    if (!id_usuario) {
        return res.status(400).json({
            mensagem: "Usuário não identificado."
        });
    }

    // Verifica os campos obrigatórios
    if (!titulo || !bairro || !endereco || !categoria || !descricao) {
        return res.status(400).json({
            mensagem: "Preencha os campos obrigatórios: título, bairro, endereço, categoria e descrição."
        });
    }

    const sql = `
        INSERT INTO relatos
        (
            id_usuario,
            titulo,
            bairro,
            endereco,
            categoria,
            descricao,
            imagem,
            atualizar_status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const valores = [
        id_usuario,
        titulo,
        bairro,
        endereco,
        categoria,
        descricao,
        imagem || null,
        atualizar_status || false
    ];

    db.query(sql, valores, (err, result) => {
        if (err) {
            console.error("Erro ao cadastrar relato:", err);

            // Usuário não existe na tabela usuarios
            if (err.code === "ER_NO_REFERENCED_ROW_2") {
                return res.status(400).json({
                    mensagem: "O usuário informado não existe."
                });
            }

            return res.status(500).json({
                mensagem: "Erro ao cadastrar relato."
            });
        }

        res.status(201).json({
            mensagem: "Relato cadastrado com sucesso!",
            id_relato: result.insertId,
            id_usuario: id_usuario
        });
    });
});

app.put("/relatos/:id", (req, res) => {
    const { id } = req.params;

    const {
        titulo,
        bairro,
        endereco,
        categoria,
        descricao,
        imagem,
        atualizar_status
    } = req.body;

    if (!titulo || !bairro || !endereco || !categoria || !descricao) {
        return res.status(400).json({
            mensagem: "Preencha os campos obrigatórios: título, bairro, endereço, categoria e descrição."
        });
    }

    const sql = `
        UPDATE relatos
        SET
            titulo = ?,
            bairro = ?,
            endereco = ?,
            categoria = ?,
            descricao = ?,
            imagem = ?,
            atualizar_status = ?
        WHERE id_relato = ?
    `;

    const valores = [
        titulo,
        bairro,
        endereco,
        categoria,
        descricao,
        imagem || null,
        atualizar_status || false,
        id
    ];

    db.query(sql, valores, (err, result) => {
        if (err) {
            console.error("Erro ao atualizar relato:", err);

            return res.status(500).json({
                mensagem: "Erro ao atualizar relato."
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                mensagem: "Relato não encontrado."
            });
        }

        res.status(200).json({
            mensagem: "Relato atualizado com sucesso!"
        });
    });
});

app.delete("/relatos/:id", (req, res) => {
    const { id } = req.params;

    const sql = `
        DELETE FROM relatos
        WHERE id_relato = ?
    `;

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Erro ao excluir relato:", err);

            return res.status(500).json({
                mensagem: "Erro ao excluir relato."
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                mensagem: "Relato não encontrado."
            });
        }

        res.status(200).json({
            mensagem: "Relato excluído com sucesso!"
        });
    });
});

app.listen(port, () => {
    console.log(`Servidor backend executando na porta ${port}`);
});
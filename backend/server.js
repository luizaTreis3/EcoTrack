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

    // Verifica se os campos foram preenchidos
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

        // Usuário não encontrado
        if (results.length === 0) {
            return res.status(401).json({
                mensagem: "E-mail ou senha inválidos."
            });
        }

        const usuario = results[0];

        try {
            // Compara a senha digitada com o hash salvo no banco
            const senhaValida = await bcrypt.compare(
                senha,
                usuario.senha
            );

            if (!senhaValida) {
                return res.status(401).json({
                    mensagem: "E-mail ou senha inválidos."
                });
            }

            // Login realizado
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

app.listen(port, () => {
    console.log(`Servidor backend executando na porta ${port}`);
});
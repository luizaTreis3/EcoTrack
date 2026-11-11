const express = require("express");
const cors = require("cors");
const db = require("./dbconfig");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();
const port = process.env.PORT || 3000;
const uploadsDirectory = path.join(__dirname, "uploads");
const imageExtensions = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/heic": "heic",
    "image/heif": "heif"
};

fs.mkdirSync(uploadsDirectory, { recursive: true });

const imageUpload = multer({
    storage: multer.diskStorage({
        destination: uploadsDirectory,
        filename: (req, file, callback) => {
            callback(
                null,
                `${crypto.randomUUID()}.${imageExtensions[file.mimetype]}`
            );
        }
    }),
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1,
        fields: 12,
        parts: 13,
        fieldSize: 16 * 1024
    },
    fileFilter: (req, file, callback) => {
        if (!Object.prototype.hasOwnProperty.call(imageExtensions, file.mimetype)) {
            return callback(new Error("Use uma imagem em formato compatível."));
        }

        return callback(null, true);
    }
});

function isValidImageSignature(buffer, mimeType) {
    if (mimeType === "image/jpeg") {
        return buffer.length >= 3
            && buffer[0] === 0xff
            && buffer[1] === 0xd8
            && buffer[2] === 0xff;
    }

    if (mimeType === "image/png") {
        return buffer.length >= 8
            && buffer.subarray(0, 8).equals(Buffer.from("89504e470d0a1a0a", "hex"));
    }

    if (mimeType === "image/webp") {
        return buffer.length >= 12
            && buffer.toString("ascii", 0, 4) === "RIFF"
            && buffer.toString("ascii", 8, 12) === "WEBP";
    }

    if (mimeType === "image/gif") {
        const signature = buffer.toString("ascii", 0, 6);
        return signature === "GIF87a" || signature === "GIF89a";
    }

    if (mimeType === "image/heic" || mimeType === "image/heif") {
        const brand = buffer.toString("ascii", 8, 12);
        return buffer.length >= 12
            && buffer.toString("ascii", 4, 8) === "ftyp"
            && ["heic", "heix", "hevc", "hevx", "mif1", "msf1"].includes(brand);
    }

    return false;
}

function removeUploadedFile(file, callback) {
    if (!file?.path) {
        callback();
        return;
    }

    fs.unlink(file.path, (error) => {
        if (error && error.code !== "ENOENT") {
            console.error("Erro ao remover arquivo enviado:", error);
        }
        callback();
    });
}

function removeStoredImage(imagePath) {
    if (typeof imagePath !== "string" || !imagePath.startsWith("/uploads/")) {
        return;
    }

    const fileName = imagePath.slice("/uploads/".length);
    if (!fileName || path.basename(fileName) !== fileName) {
        return;
    }

    fs.unlink(path.join(uploadsDirectory, fileName), (error) => {
        if (error && error.code !== "ENOENT") {
            console.error("Erro ao remover imagem armazenada:", error);
        }
    });
}

function receiveImage(req, res, next) {
    imageUpload.single("imagem")(req, res, (error) => {
        if (error) {
            const tamanhoExcedido =
                error instanceof multer.MulterError
                && error.code === "LIMIT_FILE_SIZE";
            console.error("Erro ao receber imagem:", error);
            return res.status(tamanhoExcedido ? 413 : 400).json({
                mensagem: tamanhoExcedido
                    ? "A imagem deve ter no máximo 5 MB."
                    : error.message || "Não foi possível receber a imagem."
            });
        }

        if (!req.file) {
            return next();
        }

        fs.readFile(req.file.path, (readError, contents) => {
            if (readError) {
                console.error("Erro ao validar imagem enviada:", readError);
                return removeUploadedFile(req.file, () => res.status(500).json({
                    mensagem: "Não foi possível validar a imagem."
                }));
            }

            if (!isValidImageSignature(contents, req.file.mimetype)) {
                return removeUploadedFile(req.file, () => res.status(400).json({
                    mensagem: "O arquivo enviado não é uma imagem válida."
                }));
            }

            return next();
        });
    });
}

app.use(cors());
app.use(express.json()); 
app.use("/uploads", express.static(uploadsDirectory, {
    setHeaders: (res) => {
        res.setHeader("X-Content-Type-Options", "nosniff");
    }
}));

app.post("/usuarios", async (req, res) => {
    const {
        firebase_uid,
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
        !firebase_uid ||
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
            INSERT INTO usuarios (
                firebase_uid,
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
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const valores = [
            firebase_uid,
            nome_completo,
            email,
            cep,
            endereco || null,
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
                        mensagem: "E-mail, CPF ou conta já cadastrada."
                    });
                }

                return res.status(500).json({
                    mensagem: "Erro ao cadastrar usuário."
                });
            }

            return res.status(201).json({
                mensagem: "Usuário cadastrado com sucesso!",
                id_usuario: result.insertId
            });
        });

    } catch (error) {
        console.error("Erro ao gerar hash da senha:", error);

        return res.status(500).json({
            mensagem: "Erro interno do servidor."
        });
    }
});

app.get("/usuarios/firebase/:uid", (req, res) => {
    const { uid } = req.params;

    const sql = `
        SELECT
            id_usuario,
            firebase_uid,
            nome_completo,
            email,
            cep,
            endereco,
            telefone,
            cpf,
            imagem_perfil,
            aceitou_termos,
            deseja_notificacoes,
            data_cadastro
        FROM usuarios
        WHERE firebase_uid = ?
    `;

    db.query(sql, [uid], (err, results) => {
        if (err) {
            console.error("Erro ao buscar usuário:", err);
            return res.status(500).json({
                mensagem: "Erro ao buscar usuário."
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                mensagem: "Usuário não encontrado."
            });
        }

        return res.status(200).json({
            usuario: results[0]
        });
    });
});


// ATUALIZAR DADOS DO USUÁRIO PELO UID DO FIREBASE
app.put("/usuarios/firebase/:uid", receiveImage, (req, res) => {
    const { uid } = req.params;

    const {
        nome_completo,
        cep,
        endereco,
        telefone,
        cpf,
        aceitou_termos,
        deseja_notificacoes
    } = req.body;

    if (!nome_completo || !cep || !telefone || !cpf) {
        return removeUploadedFile(req.file, () => res.status(400).json({
            mensagem: "Preencha todos os campos obrigatórios."
        }));
    }

    const imagemPerfil = req.file
        ? `/uploads/${req.file.filename}`
        : null;

    const sql = `
        UPDATE usuarios
        SET
            nome_completo = ?,
            cep = ?,
            endereco = ?,
            telefone = ?,
            cpf = ?,
            imagem_perfil = COALESCE(?, imagem_perfil),
            aceitou_termos = ?,
            deseja_notificacoes = ?
        WHERE firebase_uid = ?
    `;

    const valores = [
        nome_completo,
        cep,
        endereco || null,
        telefone,
        cpf,
        imagemPerfil,
        aceitou_termos,
        deseja_notificacoes,
        uid
    ];

    db.query(
        "SELECT imagem_perfil FROM usuarios WHERE firebase_uid = ?",
        [uid],
        (lookupErr, users) => {
            if (lookupErr) {
                console.error("Erro ao buscar usuário antes de atualizar:", lookupErr);
                return removeUploadedFile(req.file, () => res.status(500).json({
                    mensagem: "Erro ao atualizar usuário."
                }));
            }

            if (users.length === 0) {
                return removeUploadedFile(req.file, () => res.status(404).json({
                    mensagem: "Usuário não encontrado."
                }));
            }

            db.query(sql, valores, (err, result) => {
                if (err) {
                    console.error("Erro ao atualizar usuário:", err);

                    if (err.code === "ER_DUP_ENTRY") {
                        return removeUploadedFile(req.file, () => res.status(400).json({
                            mensagem: "Este CPF já está cadastrado."
                        }));
                    }

                    return removeUploadedFile(req.file, () => res.status(500).json({
                        mensagem: "Erro ao atualizar usuário."
                    }));
                }

                if (result.affectedRows === 0) {
                    return removeUploadedFile(req.file, () => res.status(404).json({
                        mensagem: "Usuário não encontrado."
                    }));
                }

                const imagemAnterior = users[0].imagem_perfil;
                if (imagemPerfil && imagemAnterior !== imagemPerfil) {
                    removeStoredImage(imagemAnterior);
                }

                return res.status(200).json({
                    mensagem: "Dados atualizados com sucesso!",
                    imagem_perfil: imagemPerfil || imagemAnterior || null
                });
            });
        }
    );
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

app.get("/usuarios/:id/relatos", (req, res) => {
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
            status,
            data_criacao
        FROM relatos
        WHERE id_usuario = ?
        ORDER BY data_criacao DESC
    `;

    const atualizarStatusSql = `
        UPDATE relatos
        SET status = 'Em análise'
        WHERE id_usuario = ?
            AND status = 'Pendente'
            AND data_criacao <= DATE_SUB(NOW(), INTERVAL 3 DAY)
    `;

    db.query(atualizarStatusSql, [id], (statusErr) => {
        if (statusErr) {
            console.error("Erro ao atualizar status dos relatos do usuário:", statusErr);
            return res.status(500).json({
                mensagem: "Erro ao atualizar o status dos relatos."
            });
        }

        db.query(sql, [id], (err, results) => {
            if (err) {
                console.error("Erro ao buscar relatos do usuário:", err);
                return res.status(500).json({
                    mensagem: "Erro ao buscar seus relatos."
                });
            }

            return res.status(200).json({
                relatos: results
            });
        });
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
        cep,
        endereco,
        telefone,
        cpf,
        aceitou_termos,
        deseja_notificacoes
    } = req.body;

    if (Object.prototype.hasOwnProperty.call(req.body, "email")) {
        return res.status(400).json({
            mensagem: "Altere o e-mail pelo fluxo de confirmação do Firebase."
        });
    }

    if (
        !nome_completo ||
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
                    mensagem: "CPF já cadastrado."
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
            status,
            data_criacao
        FROM relatos
        ORDER BY data_criacao DESC
    `;

    const atualizarStatusSql = `
        UPDATE relatos
        SET status = 'Em análise'
        WHERE status = 'Pendente'
            AND data_criacao <= DATE_SUB(NOW(), INTERVAL 3 DAY)
    `;

    db.query(atualizarStatusSql, (statusErr) => {
        if (statusErr) {
            console.error("Erro ao atualizar status dos relatos:", statusErr);
            return res.status(500).json({
                mensagem: "Erro ao atualizar o status dos relatos."
            });
        }

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
            status,
            data_criacao
        FROM relatos
        WHERE id_relato = ?
    `;

    const atualizarStatusSql = `
        UPDATE relatos
        SET status = 'Em análise'
        WHERE id_relato = ?
            AND status = 'Pendente'
            AND data_criacao <= DATE_SUB(NOW(), INTERVAL 3 DAY)
    `;

    db.query(atualizarStatusSql, [id], (statusErr) => {
        if (statusErr) {
            console.error("Erro ao atualizar status do relato:", statusErr);
            return res.status(500).json({
                mensagem: "Erro ao atualizar o status do relato."
            });
        }

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
});

app.post("/relatos", receiveImage, (req, res) => {
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
        return removeUploadedFile(req.file, () => res.status(400).json({
            mensagem: "Usuário não identificado."
        }));
    }

    // Verifica os campos obrigatórios
    if (!titulo || !bairro || !endereco || !categoria || !descricao) {
        return removeUploadedFile(req.file, () => res.status(400).json({
            mensagem: "Preencha os campos obrigatórios: título, bairro, endereço, categoria e descrição."
        }));
    }

    const imagemRelato = req.file
        ? `/uploads/${req.file.filename}`
        : imagem || null;

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
            atualizar_status,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pendente')
    `;

    const valores = [
        id_usuario,
        titulo,
        bairro,
        endereco,
        categoria,
        descricao,
        imagemRelato,
        atualizar_status || false
    ];

    db.query(sql, valores, (err, result) => {
        if (err) {
            console.error("Erro ao cadastrar relato:", err);

            // Usuário não existe na tabela usuarios
            if (err.code === "ER_NO_REFERENCED_ROW_2") {
                return removeUploadedFile(req.file, () => res.status(400).json({
                    mensagem: "O usuário informado não existe."
                }));
            }

            return removeUploadedFile(req.file, () => res.status(500).json({
                mensagem: "Erro ao cadastrar relato."
            }));
        }

        res.status(201).json({
            mensagem: "Relato cadastrado com sucesso!",
            id_relato: result.insertId,
            id_usuario: id_usuario,
            imagem: imagemRelato,
            status: "Pendente"
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

    db.query(
        "SELECT imagem FROM relatos WHERE id_relato = ?",
        [id],
        (lookupErr, relatos) => {
            if (lookupErr) {
                console.error("Erro ao buscar imagem do relato:", lookupErr);
                return res.status(500).json({
                    mensagem: "Erro ao excluir relato."
                });
            }

            if (relatos.length === 0) {
                return res.status(404).json({
                    mensagem: "Relato não encontrado."
                });
            }

            db.query(
                "DELETE FROM relatos WHERE id_relato = ?",
                [id],
                (err, result) => {
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

                    removeStoredImage(relatos[0].imagem);
                    return res.status(200).json({
                        mensagem: "Relato excluído com sucesso!"
                    });
                }
            );
        }
    );
});

app.listen(port, () => {
    console.log(`Servidor backend executando na porta ${port}`);
});
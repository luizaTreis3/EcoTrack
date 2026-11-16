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
let processandoFilaPush = false;
const imageExtensions = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/heic": "heic",
    "image/heif": "heif"
};

function parseReportCoordinates(latitudeValue, longitudeValue) {
    const latitudeInformada = latitudeValue !== undefined
        && latitudeValue !== null
        && String(latitudeValue).trim() !== "";
    const longitudeInformada = longitudeValue !== undefined
        && longitudeValue !== null
        && String(longitudeValue).trim() !== "";

    if (!latitudeInformada && !longitudeInformada) {
        return { latitude: null, longitude: null };
    }

    if (!latitudeInformada || !longitudeInformada) {
        return { erro: "Informe latitude e longitude juntas." };
    }

    const latitude = Number(String(latitudeValue).replace(",", "."));
    const longitude = Number(String(longitudeValue).replace(",", "."));

    if (
        !Number.isFinite(latitude)
        || !Number.isFinite(longitude)
        || latitude < -90
        || latitude > 90
        || longitude < -180
        || longitude > 180
    ) {
        return { erro: "As coordenadas informadas são inválidas." };
    }

    return { latitude, longitude };
}

function queryAsync(sql, valores = []) {
    return new Promise((resolve, reject) => {
        db.query(sql, valores, (err, results) => {
            if (err) {
                reject(err);
                return;
            }

            resolve(results);
        });
    });
}

async function enviarNotificacoesPushPendentes() {
    if (processandoFilaPush) {
        return;
    }

    processandoFilaPush = true;

    try {
        await queryAsync(
            `UPDATE notificacoes_push
             SET estado = 'pendente', data_processamento = NULL
             WHERE estado = 'processando'
                AND data_processamento <= DATE_SUB(NOW(), INTERVAL 5 MINUTE)`
        );

        const pendentes = await queryAsync(`
            SELECT
                fila.id_notificacao,
                fila.tentativas,
                notificacao.id_usuario
            FROM notificacoes_push fila
            JOIN notificacoes notificacao
                ON notificacao.id_notificacao = fila.id_notificacao
            WHERE fila.estado = 'pendente'
                AND (
                    fila.proxima_tentativa IS NULL
                    OR fila.proxima_tentativa <= NOW()
                )
            ORDER BY fila.id_notificacao
            LIMIT 20
        `);

        for (const notificacao of pendentes) {
            const claim = await queryAsync(
                `UPDATE notificacoes_push
                 SET estado = 'processando', data_processamento = NOW()
                 WHERE id_notificacao = ? AND estado = 'pendente'`,
                [notificacao.id_notificacao]
            );

            if (claim.affectedRows === 0) {
                continue;
            }

            try {
                const dispositivos = await queryAsync(
                    `SELECT expo_push_token
                     FROM expo_push_tokens
                     WHERE id_usuario = ? AND ativo = 1`,
                    [notificacao.id_usuario]
                );

                if (dispositivos.length === 0) {
                    await queryAsync(
                        `UPDATE notificacoes_push
                         SET estado = 'sem_dispositivo', data_processamento = NULL
                         WHERE id_notificacao = ?`,
                        [notificacao.id_notificacao]
                    );
                    continue;
                }

                const response = await fetch("https://exp.host/--/api/v2/push/send", {
                    method: "POST",
                    signal: AbortSignal.timeout(10000),
                    headers: {
                        Accept: "application/json",
                        "Accept-Encoding": "gzip, deflate",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(dispositivos.map((dispositivo) => ({
                        to: dispositivo.expo_push_token,
                        sound: "default",
                        title: "Atualização do EcoTrack",
                        body: "Há uma nova atualização. Abra o aplicativo para consultar os detalhes.",
                        data: { screen: "Notificacoes" }
                    })))
                });

                const resultado = await response.json();
                if (!response.ok || !Array.isArray(resultado.data)) {
                    throw new Error(
                        resultado.errors?.[0]?.message
                        || `Expo Push respondeu com HTTP ${response.status}.`
                    );
                }

                const erros = resultado.data
                    .map((ticket, index) => ({ ticket, dispositivo: dispositivos[index] }))
                    .filter(({ ticket }) => ticket?.status !== "ok");

                for (const { ticket, dispositivo } of erros) {
                    const codigoErro = ticket?.details?.error;
                    if (codigoErro === "DeviceNotRegistered" && dispositivo) {
                        await queryAsync(
                            `UPDATE expo_push_tokens
                             SET ativo = 0
                             WHERE expo_push_token = ?`,
                            [dispositivo.expo_push_token]
                        );
                    }
                }

                if (erros.length > 0) {
                    throw new Error(
                        erros.map(({ ticket }) => ticket.message || "Falha ao enviar push.").join("; ")
                    );
                }

                await queryAsync(
                    `UPDATE notificacoes_push
                     SET estado = 'enviada', data_processamento = NULL,
                         enviada_em = NOW(), ultimo_erro = NULL
                     WHERE id_notificacao = ?`,
                    [notificacao.id_notificacao]
                );
            } catch (error) {
                const tentativas = notificacao.tentativas + 1;
                const estado = tentativas < 3 ? "pendente" : "falhou";
                const proximaTentativa = estado === "pendente"
                    ? new Date(Date.now() + tentativas * 60 * 1000)
                    : null;

                console.error(
                    `Erro ao enviar push da notificação ${notificacao.id_notificacao}:`,
                    error
                );

                await queryAsync(
                    `UPDATE notificacoes_push
                     SET estado = ?, tentativas = ?, proxima_tentativa = ?,
                         data_processamento = NULL, ultimo_erro = ?
                     WHERE id_notificacao = ?`,
                    [
                        estado,
                        tentativas,
                        proximaTentativa,
                        String(error.message || error).slice(0, 500),
                        notificacao.id_notificacao
                    ]
                );
            }
        }
    } catch (error) {
        console.error("Erro ao processar a fila de notificações push:", error);
    } finally {
        processandoFilaPush = false;
    }
}

async function enviarLembretesColetaSeletiva() {
    const agora = new Date();
    const formatador = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Sao_Paulo",
        weekday: "short",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23"
    });
    const partes = Object.fromEntries(
        formatador.formatToParts(agora).map(({ type, value }) => [type, value])
    );
    const diasDaSemana = {
        Sun: 7,
        Mon: 1,
        Tue: 2,
        Wed: 3,
        Thu: 4,
        Fri: 5,
        Sat: 6
    };
    const horaLocal = Number(partes.hour);
    const turno = horaLocal >= 7 && horaLocal < 12
        ? "Manhã"
        : horaLocal >= 13 && horaLocal < 18
            ? "Tarde"
            : null;

    if (!turno) {
        return;
    }

    const dataLocal = `${partes.year}-${partes.month}-${partes.day}`;
    const agenda = await queryAsync(
        `SELECT
            u.id_usuario,
            a.id_agenda,
            a.cooperativa,
            a.turno
         FROM usuarios u
         JOIN coleta_seletiva_agenda a
            ON a.dia_semana = ?
            AND a.turno = ?
            AND LOWER(a.areas_coleta) LIKE CONCAT('%', LOWER(u.bairro_coleta), '%')
         WHERE u.bairro_coleta IS NOT NULL
            AND TRIM(u.bairro_coleta) <> ''
            AND u.deseja_notificacoes = 1`,
        [diasDaSemana[partes.weekday], turno]
    );

    for (const item of agenda) {
        const lembrete = await queryAsync(
            `INSERT IGNORE INTO coleta_seletiva_lembretes
                (id_usuario, id_agenda, data_coleta)
             VALUES (?, ?, ?)`,
            [item.id_usuario, item.id_agenda, dataLocal]
        );

        if (lembrete.affectedRows === 0) {
            continue;
        }

        try {
            await queryAsync(
                `INSERT INTO notificacoes
                    (id_usuario, titulo, mensagem, lida, data_notificacao)
                 VALUES (?, ?, ?, 0, NOW())`,
                [
                    item.id_usuario,
                    "Coleta seletiva hoje",
                    `Hoje, no turno da ${item.turno.toLowerCase()}, a cooperativa ${item.cooperativa} atende a região do seu bairro cadastrado. Horário: ${item.turno === "Manhã" ? "07h às 12h" : "13h às 18h"}.`
                ]
            );
        } catch (error) {
            await queryAsync(
                `DELETE FROM coleta_seletiva_lembretes
                 WHERE id_usuario = ? AND id_agenda = ? AND data_coleta = ?`,
                [item.id_usuario, item.id_agenda, dataLocal]
            );
            throw error;
        }
    }
}

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
            bairro_coleta,
            eco_points,
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
            latitude,
            longitude,
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
            bairro_coleta,
            eco_points,
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

app.put("/usuarios/:id/notificacoes/preferencias", (req, res) => {
    const { id } = req.params;
    const { deseja_notificacoes } = req.body;

    if (typeof deseja_notificacoes !== "boolean") {
        return res.status(400).json({
            mensagem: "Informe se deseja receber notificações."
        });
    }

    db.query(
        "SELECT id_usuario FROM usuarios WHERE id_usuario = ?",
        [id],
        (lookupErr, usuarios) => {
            if (lookupErr) {
                console.error("Erro ao buscar usuário para atualizar notificações:", lookupErr);
                return res.status(500).json({
                    mensagem: "Erro ao atualizar a preferência de notificações."
                });
            }

            if (usuarios.length === 0) {
                return res.status(404).json({
                    mensagem: "Usuário não encontrado."
                });
            }

            db.query(
                "UPDATE usuarios SET deseja_notificacoes = ? WHERE id_usuario = ?",
                [deseja_notificacoes, id],
                (err) => {
                    if (err) {
                        console.error("Erro ao atualizar preferência de notificações:", err);
                        return res.status(500).json({
                            mensagem: "Erro ao atualizar a preferência de notificações."
                        });
                    }

                    if (!deseja_notificacoes) {
                        db.query(
                            "UPDATE expo_push_tokens SET ativo = 0 WHERE id_usuario = ?",
                            [id],
                            (tokenErr) => {
                                if (tokenErr) {
                                    console.error("Erro ao desativar tokens push do usuário:", tokenErr);
                                    return res.status(500).json({
                                        mensagem: "A preferência foi salva, mas não foi possível desativar os dispositivos."
                                    });
                                }

                                return res.status(200).json({
                                    mensagem: "Notificações desativadas."
                                });
                            }
                        );
                        return;
                    }

                    return res.status(200).json({
                        mensagem: "Notificações ativadas."
                    });
                }
            );
        }
    );
});

app.put("/usuarios/:id/push-token", (req, res) => {
    const { id } = req.params;
    const { expo_push_token, plataforma } = req.body;

    if (
        typeof expo_push_token !== "string"
        || !/^(Expo|Exponent)PushToken\[[^\]]+\]$/.test(expo_push_token)
        || !["ios", "android"].includes(plataforma)
    ) {
        return res.status(400).json({
            mensagem: "Token push ou plataforma inválidos."
        });
    }

    const sql = `
        INSERT INTO expo_push_tokens
            (id_usuario, expo_push_token, plataforma, ativo)
        VALUES (?, ?, ?, 1)
        ON DUPLICATE KEY UPDATE
            id_usuario = VALUES(id_usuario),
            plataforma = VALUES(plataforma),
            ativo = 1
    `;

    db.query(
        "SELECT deseja_notificacoes FROM usuarios WHERE id_usuario = ?",
        [id],
        (lookupErr, usuarios) => {
            if (lookupErr) {
                console.error("Erro ao validar usuário para token push:", lookupErr);
                return res.status(500).json({
                    mensagem: "Erro ao registrar o dispositivo para notificações."
                });
            }

            if (usuarios.length === 0) {
                return res.status(404).json({
                    mensagem: "Usuário não encontrado."
                });
            }

            if (Number(usuarios[0].deseja_notificacoes) !== 1) {
                return res.status(403).json({
                    mensagem: "Este usuário desativou as notificações."
                });
            }

            db.query(sql, [id, expo_push_token, plataforma], (err) => {
                if (err) {
                    console.error("Erro ao registrar token push:", err);
                    return res.status(500).json({
                        mensagem: "Erro ao registrar o dispositivo para notificações."
                    });
                }

                return res.status(200).json({
                    mensagem: "Dispositivo registrado para notificações."
                });
            });
        }
    );
});

app.put("/usuarios/:id/notificacoes/:id_notificacao/ler", (req, res) => {
    const { id, id_notificacao } = req.params;

    db.query(
        `UPDATE notificacoes
         SET lida = 1
         WHERE id_notificacao = ? AND id_usuario = ?`,
        [id_notificacao, id],
        (err, result) => {
            if (err) {
                console.error("Erro ao marcar notificação do usuário como lida:", err);
                return res.status(500).json({
                    mensagem: "Erro ao marcar a notificação como lida."
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    mensagem: "Notificação não encontrada."
                });
            }

            return res.status(200).json({
                mensagem: "Notificação marcada como lida."
            });
        }
    );
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

app.get("/coleta-seletiva", (req, res) => {
    const bairro = typeof req.query.bairro === "string"
        ? req.query.bairro.trim()
        : "";

    if (!bairro) {
        return res.status(200).json({ agendas: [] });
    }

    db.query(
        `SELECT
            id_agenda,
            cooperativa,
            dia_semana,
            turno,
            areas_coleta
         FROM coleta_seletiva_agenda
         WHERE LOWER(areas_coleta) LIKE CONCAT('%', LOWER(?), '%')
         ORDER BY dia_semana, FIELD(turno, 'Manhã', 'Tarde'), cooperativa`,
        [bairro],
        (err, results) => {
            if (err) {
                console.error("Erro ao buscar cronograma da coleta seletiva:", err);
                return res.status(500).json({
                    mensagem: "Não foi possível carregar o cronograma da coleta."
                });
            }

            return res.status(200).json({ agendas: results });
        }
    );
});

app.put("/usuarios/:id/bairro-coleta", (req, res) => {
    const bairro = typeof req.body.bairro_coleta === "string"
        ? req.body.bairro_coleta.trim()
        : "";

    if (bairro.length > 100) {
        return res.status(400).json({
            mensagem: "O bairro deve ter no máximo 100 caracteres."
        });
    }

    db.query(
        "UPDATE usuarios SET bairro_coleta = ? WHERE id_usuario = ?",
        [bairro || null, req.params.id],
        (err, result) => {
            if (err) {
                console.error("Erro ao salvar bairro da coleta:", err);
                return res.status(500).json({
                    mensagem: "Não foi possível salvar seu bairro."
                });
            }

            if (result.affectedRows === 0) {
                return db.query(
                    "SELECT id_usuario FROM usuarios WHERE id_usuario = ?",
                    [req.params.id],
                    (lookupErr, usuarios) => {
                        if (lookupErr) {
                            console.error("Erro ao confirmar usuário:", lookupErr);
                            return res.status(500).json({
                                mensagem: "Não foi possível salvar seu bairro."
                            });
                        }

                        if (usuarios.length === 0) {
                            return res.status(404).json({
                                mensagem: "Usuário não encontrado."
                            });
                        }

                        return res.status(200).json({
                            mensagem: "Bairro salvo.",
                            bairro_coleta: bairro || null
                        });
                    }
                );
            }

            return res.status(200).json({
                mensagem: "Bairro salvo.",
                bairro_coleta: bairro || null
            });
        }
    );
});

app.get("/pontos-coleta", (req, res) => {
    const idUsuario = req.query.id_usuario;
    const acompanhamento = idUsuario
        ? `EXISTS (
               SELECT 1
               FROM usuarios_pontos_coleta up
               WHERE up.id_ponto = p.id_ponto AND up.id_usuario = ?
           ) AS acompanhando`
        : "FALSE AS acompanhando";

    const sql = `
        SELECT
            p.id_ponto,
            p.nome,
            p.endereco,
            p.cep,
            p.latitude,
            p.longitude,
            p.tipo_residuo,
            p.descricao,
            p.horario_funcionamento,
            p.telefone,
            p.email,
            ${acompanhamento}
        FROM pontos_coleta p
        ORDER BY p.nome
    `;

    db.query(sql, idUsuario ? [idUsuario] : [], (err, results) => {
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
            telefone,
            email
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

app.put("/usuarios/:id/pontos-coleta/:id_ponto/acompanhamento", (req, res) => {
    const { id, id_ponto } = req.params;

    db.query(
        `INSERT INTO usuarios_pontos_coleta (id_usuario, id_ponto)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE id_ponto = VALUES(id_ponto)`,
        [id, id_ponto],
        (err) => {
            if (err) {
                console.error("Erro ao acompanhar ponto de coleta:", err);
                return res.status(500).json({
                    mensagem: "Não foi possível acompanhar este ponto."
                });
            }

            return res.status(200).json({
                mensagem: "Ponto adicionado aos acompanhamentos."
            });
        }
    );
});

app.delete("/usuarios/:id/pontos-coleta/:id_ponto/acompanhamento", (req, res) => {
    const { id, id_ponto } = req.params;

    db.query(
        `DELETE FROM usuarios_pontos_coleta
         WHERE id_usuario = ? AND id_ponto = ?`,
        [id, id_ponto],
        (err) => {
            if (err) {
                console.error("Erro ao deixar de acompanhar ponto de coleta:", err);
                return res.status(500).json({
                    mensagem: "Não foi possível remover este ponto dos acompanhamentos."
                });
            }

            return res.status(200).json({
                mensagem: "Ponto removido dos acompanhamentos."
            });
        }
    );
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
        telefone,
        email
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
            telefone,
            email
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        email
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
        telefone,
        email
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
            telefone = ?,
            email = ?
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
        email,
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

app.get("/usuarios/:id/desafios", (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT
            u.eco_points,
            (
                SELECT COALESCE(SUM(r.quantidade_kg), 0)
                FROM reciclagens r
                WHERE r.id_usuario = u.id_usuario
                    AND r.status = 'Aprovada'
            ) AS kg_reciclados,
            (
                SELECT COUNT(*)
                FROM reciclagens r
                WHERE r.id_usuario = u.id_usuario
                    AND r.status = 'Aprovada'
            ) AS reciclagens_aprovadas,
            (
                SELECT COUNT(*)
                FROM relatos r
                WHERE r.id_usuario = u.id_usuario
                    AND r.status = 'Resolvido'
            ) AS relatos_resolvidos,
            (
                SELECT COUNT(*)
                FROM usuarios_desafios ud_impacto
                WHERE ud_impacto.id_usuario = u.id_usuario
                    AND ud_impacto.progresso > 0
            ) AS desafios_participados,
            d.id_desafio,
            d.codigo,
            d.titulo,
            d.descricao,
            d.meta,
            d.recompensa,
            COALESCE(ud.progresso, 0) AS progresso,
            ud.data_conclusao
        FROM usuarios u
        CROSS JOIN desafios d
        LEFT JOIN usuarios_desafios ud
            ON ud.id_usuario = u.id_usuario
            AND ud.id_desafio = d.id_desafio
        WHERE u.id_usuario = ?
        ORDER BY d.id_desafio
    `;

    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error("Erro ao carregar desafios do usuário:", err);
            return res.status(500).json({
                mensagem: "Não foi possível carregar seus desafios."
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                mensagem: "Usuário ou desafios não encontrados."
            });
        }

        return res.status(200).json({
            eco_points: Number(results[0].eco_points) || 0,
            impacto: {
                kg_reciclados: Number(results[0].kg_reciclados) || 0,
                reciclagens_aprovadas: Number(results[0].reciclagens_aprovadas) || 0,
                relatos_resolvidos: Number(results[0].relatos_resolvidos) || 0,
                desafios_participados: Number(results[0].desafios_participados) || 0
            },
            desafios: results.map((item) => ({
                id_desafio: item.id_desafio,
                codigo: item.codigo,
                titulo: item.titulo,
                descricao: item.descricao,
                meta: item.meta,
                recompensa: item.recompensa,
                progresso: item.progresso,
                data_conclusao: item.data_conclusao,
                concluido: Boolean(item.data_conclusao)
            }))
        });
    });
});

app.post("/reciclagens", receiveImage, (req, res) => {
    const { id_usuario, material, quantidade_kg, data_reciclagem, local } = req.body;
    const materiaisValidos = new Set(["Papel", "Plástico", "Vidro", "Metal", "Orgânico"]);
    const quantidade = Number(String(quantidade_kg || "").replace(",", "."));
    const partesData = typeof data_reciclagem === "string"
        ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(data_reciclagem)
        : null;
    const dataObjeto = partesData
        ? new Date(Date.UTC(
            Number(partesData[1]),
            Number(partesData[2]) - 1,
            Number(partesData[3])
        ))
        : null;
    const dataValida = Boolean(
        partesData
        && dataObjeto.getUTCFullYear() === Number(partesData[1])
        && dataObjeto.getUTCMonth() === Number(partesData[2]) - 1
        && dataObjeto.getUTCDate() === Number(partesData[3])
    );

    if (
        !id_usuario
        || !materiaisValidos.has(material)
        || !Number.isFinite(quantidade)
        || quantidade <= 0
        || quantidade > 999999.99
        || !dataValida
        || !local?.trim()
        || !req.file
    ) {
        return removeUploadedFile(req.file, () => res.status(400).json({
            mensagem: "Informe usuário, material, quantidade válida, data, local e foto do comprovante."
        }));
    }

    db.query(
        `INSERT INTO reciclagens
            (id_usuario, material, quantidade_kg, data_reciclagem, local_reciclagem, comprovante)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
            id_usuario,
            material,
            quantidade,
            data_reciclagem,
            local.trim(),
            `/uploads/${req.file.filename}`
        ],
        (err, result) => {
            if (err) {
                console.error("Erro ao registrar reciclagem:", err);
                return removeUploadedFile(req.file, () => res.status(500).json({
                    mensagem: err.code === "ER_NO_REFERENCED_ROW_2"
                        ? "O usuário informado não existe."
                        : "Não foi possível registrar a reciclagem."
                }));
            }

            return res.status(201).json({
                mensagem: "Registro enviado para análise.",
                id_reciclagem: result.insertId,
                status: "Pendente"
            });
        }
    );
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
            latitude,
            longitude,
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
            latitude,
            longitude,
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
        atualizar_status,
        latitude,
        longitude
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

    const coordenadas = parseReportCoordinates(latitude, longitude);
    if (coordenadas.erro) {
        return removeUploadedFile(req.file, () => res.status(400).json({
            mensagem: coordenadas.erro
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
            latitude,
            longitude,
            categoria,
            descricao,
            imagem,
            atualizar_status,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pendente')
    `;

    const valores = [
        id_usuario,
        titulo,
        bairro,
        endereco,
        coordenadas.latitude,
        coordenadas.longitude,
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
        atualizar_status,
        latitude,
        longitude
    } = req.body;

    if (!titulo || !bairro || !endereco || !categoria || !descricao) {
        return res.status(400).json({
            mensagem: "Preencha os campos obrigatórios: título, bairro, endereço, categoria e descrição."
        });
    }

    const coordenadas = parseReportCoordinates(latitude, longitude);
    if (coordenadas.erro) {
        return res.status(400).json({
            mensagem: coordenadas.erro
        });
    }

    const sql = `
        UPDATE relatos
        SET
            titulo = ?,
            bairro = ?,
            endereco = ?,
            latitude = COALESCE(?, latitude),
            longitude = COALESCE(?, longitude),
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
        coordenadas.latitude,
        coordenadas.longitude,
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

queryAsync(
    `UPDATE notificacoes_push
     SET estado = 'pendente'
     WHERE estado = 'processando'`
).then(() => {
    enviarNotificacoesPushPendentes();
}).catch((error) => {
    console.error("Erro ao recuperar notificações push pendentes:", error);
});

const filaPushInterval = setInterval(enviarNotificacoesPushPendentes, 30000);
filaPushInterval.unref();

const lembreteColetaInterval = setInterval(() => {
    enviarLembretesColetaSeletiva().catch((error) => {
        console.error("Erro ao gerar lembretes da coleta seletiva:", error);
    });
}, 60000);
lembreteColetaInterval.unref();

app.listen(port, () => {
    console.log(`Servidor backend executando na porta ${port}`);
});
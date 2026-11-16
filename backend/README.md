# Backend

## Notificações e pontos acompanhados

Faça backup do banco. Depois de aplicar as migrações `001_add_relato_status.sql`
e `002_add_profile_image.sql` (se ainda não foram aplicadas), execute uma vez
[005_collection_and_recycling_challenges.sql](./migrations/005_collection_and_recycling_challenges.sql)
no banco `ecotrack`. O arquivo converte as tabelas base para InnoDB, adiciona
o bairro acompanhado e o saldo EcoPoints, cadastra as rotas fornecidas pelo
usuário e cria as tabelas de reciclagem, desafios, fila/tokens push e
acompanhamento de Ecopontos.

Não execute o arquivo `005` novamente: a inclusão das colunas não é idempotente.

Esta migração também instala as notificações de relatos e de alterações nos
Ecopontos acompanhados. Não é necessário executar separadamente a migração
`004_report_notification_rules.sql`; ela contém apenas uma parte das regras
recriadas pela migração `005`.

Na tela Infos, o usuário informa o bairro da residência e vê os dias, turnos e
cooperativas que atendem a região conforme esse cronograma. O backend gera no
dia da coleta um lembrete para o turno correspondente (07h–12h ou 13h–18h),
uma vez por rota e por dia, se `deseja_notificacoes` estiver ativado.

O cronograma identifica a rota por bairro; os dados atuais não têm coordenadas
da residência nem dos Ecopontos para calcular distância geográfica até o ponto
mais próximo. Os Ecopontos continuam listados separadamente.

### Aprovação de reciclagens e desafio

Cada envio em “Registrar reciclagem” fica com status `Pendente`; o app não
oferece uma ação pública de aprovação. Um administrador deve revisar o
comprovante e aprovar pelo MySQL:

```sql
USE ecotrack;

SELECT id_reciclagem, id_usuario, material, quantidade_kg,
       data_reciclagem, local_reciclagem, comprovante
FROM reciclagens
WHERE status = 'Pendente'
ORDER BY data_registro;

UPDATE reciclagens
SET status = 'Aprovada'
WHERE id_reciclagem = ID_REVISADO
  AND status = 'Pendente';
```

Substitua `ID_REVISADO` pelo identificador numérico analisado. Só registros
aprovados pelo administrador contam para o desafio de reciclagem. Ao atingir a
meta cadastrada, o banco conclui o desafio uma única vez, credita 50 EcoPoints
e, se as notificações estiverem ativadas, cria um aviso na central e na fila push.

Para testar o fluxo com uma reciclagem em um banco de desenvolvimento, reduza
temporariamente a meta do desafio antes de enviar o registro:

```sql
UPDATE desafios
SET titulo = 'Recicle 1 item',
    descricao = 'Registre uma reciclagem e aguarde a aprovação.',
    meta = 1
WHERE codigo = 'recicle-5-itens';
```

Esse comando muda o desafio para 1/1 no banco de desenvolvimento. O cartão do
desafio abre o cadastro de reciclagem. O progresso só avança depois que o
registro for aprovado pelo administrador usando o procedimento acima.

O endpoint `GET /usuarios/:id/desafios` também retorna `eco_points` e um resumo
de impacto para a tela Home: soma em quilos e quantidade de reciclagens
aprovadas, relatos resolvidos e desafios com progresso iniciado. Registros
pendentes não entram nessas métricas; CO₂ evitado não é estimado sem um fator
de cálculo definido.

As atualizações de relatos respeitam `relatos.atualizar_status` e
`usuarios.deseja_notificacoes`. Alterações em um ponto geram notificações apenas
para usuários que o acompanham e mantêm as notificações ativadas. A tela
Notificações guarda e exibe esse histórico; a fila push é processada pelo backend
e tenta novamente até três vezes em falhas temporárias.

### Ativar push remoto

O histórico dentro do aplicativo funciona sem EAS. Para push com o aplicativo
fechado, crie/associe um projeto Expo (`npx eas-cli@latest login` e
`npx eas-cli@latest init`), instale `expo-dev-client` com
`npx expo install expo-dev-client`, execute `npx eas-cli@latest build:configure`,
configure as credenciais de push para a plataforma e gere um development build.
O EAS grava o `projectId` em `app.json`; não coloque tokens de dispositivos
manualmente no código. Push remoto não funciona no Expo Go para Android desde o
SDK 53.

O serviço do Expo envia as notificações para os dispositivos registrados. Para
que o envio funcione, o backend precisa ter acesso HTTPS a
`https://exp.host/--/api/v2/push/send`.

Os endereços e horários dos Ecopontos vieram da página oficial de
[Serviços Urbanos da Prefeitura de São Leopoldo](https://www.saoleopoldo.rs.gov.br/conteudo/1722/1?titulo=SERVI%C3%87OS+URBANOS).
Eles recebem pneus, móveis, poda/jardinagem e entulho, não recicláveis domésticos
comuns. O cronograma por bairro cadastrado na migração foi fornecido pelo
usuário e não foi verificado independentemente com a Prefeitura. A página
municipal de [Coleta Seletiva](https://www.saoleopoldo.rs.gov.br/conteudo/4303/1/1722?titulo=COLETA+SELETIVA)
deve ser consultada para confirmar eventuais alterações.

## Status de relatos

Antes de iniciar o backend com a nova regra de status, aplique uma vez a
migração [001_add_relato_status.sql](./migrations/001_add_relato_status.sql) no
banco `ecotrack`. Ela cria o status persistido e mantém os relatos existentes
como `Pendente`; ao consultar os relatos, os que estiverem pendentes há pelo
menos 3 dias são atualizados para `Em análise`. `Resolvido` não é atribuído
automaticamente.

Para registrar uma resolução confirmada, um responsável autorizado pode
atualizar o registro no banco:

```sql
UPDATE relatos SET status = 'Resolvido' WHERE id_relato = ?;
```

## Imagens de perfil e relatos

Antes de iniciar o backend com o suporte à foto de perfil, aplique uma vez a
migração [002_add_profile_image.sql](./migrations/002_add_profile_image.sql)
no banco `ecotrack`. As imagens são salvas localmente em `backend/uploads` e
servidas pelo backend; o banco guarda somente o caminho do arquivo. O diretório
é criado automaticamente, e cada imagem pode ter até 5 MB.

Esse método não usa Firebase Storage nem cobra por armazenamento em nuvem, mas
consome o disco da máquina que executa o backend. Em uma hospedagem, configure
um volume persistente para `backend/uploads`; sem isso, as imagens podem ser
perdidas quando o servidor reiniciar ou for publicado novamente.

Password reset messages are sent by Firebase Authentication. Their links use
Firebase's hosted action handler and one-time, expiring action codes; this API
does not generate or store password reset tokens. Configure the Password reset
template in Authentication > Templates in the Firebase Console and keep the
Firebase default action handler enabled (or configure a Firebase-hosted custom
action handler) so recipients can complete the operation from the link.

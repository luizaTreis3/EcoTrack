# Backend

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

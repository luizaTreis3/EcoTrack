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

Password reset messages are sent by Firebase Authentication. Their links use
Firebase's hosted action handler and one-time, expiring action codes; this API
does not generate or store password reset tokens. Configure the Password reset
template in Authentication > Templates in the Firebase Console and keep the
Firebase default action handler enabled (or configure a Firebase-hosted custom
action handler) so recipients can complete the operation from the link.

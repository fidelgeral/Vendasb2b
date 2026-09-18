-- O login deixou de pedir o "código do negócio" — passa a bastar email+senha.
-- Para isso, o email de um funcionário tem de ser único em toda a plataforma,
-- não só dentro do seu negócio.
ALTER TABLE employees DROP CONSTRAINT employees_business_id_email_key;
ALTER TABLE employees ADD CONSTRAINT employees_email_key UNIQUE (email);

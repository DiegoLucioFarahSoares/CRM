DROP POLICY IF EXISTS "Allow all for anon" ON clientes;
DROP POLICY IF EXISTS "Allow all for anon" ON negocios;
CREATE POLICY "Allow all for authenticated" ON clientes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON negocios FOR ALL TO authenticated USING (true) WITH CHECK (true);

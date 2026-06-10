-- Create eventos table
CREATE TABLE IF NOT EXISTS eventos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descricao text NOT NULL DEFAULT '',
  data date NOT NULL,
  hora_inicio text NOT NULL DEFAULT '09:00',
  hora_fim text NOT NULL DEFAULT '10:00',
  tipo text NOT NULL DEFAULT 'reuniao' CHECK (tipo IN ('reuniao', 'ligacao', 'tarefa', 'lembrete')),
  cliente_id uuid REFERENCES clientes(id) ON DELETE SET NULL,
  concluido boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS eventos_updated_at ON eventos;
CREATE TRIGGER eventos_updated_at
  BEFORE UPDATE ON eventos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for authenticated" ON eventos;
CREATE POLICY "Allow all for authenticated" ON eventos FOR ALL TO authenticated USING (true) WITH CHECK (true);

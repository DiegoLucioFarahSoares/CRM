-- Drop existing tables
DROP TABLE IF EXISTS deals CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;

-- Create clientes table aligned with app code
CREATE TABLE clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text UNIQUE,
  telefone text,
  empresa text,
  cargo text,
  status text NOT NULL DEFAULT 'prospecto' CHECK (status IN ('ativo', 'inativo', 'prospecto')),
  valor numeric(15,2) NOT NULL DEFAULT 0,
  ultimo_contato date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create negocios table aligned with app code
CREATE TABLE negocios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  cliente_id uuid REFERENCES clientes(id) ON DELETE SET NULL,
  valor numeric(15,2) NOT NULL DEFAULT 0,
  etapa text NOT NULL DEFAULT 'prospeccao' CHECK (etapa IN ('prospeccao', 'qualificacao', 'proposta', 'negociacao', 'fechado', 'perdido')),
  probabilidade integer NOT NULL DEFAULT 20,
  data_fechamento date,
  responsavel text,
  notas text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clientes_updated_at
  BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER negocios_updated_at
  BEFORE UPDATE ON negocios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS policies
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE negocios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for anon" ON clientes FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON negocios FOR ALL TO anon USING (true) WITH CHECK (true);

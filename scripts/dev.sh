#!/bin/bash

# Carrega variáveis de ambiente
if [ -f apps/backend/.env ]; then
  export $(cat apps/backend/.env | grep -v '^#' | xargs)
fi

# Inicia Docker Compose em background
echo "Iniciando PostgreSQL e Redis..."
docker-compose -f apps/backend/docker-compose.yml up -d postgres redis

# Aguarda serviços ficarem prontos
echo "Aguardando serviços..."
sleep 5

# Roda migrações
echo "Rodando migrações..."
cd apps/backend && npm run db:migrate

# Inicia servidor em modo dev
echo "Iniciando servidor..."
npm run dev

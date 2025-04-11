#!/bin/bash

# Caminho para os ficheiros de configuração
HAPROXY1_CFG="./haproxy/haproxy1.cfg"
HAPROXY2_CFG="./haproxy/haproxy2.cfg"

# Portos dos balanceadores
HAPROXY1_PORT=8080
HAPROXY2_PORT=8081

# Portas dos servidores Node.js
NODE1_PORT=3001
NODE2_PORT=3002

# Iniciar dois servidores Node.js em portas diferentes
echo "Iniciando instâncias do servidor Node.js..."

# Iniciar as instâncias de Node.js com redirecionamento de log
nohup node techthrift.js --port=$NODE1_PORT > node1.log 2>&1 &
nohup node techthrift.js --port=$NODE2_PORT > node2.log 2>&1 &

# Aguardar um pequeno intervalo antes de iniciar o HAProxy
sleep 5

# Iniciar HAProxy 1
echo "Iniciando HAProxy 1 na porta $HAPROXY1_PORT..."
if ! pgrep -f haproxy > /dev/null; then
    sudo haproxy -f "$HAPROXY1_CFG" -p ./haproxy1.pid &
else
    echo "HAProxy 1 já está a correr!"
fi

# Iniciar HAProxy 2
echo "Iniciando HAProxy 2 na porta $HAPROXY2_PORT..."
if ! pgrep -f haproxy > /dev/null; then
    sudo haproxy -f "$HAPROXY2_CFG" -p ./haproxy2.pid &
else
    echo "HAProxy 2 já está a correr!"
fi

echo "Tudo iniciado com sucesso!"
echo "Aceda ao HAProxy 1 em http://localhost:$HAPROXY1_PORT"
echo "Aceda ao HAProxy 2 em http://localhost:$HAPROXY2_PORT"
echo "Servidores Node.js estão a correr nas portas $NODE1_PORT e $NODE2_PORT."

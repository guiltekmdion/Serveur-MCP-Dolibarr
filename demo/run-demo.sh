#!/usr/bin/env bash
# Démo MCP : initialize -> tools/list -> tools/call thirdparty_list
set -euo pipefail

ENDPOINT="${ENDPOINT:-http://localhost:8080/custom/mcpserver/mcp/server.php}"
KEY="${KEY:-demo-mcp-key-123}"
HDR=(-H "DOLAPIKEY: $KEY" -H "Content-Type: application/json" -H "Accept: application/json, text/event-stream")

echo "== initialize =="
INIT_HEADERS="$(mktemp)"
curl -sS -D "$INIT_HEADERS" "${HDR[@]}" -X POST "$ENDPOINT" -d '{
  "jsonrpc":"2.0","id":1,"method":"initialize",
  "params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"demo","version":"1.0"}}
}'
echo
SID="$(grep -i '^mcp-session-id:' "$INIT_HEADERS" | awk '{print $2}' | tr -d '\r' || true)"
echo "session=$SID"
SIDHDR=(); [ -n "$SID" ] && SIDHDR=(-H "Mcp-Session-Id: $SID")

echo "== notifications/initialized =="
curl -sS "${HDR[@]}" "${SIDHDR[@]}" -X POST "$ENDPOINT" -d '{"jsonrpc":"2.0","method":"notifications/initialized"}' || true
echo

echo "== tools/list =="
curl -sS "${HDR[@]}" "${SIDHDR[@]}" -X POST "$ENDPOINT" -d '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'
echo

echo "== tools/call thirdparty_list =="
curl -sS "${HDR[@]}" "${SIDHDR[@]}" -X POST "$ENDPOINT" -d '{
  "jsonrpc":"2.0","id":3,"method":"tools/call",
  "params":{"name":"thirdparty_list","arguments":{"limit":5}}
}'
echo

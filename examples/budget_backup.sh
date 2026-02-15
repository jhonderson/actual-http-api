#!/bin/bash

# === ENV CONFIG ===
ACTUAL_BUDGET_URL="https://actualapi.mydomain.com"
ACTUAL_BUDGET_API_KEY="myapikey"
ACTUAL_BUDGET_SYNC_ID_LIST=("xxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" "yyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy")
BACKUP_KEEP_DAYS=360
DEST_DIR="/destination/folder/Actual"

# ==================

function download_actual_budget() {
    mkdir -p "${DEST_DIR}"

    for ACTUAL_BUDGET_SYNC_ID_X in "${ACTUAL_BUDGET_SYNC_ID_LIST[@]}"
    do
        echo "Downloading budget ${ACTUAL_BUDGET_SYNC_ID_X}..."
        
        # Download file (may be URL-encoded)
        curl -sSL -O -J \
            -H "accept: */*" \
            -H "x-api-key: ${ACTUAL_BUDGET_API_KEY}" \
            "${ACTUAL_BUDGET_URL}/v1/budgets/${ACTUAL_BUDGET_SYNC_ID_X}/export" \
            --output-dir "${DEST_DIR}"

        # Find the most recent downloaded file (usually the one we just got)
        local DOWNLOADED_FILE="$(ls -t "${DEST_DIR}" | head -n 1)"
        local DECODED_FILE="$(printf '%b' "${DOWNLOADED_FILE//%/\\x}")"

        # If different, rename
        if [[ "${DOWNLOADED_FILE}" != "${DECODED_FILE}" ]]; then
            mv "${DEST_DIR}/${DOWNLOADED_FILE}" "${DEST_DIR}/${DECODED_FILE}"
            echo "Renamed: ${DOWNLOADED_FILE} → ${DECODED_FILE}"
        fi
    done
}

function clear_history() {
    if [[ "${BACKUP_KEEP_DAYS}" -gt 0 ]]; then
        find "${DEST_DIR}" -type f -name "*.zip" -mtime +${BACKUP_KEEP_DAYS} -delete
    fi
}

# === MAIN ===
download_actual_budget
clear_history

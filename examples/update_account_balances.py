#!/usr/bin/env python3

import requests
import re
import yfinance as yf
from datetime import date

# =========================
# CONFIGURATION
# =========================

BASE_URL = "https://actualapi.mydomain.com/v1"
BUDGET_SYNC_ID = "xxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
API_TOKEN = "myapikey"

PAYEE_NAME = ""
NOTE = "Market value update"

DRY_RUN = False  # True = no transactions created

# =========================
# HTTP HELPERS
# =========================

def api_get(path):
    url = f"{BASE_URL}{path}"
    r = requests.get(
        url,
        headers={"x-api-key": API_TOKEN}
    )
    r.raise_for_status()
    return r.json()["data"]

def api_post(path, body):
    url = f"{BASE_URL}{path}"
    r = requests.post(
        url,
        json=body,
        headers={"x-api-key": API_TOKEN}
    )
    r.raise_for_status()
    return r.json()

# =========================
# HOLDING PARSER
# =========================

def parse_holdings(note):
    holdings = []
    pattern = r"#holding\s+([0-9.]+)\s+([A-Z0-9.\-]+)"
    for line in note.splitlines():
        m = re.search(pattern, line)
        if m:
            qty = float(m.group(1))
            ticker = m.group(2)
            holdings.append((ticker, qty))
    return holdings

# =========================
# PRICE FETCHING
# =========================

price_cache = {}

def fetch_prices(tickers):
    prices = {}
    for ticker in tickers:
        if ticker not in price_cache:
            print(f"Fetching price for {ticker}")
            data = yf.Ticker(ticker)
            price = data.fast_info.get("lastPrice") \
                    or data.info.get("regularMarketPrice")
            if price is None:
                raise Exception(f"Could not fetch price for {ticker}")
            price_cache[ticker] = price
        prices[ticker] = price_cache[ticker]
    return prices


# =========================
# VALUE CALCULATION
# =========================

def compute_portfolio_value_cents(holdings, prices):
    total_dollars = 0
    for ticker, qty in holdings:
        if ticker == "CASH":
            total_dollars += qty
            continue
        price = prices[ticker]
        value = qty * price
        total_dollars += value
    return int(round(total_dollars * 100))

# =========================
# MAIN
# =========================

def main():
    accounts = api_get(f"/budgets/{BUDGET_SYNC_ID}/accounts")
    for account in accounts:
        if not account["offbudget"]:
            continue

        if account["closed"]:
            continue

        account_id = account["id"]
        name = account["name"]
        print(f"\nProcessing account: {name}")

        # NEW NOTES ENDPOINT
        note = api_get(
            f"/budgets/{BUDGET_SYNC_ID}/notes/account/{account_id}"
        ) or ""

        holdings = parse_holdings(note)

        if not holdings:
            print("No holdings found")
            continue
        print("Holdings:", holdings)

        tickers = [t for t, _ in holdings if t != "CASH"]
        prices = fetch_prices(tickers)
        print("Prices:", prices)

        portfolio_value_cents = compute_portfolio_value_cents(
            holdings,
            prices
        )

        balance_cents = api_get(
            f"/budgets/{BUDGET_SYNC_ID}/accounts/{account_id}/balance"
        )

        diff = portfolio_value_cents - balance_cents

        print("Current balance:", balance_cents / 100)
        print("Portfolio value:", portfolio_value_cents / 100)
        print("Adjustment transaction:", diff / 100)

        if abs(diff) < 1:
            print("No adjustment required")
            continue

        transaction = {
            "transaction": {
                "account": account_id,
                "date": date.today().isoformat(),
                "amount": diff,
                "payee_name": PAYEE_NAME,
                "notes": NOTE
            }
        }

        if DRY_RUN:
            print("DRY RUN transaction:", transaction)
        else:
            api_post(
                f"/budgets/{BUDGET_SYNC_ID}/accounts/{account_id}/transactions",
                transaction
            )
            print("Transaction created")

if __name__ == "__main__":
    main()
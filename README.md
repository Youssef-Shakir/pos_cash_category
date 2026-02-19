# POS Cash In/Out Categories

Odoo 18 module for categorizing POS cash in/out operations with automatic account posting.

## Features

- Create custom categories for cash in/out operations (e.g., Bank Deposit, Supplier Payment, Petty Cash)
- Assign specific GL accounts to each category
- Automatic journal entry posting to the category's account instead of default suspense account
- Full integration with POS session cash control and closing
- Track cash movements by category with statistics

## Installation

1. Copy the `pos_cash_category` folder to your Odoo addons directory
2. Update the apps list in Odoo
3. Install the module from Apps menu

## Configuration

### 1. Create Categories

Go to **Point of Sale > Configuration > Cash Categories > Categories**

Create categories with:
- **Name**: Category name (e.g., "Bank Deposit")
- **Type**: Cash In, Cash Out, or Both
- **Account**: GL account for posting

### 2. Enable in POS Settings

Go to **Point of Sale > Configuration > Settings**

In the Accounting section:
- Enable **Cash Categories**
- Optionally select specific categories to limit availability

## Usage

1. Open a POS session
2. Click the hamburger menu (top right)
3. Select **Cash In/Out**
4. Choose **Cash In** or **Cash Out**
5. Select a category
6. Enter amount and optional reason
7. Confirm

The transaction will:
- Create a bank statement line for session cash control
- Post to the category's GL account
- Appear in session reports and closing

## Models

- `pos.cash.category` - Category definitions
- `pos.cash.move` - Cash movement records

## Authors

- Donialink
- Yousif Shakir

## License

LGPL-3

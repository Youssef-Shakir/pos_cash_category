# -*- coding: utf-8 -*-
{
    'name': 'POS Cash In/Out Categories',
    'version': '18.0.1.0.0',
    'category': 'Point of Sale',
    'summary': 'Categorize POS cash in/out with automatic account posting',
    'description': """
POS Cash In/Out Categories
==========================
- Create categories for cash in/out operations
- Assign specific accounts to each category
- Automatic journal entry posting to the correct account
- Replace suspense account with category-specific accounts
- Track cash movements by category

Setup:
1. Go to POS > Configuration > Cash Categories
2. Create categories and assign accounts
3. Enable "Use Cash Categories" in POS Configuration
4. Use cash in/out from POS with category selection
    """,
    'author': 'Custom',
    'depends': ['point_of_sale', 'account'],
    'data': [
        'security/ir.model.access.csv',
        'views/pos_cash_category_views.xml',
        'views/pos_config_views.xml',
    ],
    'assets': {
        'point_of_sale._assets_pos': [
            'pos_cash_category/static/src/js/models.js',
            'pos_cash_category/static/src/js/cash_category_popup.js',
            'pos_cash_category/static/src/xml/cash_category_popup.xml',
        ],
    },
    'license': 'LGPL-3',
    'installable': True,
    'application': False,
}

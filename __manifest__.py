# -*- coding: utf-8 -*-
{
    'name': 'POS Cash In/Out Categories',
    'version': '18.0.1.0.0',
    'category': 'Point of Sale',
    'summary': 'Categorize POS cash in/out with automatic account posting',
    'author': 'Donialink, Yousif Shakir',
    'website': 'https://www.donialink.com',
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

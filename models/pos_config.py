# -*- coding: utf-8 -*-
from odoo import api, fields, models


class PosConfig(models.Model):
    _inherit = 'pos.config'

    use_cash_categories = fields.Boolean(
        string='Use Cash Categories',
        default=False,
        help="Enable categorized cash in/out with automatic account posting"
    )

    cash_category_ids = fields.Many2many(
        'pos.cash.category',
        string='Available Categories',
        help="Limit categories available in this POS. Leave empty for all."
    )


class PosSession(models.Model):
    _inherit = 'pos.session'

    def _loader_params_pos_config(self):
        result = super()._loader_params_pos_config()
        if 'search_params' in result and 'fields' in result['search_params']:
            if 'use_cash_categories' not in result['search_params']['fields']:
                result['search_params']['fields'].append('use_cash_categories')
        return result

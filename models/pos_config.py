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

    def _pos_ui_models_to_load(self):
        result = super()._pos_ui_models_to_load()
        return result

    def _loader_params_pos_config(self):
        result = super()._loader_params_pos_config()
        result['search_params']['fields'].append('use_cash_categories')
        return result

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

    def _get_pos_ui_pos_config(self, params):
        """Add use_cash_categories to POS config data."""
        result = super()._get_pos_ui_pos_config(params)
        result['use_cash_categories'] = self.config_id.use_cash_categories
        return result

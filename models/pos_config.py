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

    @api.model
    def _load_pos_self_data_fields(self, config_id):
        """Add use_cash_categories to the fields loaded by POS"""
        result = super()._load_pos_self_data_fields(config_id)
        result += ['use_cash_categories']
        return result

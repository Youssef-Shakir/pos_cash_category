# -*- coding: utf-8 -*-
from odoo import api, fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'

    pos_use_cash_categories = fields.Boolean(
        related='pos_config_id.use_cash_categories',
        readonly=False
    )
    pos_cash_category_ids = fields.Many2many(
        related='pos_config_id.cash_category_ids',
        readonly=False
    )

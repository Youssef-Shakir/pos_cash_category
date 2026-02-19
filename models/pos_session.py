# -*- coding: utf-8 -*-
from odoo import api, fields, models, _
from odoo.exceptions import UserError

import logging
_logger = logging.getLogger(__name__)


class PosSession(models.Model):
    _inherit = 'pos.session'

    cash_move_ids = fields.One2many(
        'pos.cash.move',
        'session_id',
        string='Cash Moves'
    )

    cash_in_total = fields.Monetary(
        string='Total Cash In',
        compute='_compute_cash_totals',
        currency_field='currency_id'
    )
    cash_out_total = fields.Monetary(
        string='Total Cash Out',
        compute='_compute_cash_totals',
        currency_field='currency_id'
    )

    @api.depends('cash_move_ids.amount')
    def _compute_cash_totals(self):
        for session in self:
            session.cash_in_total = sum(
                session.cash_move_ids.filtered(lambda m: m.amount > 0).mapped('amount')
            )
            session.cash_out_total = abs(sum(
                session.cash_move_ids.filtered(lambda m: m.amount < 0).mapped('amount')
            ))

    def get_cash_categories(self):
        """Return cash categories for the POS frontend"""
        self.ensure_one()
        categories = self.env['pos.cash.category'].search([
            ('company_id', '=', self.company_id.id),
            ('active', '=', True)
        ])
        return [{
            'id': cat.id,
            'name': cat.name,
            'type': cat.category_type,
            'account_id': cat.account_id.id,
        } for cat in categories]

    def create_cash_move(self, category_id, amount, reason):
        """Create a cash move from POS frontend with category"""
        self.ensure_one()

        try:
            category = self.env['pos.cash.category'].browse(category_id)
            if not category.exists():
                return {'error': _('Category not found')}

            # Determine type based on amount
            move_type = 'in' if amount >= 0 else 'out'
            abs_amount = abs(amount)

            # Create the standard bank statement line for session cash control
            # This integrates with the session's cash register and uses the category's account
            statement_line = self._create_cash_statement_line(category, abs_amount, move_type, reason)

            # Create our categorized cash move record linked to the statement line
            move = self.env['pos.cash.move'].create({
                'name': reason if reason else category.name,
                'session_id': self.id,
                'category_id': category_id,
                'amount': amount,
                'notes': reason or '',
                'statement_line_id': statement_line.id if statement_line else False,
            })

            return {
                'id': move.id,
                'name': move.name,
                'amount': move.amount,
                'category': category.name,
                'move_type': move.move_type,
            }
        except Exception as e:
            _logger.error("Error creating cash move: %s", str(e))
            return {'error': str(e)}

    def _create_cash_statement_line(self, category, amount, move_type, reason):
        """Create a bank statement line for the cash move (for session cash control)"""
        self.ensure_one()

        if not self.cash_journal_id:
            _logger.warning("No cash journal configured for session %s", self.name)
            return None

        sign = 1 if move_type == 'in' else -1
        signed_amount = sign * amount

        # Build reference
        type_label = _('Cash In') if move_type == 'in' else _('Cash Out')
        payment_ref = f"{self.name} - {type_label} - {category.name}"
        if reason:
            payment_ref += f" ({reason})"

        # Create statement line with category's account as counterpart
        # This posts to the category's account instead of the default suspense account
        vals = {
            'pos_session_id': self.id,
            'journal_id': self.cash_journal_id.id,
            'amount': signed_amount,
            'date': fields.Date.context_today(self),
            'payment_ref': payment_ref,
            'counterpart_account_id': category.account_id.id,
        }

        return self.env['account.bank.statement.line'].create(vals)

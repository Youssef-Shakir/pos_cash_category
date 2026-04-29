# -*- coding: utf-8 -*-
from odoo import api, fields, models, _


class PosCashCategory(models.Model):
    _name = 'pos.cash.category'
    _description = 'POS Cash In/Out Category'
    _order = 'sequence, name'

    name = fields.Char(string='Category Name', required=True)
    sequence = fields.Integer(string='Sequence', default=10)
    active = fields.Boolean(default=True)

    category_type = fields.Selection([
        ('in', 'Cash In'),
        ('out', 'Cash Out'),
        ('both', 'Both'),
    ], string='Type', default='both', required=True,
       help="Determines if this category appears for cash in, cash out, or both")

    account_id = fields.Many2one(
        'account.account',
        string='Account',
        required=True,
        help="Account to post the cash in/out transaction"
    )

    company_id = fields.Many2one(
        'res.company',
        string='Company',
        default=lambda self: self.env.company,
        required=True
    )

    description = fields.Text(string='Description')

    total_cash_in = fields.Monetary(
        string='Total Cash In',
        compute='_compute_totals',
        currency_field='currency_id'
    )
    total_cash_out = fields.Monetary(
        string='Total Cash Out',
        compute='_compute_totals',
        currency_field='currency_id'
    )
    currency_id = fields.Many2one(
        related='company_id.currency_id'
    )

    move_count = fields.Integer(
        string='Transactions',
        compute='_compute_totals'
    )

    def _compute_totals(self):
        CashMove = self.env['pos.cash.move']
        for category in self:
            moves = CashMove.search([('category_id', '=', category.id)])
            category.total_cash_in = sum(moves.filtered(lambda m: m.amount > 0).mapped('amount'))
            category.total_cash_out = abs(sum(moves.filtered(lambda m: m.amount < 0).mapped('amount')))
            category.move_count = len(moves)

    def action_view_moves(self):
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': _('Cash Moves'),
            'res_model': 'pos.cash.move',
            'view_mode': 'list,form',
            'domain': [('category_id', '=', self.id)],
            'context': {'default_category_id': self.id},
        }


class PosCashMove(models.Model):
    _name = 'pos.cash.move'
    _description = 'POS Cash In/Out Move'
    _order = 'create_date desc'

    name = fields.Char(string='Reference', required=True)
    session_id = fields.Many2one(
        'pos.session',
        string='POS Session',
        required=True,
        ondelete='cascade'
    )
    category_id = fields.Many2one(
        'pos.cash.category',
        string='Category',
        required=True
    )
    amount = fields.Monetary(
        string='Amount',
        required=True,
        currency_field='currency_id',
        help="Positive for cash in, negative for cash out"
    )
    currency_id = fields.Many2one(
        related='session_id.currency_id'
    )
    move_type = fields.Selection([
        ('in', 'Cash In'),
        ('out', 'Cash Out'),
    ], string='Type', compute='_compute_move_type', store=True)

    statement_line_id = fields.Many2one(
        'account.bank.statement.line',
        string='Statement Line',
        readonly=True,
        help="The bank statement line created for this cash move"
    )

    account_move_id = fields.Many2one(
        'account.move',
        string='Journal Entry',
        readonly=True,
    )

    notes = fields.Text(string='Notes')

    config_id = fields.Many2one(
        related='session_id.config_id',
        store=True
    )
    user_id = fields.Many2one(
        'res.users',
        string='User',
        default=lambda self: self.env.user
    )

    @api.depends('amount')
    def _compute_move_type(self):
        for move in self:
            move.move_type = 'in' if move.amount >= 0 else 'out'

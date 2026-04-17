/** @odoo-module **/

import { AbstractAwaitablePopup } from "@point_of_sale/app/popup/abstract_awaitable_popup";
import { useService } from "@web/core/utils/hooks";
import { usePos } from "@point_of_sale/app/store/pos_hook";
import { _t } from "@web/core/l10n/translation";
import { jsonrpc } from "@web/core/network/rpc_service";
import { useState } from "@odoo/owl";

export class CashCategoryPopup extends AbstractAwaitablePopup {
    static template = "pos_cash_category.CashCategoryPopup";

    setup() {
        super.setup();
        this.pos = usePos();
        this.notification = useService("pos_notification");

        this.state = useState({
            type: this.props.type || "in",
            selectedCategory: null,
            amount: "",
            reason: "",
            loading: false,
        });

        this.allCategories = this.pos.cashCategories || [];
    }

    get filteredCategories() {
        return this.allCategories.filter(cat =>
            cat.type === 'both' || cat.type === this.state.type
        );
    }

    get title() {
        return this.props.title || _t("Cash In/Out");
    }

    setType(type) {
        this.state.type = type;
        this.state.selectedCategory = null;
    }

    selectCategory(category) {
        this.state.selectedCategory = category;
    }

    get isValid() {
        return this.state.selectedCategory &&
               this.state.amount &&
               parseFloat(this.state.amount) > 0;
    }

    async confirm() {
        if (!this.state.selectedCategory) {
            this.notification.add(_t("Please select a category"), { type: "warning" });
            return;
        }

        const parsedAmount = parseFloat(this.state.amount);
        if (!parsedAmount || parsedAmount <= 0) {
            this.notification.add(_t("Please enter a valid amount"), { type: "warning" });
            return;
        }

        try {
            const amount = this.state.type === 'out' ? -Math.abs(parsedAmount) : Math.abs(parsedAmount);

            const result = await jsonrpc("/web/dataset/call_kw/pos.session/create_cash_move", {
                model: "pos.session",
                method: "create_cash_move",
                args: [[this.pos.pos_session.id], this.state.selectedCategory.id, amount, this.state.reason],
                kwargs: {},
            });

            if (result.error) {
                this.notification.add(result.error, { type: "danger" });
                return;
            }

            const typeLabel = this.state.type === 'in' ? _t('In') : _t('Out');
            const formattedAmount = this.env.utils.formatCurrency(Math.abs(parsedAmount));
            this.notification.add(
                _t("Cash %s recorded: %s", typeLabel, formattedAmount),
                { type: "success" }
            );

            this.props.close({ confirmed: true });
        } catch (error) {
            console.error("Error creating cash move:", error);
            this.notification.add(_t("Error recording cash move"), { type: "danger" });
        }
    }

    cancel() {
        this.props.close({ confirmed: false });
    }
}

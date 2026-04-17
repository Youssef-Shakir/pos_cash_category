/** @odoo-module **/

import { PosStore } from "@point_of_sale/app/store/pos_store";
import { patch } from "@web/core/utils/patch";
import { CashCategoryPopup } from "@pos_cash_category/js/cash_category_popup";
import { _t } from "@web/core/l10n/translation";
import { jsonrpc } from "@web/core/network/rpc_service";

patch(PosStore.prototype, {
    async loadCashCategories() {
        if (this._cashCategoriesLoaded) {
            return;
        }
        if (this.config.use_cash_categories) {
            try {
                this.cashCategories = await jsonrpc("/web/dataset/call_kw/pos.session/get_cash_categories", {
                    model: "pos.session",
                    method: "get_cash_categories",
                    args: [[this.pos_session.id]],
                    kwargs: {},
                });
                this._cashCategoriesLoaded = true;
            } catch (error) {
                console.error("Error loading cash categories:", error);
                this.cashCategories = [];
            }
        } else {
            this.cashCategories = [];
        }
    },

    async cashMove() {
        if (this.config.use_cash_categories) {
            await this.loadCashCategories();

            if (this.cashCategories && this.cashCategories.length > 0) {
                this.hardwareProxy.openCashbox(_t("Cash in / out"));
                const { confirmed } = await this.popup.add(CashCategoryPopup, {
                    title: _t("Cash In/Out"),
                    type: "in",
                });
                return confirmed;
            }
        }
        return super.cashMove(...arguments);
    },
});

/** @odoo-module */

import { PosStore } from "@point_of_sale/app/store/pos_store";
import { patch } from "@web/core/utils/patch";
import { CashCategoryPopup } from "@pos_cash_category/js/cash_category_popup";
import { makeAwaitable } from "@point_of_sale/app/store/make_awaitable_dialog";
import { _t } from "@web/core/l10n/translation";

patch(PosStore.prototype, {
    async loadCashCategories() {
        if (this._cashCategoriesLoaded) {
            return;
        }
        if (this.config.use_cash_categories) {
            try {
                this.cashCategories = await this.data.call(
                    "pos.session",
                    "get_cash_categories",
                    [[this.session.id]]
                );
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
                return makeAwaitable(this.dialog, CashCategoryPopup, {
                    title: _t("Cash In/Out"),
                    type: "in",
                });
            }
        }
        return super.cashMove(...arguments);
    },
});

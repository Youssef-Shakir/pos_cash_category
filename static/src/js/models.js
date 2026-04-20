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

        const sessionId = this.pos_session?.id || this.session?.id;
        console.log("[CashCategory] Loading categories, session:", sessionId);

        try {
            this.cashCategories = await jsonrpc("/web/dataset/call_kw/pos.session/get_cash_categories", {
                model: "pos.session",
                method: "get_cash_categories",
                args: [[sessionId]],
                kwargs: {},
            });
            this._cashCategoriesLoaded = true;
            console.log("[CashCategory] Loaded categories:", this.cashCategories);
        } catch (error) {
            console.error("[CashCategory] Error loading categories:", error);
            this.cashCategories = [];
        }
    },

    async cashMove() {
        console.log("[CashCategory] cashMove called, config:", this.config);
        console.log("[CashCategory] use_cash_categories:", this.config?.use_cash_categories);

        if (this.config && this.config.use_cash_categories) {
            await this.loadCashCategories();

            if (this.cashCategories && this.cashCategories.length > 0) {
                console.log("[CashCategory] Showing custom popup");
                this.hardwareProxy.openCashbox(_t("Cash in / out"));
                const { confirmed } = await this.popup.add(CashCategoryPopup, {
                    title: _t("Cash In/Out"),
                    type: "in",
                });
                return confirmed;
            } else {
                console.log("[CashCategory] No categories, falling back to default");
            }
        } else {
            console.log("[CashCategory] Feature disabled, using default");
        }
        return super.cashMove(...arguments);
    },
});

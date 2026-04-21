/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { CashCategoryPopup } from "@pos_cash_category/js/cash_category_popup";
import { _t } from "@web/core/l10n/translation";
import { jsonrpc } from "@web/core/network/rpc_service";
import { Navbar } from "@point_of_sale/app/navbar/navbar";
import { CashMovePopup } from "@point_of_sale/app/navbar/cash_move_popup/cash_move_popup";

console.log("[CashCategory] Module loading...");

patch(Navbar.prototype, {
    async onCashMoveButtonClick() {
        console.log("[CashCategory] onCashMoveButtonClick called");
        console.log("[CashCategory] use_cash_categories:", this.pos?.config?.use_cash_categories);

        if (this.pos?.config?.use_cash_categories) {
            try {
                const sessionId = this.pos.pos_session?.id;
                console.log("[CashCategory] Loading categories for session:", sessionId);

                const categories = await jsonrpc("/web/dataset/call_kw/pos.session/get_cash_categories", {
                    model: "pos.session",
                    method: "get_cash_categories",
                    args: [[sessionId]],
                    kwargs: {},
                });

                console.log("[CashCategory] Categories loaded:", categories);

                if (categories && categories.length > 0) {
                    this.pos.cashCategories = categories;
                    await this.popup.add(CashCategoryPopup, {
                        title: _t("Cash In/Out"),
                        type: "in",
                    });
                    return;
                }
            } catch (error) {
                console.error("[CashCategory] Error:", error);
            }
        }

        // Fall back to default - open cashbox and show default popup
        this.hardwareProxy.openCashbox(_t("Cash in / out"));
        this.popup.add(CashMovePopup);
    }
});

console.log("[CashCategory] Module loaded successfully");

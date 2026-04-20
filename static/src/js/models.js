/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { CashCategoryPopup } from "@pos_cash_category/js/cash_category_popup";
import { _t } from "@web/core/l10n/translation";
import { jsonrpc } from "@web/core/network/rpc_service";
import { usePos } from "@point_of_sale/app/store/pos_hook";
import { useService } from "@web/core/utils/hooks";
import { Navbar } from "@point_of_sale/app/navbar/navbar";

console.log("[CashCategory] Module loading...");

patch(Navbar.prototype, {
    setup() {
        super.setup();
        this._cashCategoryPos = usePos();
        this._cashCategoryPopup = useService("popup");
        console.log("[CashCategory] Navbar patched");
    },

    async onCashMoveButton() {
        console.log("[CashCategory] onCashMoveButton called");
        console.log("[CashCategory] use_cash_categories:", this._cashCategoryPos?.config?.use_cash_categories);

        if (this._cashCategoryPos?.config?.use_cash_categories) {
            try {
                const sessionId = this._cashCategoryPos.pos_session?.id;
                console.log("[CashCategory] Loading categories for session:", sessionId);

                const categories = await jsonrpc("/web/dataset/call_kw/pos.session/get_cash_categories", {
                    model: "pos.session",
                    method: "get_cash_categories",
                    args: [[sessionId]],
                    kwargs: {},
                });

                console.log("[CashCategory] Categories loaded:", categories);

                if (categories && categories.length > 0) {
                    this._cashCategoryPos.cashCategories = categories;
                    await this._cashCategoryPopup.add(CashCategoryPopup, {
                        title: _t("Cash In/Out"),
                        type: "in",
                    });
                    return;
                }
            } catch (error) {
                console.error("[CashCategory] Error:", error);
            }
        }

        // Fall back to default
        return super.onCashMoveButton();
    }
});

console.log("[CashCategory] Module loaded successfully");

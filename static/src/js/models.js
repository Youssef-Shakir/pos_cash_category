/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { CashCategoryPopup } from "@pos_cash_category/js/cash_category_popup";
import { _t } from "@web/core/l10n/translation";
import { jsonrpc } from "@web/core/network/rpc_service";
import { CashMovePopup } from "@point_of_sale/app/navbar/cash_move_popup/cash_move_popup";
import { usePos } from "@point_of_sale/app/store/pos_hook";

console.log("[CashCategory] Module loading...");

patch(CashMovePopup.prototype, {
    setup() {
        super.setup();
        this.pos = usePos();
        console.log("[CashCategory] CashMovePopup patched, config:", this.pos?.config);
    },

    async confirm() {
        console.log("[CashCategory] confirm called, use_cash_categories:", this.pos?.config?.use_cash_categories);

        if (this.pos?.config?.use_cash_categories) {
            // Load categories and show custom popup
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
                    // Close current popup and open custom one
                    this.props.close();
                    await this.pos.popup.add(CashCategoryPopup, {
                        title: _t("Cash In/Out"),
                        type: "in",
                    });
                    return;
                }
            } catch (error) {
                console.error("[CashCategory] Error:", error);
            }
        }

        // Fall back to default behavior
        return super.confirm();
    }
});

console.log("[CashCategory] Module loaded successfully");

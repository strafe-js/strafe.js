"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Primary entry point for `@strafe-js/strafebot`, exporting {@link Client}, the prefix command
 * framework ({@link Command}, {@link command}, {@link CommandHandler}, {@link Context},
 * {@link ParsedArguments}, {@link ArgumentValidationError}), and re-exporting core Strafe SDK modules.
 *
 * @packageDocumentation
 */
__exportStar(require("./Client.js"), exports);
__exportStar(require("./commands/Command.js"), exports);
__exportStar(require("./commands/CommandHandler.js"), exports);
__exportStar(require("./commands/Context.js"), exports);
__exportStar(require("./commands/CommandArgument.js"), exports);
__exportStar(require("@strafe-js/util"), exports);
__exportStar(require("@strafe-js/collection"), exports);
__exportStar(require("@strafe-js/rest"), exports);
__exportStar(require("@strafe-js/ws"), exports);
__exportStar(require("@strafe-js/builders"), exports);
__exportStar(require("@strafe-js/formatters"), exports);
//# sourceMappingURL=index.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSystemSetting = void 0;
const database_1 = require("../config/database.js");
const getSystemSetting = async (key, defaultValue) => {
    const setting = await database_1.prisma.systemSetting.findUnique({
        where: { key }
    });
    if (setting) {
        return setting.value;
    }
    return defaultValue;
};
exports.getSystemSetting = getSystemSetting;
//# sourceMappingURL=settings.js.map
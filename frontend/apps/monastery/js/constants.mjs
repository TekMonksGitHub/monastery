/* 
 * (C) 2015 TekMonks. All rights reserved.
 * License: See enclosed license file.
 */
const FRONTEND = "http://localhost:8080";
const BACKEND = "http://localhost:9090";
const APP_NAME = "monastery";
const APP_PATH = `${FRONTEND}/apps/${APP_NAME}`;

export const APP_CONSTANTS = {
    FRONTEND, BACKEND, APP_PATH, APP_NAME,
    COMPONENTS_PATH: `${APP_PATH}/components`,
    MAIN_HTML: `${APP_PATH}/main.html?view=asb-designer`,

    USER_ROLE: "user",
    GUEST_ROLE: "guest",
    PERMISSIONS_MAP: {
        user:[APP_PATH+"/main.html", $$.MONKSHU_CONSTANTS.ERROR_HTML], 
        guest:[APP_PATH+"/main.html", $$.MONKSHU_CONSTANTS.ERROR_HTML]
    }
}
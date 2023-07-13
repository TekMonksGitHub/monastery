/** 
 * (C) 2015 TekMonks. All rights reserved.
 * License: See enclosed license file.
 */
const FRONTEND = "http://localhost:8080";
const BACKEND = "http://localhost:9090";
const APP_NAME = "monastery";
const APP_PATH = `${FRONTEND}/apps/${APP_NAME}`;
const API_PATH = `${BACKEND}/apps/${APP_NAME}`;

export const APP_CONSTANTS = {
    FRONTEND, BACKEND, APP_PATH, APP_NAME,
    COMPONENTS_PATH: `${APP_PATH}/components`,
    MAIN_HTML: `${APP_PATH}/main.html`,
    EXIT_HTML: `${APP_PATH}/exit.html`,
    LOGIN_HTML: `${APP_PATH}/login.html`,
    CHOOSER_HTML: `${APP_PATH}/chooser.html`,
    INDEX_HTML: `${APP_PATH}/index.html`,

    MSG_OBJECT_DRAGGED: "OBJECT_BEING_DRAGGED", 
    MSG_OBJECT_DROPPED: "OBJECT_DROPPED",

    API_LOGIN: API_PATH+"/login",
    API_CHANGEPW: API_PATH+"/changepassword",

    USERNAME: "username",
    USERORG: "userorg",
    USER_ROLE: "user",

    USER_ROLE: "user",
    GUEST_ROLE: "guest",
    PERMISSIONS_MAP: {
        user:[APP_PATH+"/index.html", APP_PATH+"/login.html", APP_PATH+"/chooser.html", APP_PATH+"/main.html", APP_PATH+"/exit.html", $$.MONKSHU_CONSTANTS.ERROR_HTML], 
        guest:[APP_PATH+"/index.html", APP_PATH+"/login.html", APP_PATH+"/exit.html", $$.MONKSHU_CONSTANTS.ERROR_HTML],
        tekmonks:["*"],
        nus:["monkruls-designer","api400-designer"]
    }
}

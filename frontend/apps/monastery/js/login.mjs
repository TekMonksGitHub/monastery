/**
 * For login.html file
 * (C) 2020 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import {application} from "./application.mjs";
import {loginmanager} from "./loginmanager.mjs"; 

async function signin(id, pw) {
    if (await loginmanager.signin(id, pw)) application.loggedIn();
}
 
export const login = {signin};
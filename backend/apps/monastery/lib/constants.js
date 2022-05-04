/* 
 * (C) 2015 TekMonks. All rights reserved.
 * License: GPL2 - see enclosed LICENSE file.
 */

const path = require("path");

APP_ROOT = `${path.resolve(`${__dirname}/../`)}`;

exports.APP_ROOT = APP_ROOT;
exports.API_DIR = `${APP_ROOT}/apis`;
exports.RET_DIR = `${APP_ROOT}/retmodel`;
exports.CONF_DIR = `${APP_ROOT}/conf`;
exports.API_LIB_DIR = `${APP_ROOT}/apis/lib`;
exports.LIB_DIR = `${APP_ROOT}/lib`;
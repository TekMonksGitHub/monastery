/* 
 * (C) 2015 TekMonks. All rights reserved.
 * License: GPL2 - see enclosed LICENSE file.
 */

const path = require("path");

exports.APP_NAME = `${path.basename(path.resolve(`${__dirname}/../../`))}`;
exports.BACKEND_ROOT = `${path.resolve(`${__dirname}/../../`)}`;

/* Constants for the FS Login subsystem */
exports.SALT_PW = "$2a$10$VFyiln/PpFyZc.ABoi4ppf";
exports.APP_DB = `${exports.BACKEND_ROOT}/db/monastery.db`;
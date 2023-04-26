/** 
 * Manages all shared information that various components
 * may need, related to the view. Relies on broadcsts or
 * members calling setters and getters.
 * (C) 2020 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */

import {blackboard} from "/framework/js/blackboard.mjs";

const repository = {};

const add = (key, value) => repository[key] = value;

const get = key => repository[key];

const subscribe = topic =>
    blackboard.registerListener(topic, message=>repository[topic]=message, true);

export const sharedInfoRepository = {add, get, subscribe};
/**
 * A repository for node tracking.
 * (C) 2020 TekMonks. All rights reserved.
 */
import {blackboard} from "/framework/js/blackboard.mjs";

const MSG_RESET = "RESET";
let NODE_REPOSITORY = {};

function init() {
    window.monkshu_env["NODE_REPOSITORY"] = nodeRepository;
    blackboard.registerListener(MSG_RESET, _ => NODE_REPOSITORY = {}, true);
}

/**
 * Registers the given node
 * @param name The node name
 * @param type The node type
 */
function registerNode(name, type) {
    if (!NODE_REPOSITORY[type]) NODE_REPOSITORY[type] = {names:[]};
    NODE_REPOSITORY[type].names.push(name);
}

/**
 * Returns a unique prefix for the given node type, based on all currently
 * registered nodes of the same type in the repository.
 * @param type The node type
 * @returns The unique prefix for this node
 */
function getNodeUniquePrefix(type) {
    if (!NODE_REPOSITORY[type]) NODE_REPOSITORY[type] = {names:[]};
    const counter = NODE_REPOSITORY[type].names.length+1;
    while (_arrayContainsCaseInsensitive(NODE_REPOSITORY[type].names, type+counter)) counter++;
    return counter;
}

const _arrayContainsCaseInsensitive = (array, string) => {for (const stringThis of array) if (string.toLowerCase() == stringThis.toLowerCase()) return true; return false;}

export const nodeRepository = {init, registerNode, getNodeUniquePrefix};
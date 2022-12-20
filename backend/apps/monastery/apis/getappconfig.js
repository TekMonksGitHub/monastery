
exports.doService = async jsonReq => {
	
	LOG.info("returning server details");

	return JSON.stringify({ "host" : "127.0.0.1" ,"port" : 9090,"adminid" : "admin","adminpassword" : "DLT4TekMonks"});
}


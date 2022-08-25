/*
 * if you have your DNS for the VPN behind a home router, your IP likely changes
 * this is an easy eay to keep it updated if you have your DNS in Cloudflare like me
 * if your router supports dynamic DNS you likely don't need/want this 
 * do `touch last.txt` in the working dir before using
 * I like to set it ip with a systemd job, also included in this repo
*/

var https = require('https');
var fs = require('fs');

var CF_KEY = "CLOUDFLARE_API_TOKEN";
var ZONE_ID = "ZONE_ID";
var IDENTIFIER = "RECORD_ID";
var DOMAIN = "DOMAIN";

https.get("https://ifconfig.co/ip", function(r) {
	r.on("data", function(body) {
		var ip = body.toString().replace("\n", "");
		console.log("[i] current WAN IP:", ip);
		// has it changed?
		var last_ip = fs.readFileSync("last.txt").toString().replace("\n", "");
		console.log("[i] last WAN IP:", last_ip);
		if (ip == last_ip) {
			console.log("[+] no change in IP detected, exiting");
			process.exit();
		}	
		console.log("[i] IP has changed, updating the CF record");
		// if so, update a rec in CF
		// for the record https://api.cloudflare.com/#dns-records-for-a-zone-patch-dns-record
		var opts = {
			"method": "PATCH",
			"hostname": "api.cloudflare.com",
			"path": "/client/v4/zones/" + ZONE_ID + "/dns_records/" + IDENTIFIER,
			"headers": {
				"Content-Type": "application/json",
				"Authorization": "Bearer " + CF_KEY
			}
		};
		var cfreq = https.request(opts, function(r) {
			r.on("data", function(body) {
				console.log("[+] CF record updated:", body.toString());
				fs.writeFileSync("last.txt", ip);
			});			

			r.on("error", function(e) {
				console.log("[!] failed to update CF record:", e);
			});
		});
		cfreq.write(JSON.stringify({
			"type": "A", 
			"name": DOMAIN,
			"content": ip
		}));
		cfreq.end();
	});

	r.on("error", function(e) {
		console.log("[!] could not get current WAN IP:", e);
	});
});

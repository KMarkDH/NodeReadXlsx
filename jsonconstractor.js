var fs = require("fs")
var config = require("./config.js");

function fucCheckLength(strTemp) {
    var i, sum;
    sum = 0;
    for (i = 0; i < strTemp.length; i++) {
        if ((strTemp.charCodeAt(i) >= 0) && (strTemp.charCodeAt(i) <= 255))
            sum = sum + 1;
        else
            sum = sum + 2;
    }
    return sum;
}

exports.construct = function (packageList) {
    var header = new Array();
    var offset = 0;
    var totalStr = new String();
    var headers = new Array();
    packageList.forEach(function (_val, _key, _map) {
        if (_val[0].config.experttype == "c++" || _val[0].config.experttype == "C++" || _val[0].config.experttype == "json" || _val[0].config.experttype == "Json" || _val[0].config.experttype == "all") {

            var listLen = _val.length;
            var jsonArray = new Array();
            var package = _val[0].config.package;

            for (var i = 0; i < listLen; ++i) {
                var tableid = _val[i].config.tableid;
                var pkgObject = _val[i];
                if (tableid != -1) {
                    var object = { Id: new Number(tableid), Content: pkgObject.datas };
                    jsonArray.push(object);
                    // console.log(object);
                } else {
                    jsonArray = pkgObject.datas;
                }
            }

            if (fs.existsSync(config.outPutDir + "/backjsondata") == false) {
                fs.mkdirSync(config.outPutDir + "/backjsondata");
            }
            fs.writeFileSync(config.outPutDir + "/backjsondata/" + package + ".json", JSON.stringify({list:jsonArray}));
            var buf = new Buffer(JSON.stringify({list:jsonArray}), 'utf8').toString('base64');

            headers.push({ xxx: package, ccc: offset, vvv: buf.length });
            offset += buf.length;
            totalStr += buf;
        }
    });

    if (fs.existsSync(config.outPutDir + "/gamedatas") == false) {
        fs.mkdirSync(config.outPutDir + "/gamedatas");
    }

    if (fs.existsSync(config.outPutDir + "/gamedatas") == false) {
        fs.mkdirSync(config.outPutDir + "/gamedatas");
    }

    if (fs.existsSync(config.outPutDir + "/gamedatas/testtotal.gd") == true) {
        fs.unlinkSync(config.outPutDir + "/gamedatas/testtotal.gd");
    }

    var headerbuf = new Buffer(JSON.stringify(headers), 'utf8').toString('base64');
    var headerlength = headerbuf.length.toString();
    var perfix = "";
    for (var i = 0; i < (config.jsonheadlength - headerlength.length); ++i)
    {
        perfix += "0";
    }
    headerlength = perfix + headerlength;
    var writeBuffer = headerlength + headerbuf + totalStr;

    fs.writeFileSync(config.outPutDir + "/gamedatas/" + config.jsonoutname, writeBuffer);
}
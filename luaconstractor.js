var fs = require("fs")
var config = require("./config.js");
var multiFileStr = "";

exports.construct = function (packageList) {
    if (fs.existsSync(config.outPutDir) == false) {
        fs.mkdirSync(config.outPutDir);
    }
    if (fs.existsSync(config.outPutDir + "/DataReaderLua") == false) {
        fs.mkdirSync(config.outPutDir + "/DataReaderLua");
    }

    InitFileWriter(packageList);
    packageList.forEach(function (_val, _key, _map) {
        if (_val[0].config.experttype == "lua" || _val[0].config.experttype == "Lua" || _val[0].config.experttype == "all") {
            var tableId = _val[0].config.tableid;
            var package = _val[0].config.package;
            multiFileStr = "local List = {\n"
            MultiFileWriter(_val);
            multiFileStr += "\t\t\t}\n"
            multiFileStr += "DSDataList." + package + " = List";
            fs.writeFileSync(config.outPutDir + "/DataReaderLua/" + package + ".lua", multiFileStr, "utf-8");
        }
    });

}

var SingleFileWriter = function (_list) {
    var len = _list.datas.length;
    var proto = _list.prototype;
    var package = _list.config.package;
    var writeStr = "local List = {\n";
    for (var i = 0; i < len; ++i) {
        var data = _list.datas[i];
        var id = data.Id;
        writeStr += "\t\t\t\t\t[" + id + "] = {";
        for (var j = 0; j < proto.length; ++j) {
            var name = proto[j].name;
            var type = proto[j].type;
            if (type == "String" || type == "string") {
                writeStr += name + "=\"" + data[name] + "\"";
            } else {
                writeStr += name + "=" + data[name];
            }
            if (j < proto.length - 1) {
                writeStr += ",";
            }
        }
        if (i < len - 1) {
            writeStr += "},\n";
        } else {
            writeStr += "}\n";
        }
    }
    writeStr += "\t\t\t}\n";
    writeStr += "DSDataList." + package + " = List";
    fs.writeFileSync(config.outPutDir + "/DataReaderLua/" + package + ".lua", writeStr, "utf-8");
}

var MultiFileWriter = function (list) {
    var totalLen = list.length;
    for (var i = 0; i < totalLen; ++i) {
        var package = list[i].config.package;
        var tid = list[i].config.tableid;
        var count = 0;
        for (var j = 0; j < totalLen; ++j) {
            var ttid = list[j].config.tableid;
            if ((tid == ttid) && (ttid != -1)) {
                count++;
            }
        }
        if (count > 1) {
            console.error("Error Duplicate TABLEID in table " + package);
        }
    }

    for (var k = 0; k < totalLen; ++k) {
        var obj = list[k];
        var tableId = obj.config.tableid;
        var content = obj.datas;
        var tab = "\t\t\t\t\t";
        if (tableId != -1) {
            multiFileStr += "\t\t\t\t\t[" + tableId + "] = {\n";
            tab = "\t\t\t\t\t\t\t\t\t\t";
        } else {
            for (var i = 0; i < len; ++i) {
                var package = obj.config.package;
                var tid = obj.config.Id;
                var count = 0;
                for (var j = 0; j < totalLen; ++j) {
                    var ttid = obj.config.Id;
                    if ((tid == ttid) && (ttid != -1)) {
                        count++;
                    }
                }
                if (count > 1) {
                    console.error("Error : Duplicate ID in table " + package);
                }
            }
        }

        var len = content.length;
        var proto = obj.prototype;
        for (var i = 0; i < len; ++i) {
            var data = obj.datas[i];
            var id = data.Id;
            multiFileStr += tab + "[" + id + "] = {";
            for (var j = 0; j < proto.length; ++j) {
                var name = proto[j].name;
                var type = proto[j].type;
                if (type == "String" || type == "string") {
                    multiFileStr += name + "=\"" + data[name] + "\"";
                } else {
                    multiFileStr += name + "=" + data[name];
                }
                if (j < proto.length - 1) {
                    multiFileStr += ",";
                }
            }
            if (i < len - 1) {
                multiFileStr += "},\n";
            } else {
                multiFileStr += "}\n";
            }
        }

        if (tableId != -1) {
            if (k < totalLen - 1) {
                multiFileStr += "\t\t\t\t\t\t\t\t},\n";
            } else {
                multiFileStr += "\t\t\t\t\t\t\t\t}\n";
            }
        }
    }
}

var cheakDuplicateId = function (list) {

}

var InitFileWriter = function (list) {
    var writeStr = "--NOTE: This file is auto generate by tools.Please DO NOT modified.\n";
    writeStr += "DSDataList = {}\n"
    list.forEach(function (_val, _key, _map) {
        var package = _val[0].config.package;
        if (_val[0].config.experttype == "lua" || _val[0].config.experttype == "Lua" || _val[0].config.experttype == "all") {
            writeStr += "require \"src/DataReaderLua/" + package + ".lua\"\n";
        }
    });
    fs.writeFileSync(config.outPutDir + "/DataReaderLua/init.lua", writeStr, "utf-8");
}
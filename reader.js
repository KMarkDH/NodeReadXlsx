var xlsx = require("node-xlsx");
var fs = require("fs");
var util = require('util');

exports.read = function (_filepath) {
    if (fs.existsSync(_filepath) == true) {
        var xlsxObj = xlsx.parse(_filepath);

        var _datas = xlsxObj[0].data;
        var _configs = xlsxObj[1].data;

        var strs = _filepath.toString().split('%');
        var tableId = -1;
        if (strs.length > 1) {
            tableId = strs[strs.length - 1].toString().split('.')[0];
        }

        var _config = { package: (_configs[1][0]), experttype: (_configs[1][1]), tableid: tableId };
        var _datanames = _datas[0];
        var _datatypes = _datas[1];
        var _description = _datas[2];
        var _prototype = new Array();
        for (var i = 0; i < _datanames.length; ++i) {
            if ((_datanames[i] != "Description") && (_datanames[i] != "Des") && (_datanames[i] != "Descrption")) {
                var newObj = new Object();
                newObj.name = _datanames[i];
                newObj.type = _datatypes[i];
                _prototype[i] = newObj;
            }
        }
        var _dataObjsList = new Array();

        for (var i = 3; i < _datas.length; ++i) {
            var _meta = _datas[i];
            if (_meta.length > 0 && _meta[0]) {
                var newObj = new Object();
                for (var j = 0; j < _datanames.length; ++j) {
                    if ((_datanames[j] != "Description") && (_datanames[j] != "Des") && (_datanames[j] != "Descrption")) {
                        var value = new String(_meta[j]);
                        if (_datatypes[j] == "Int" || _datatypes[j] == "int") {
                            newObj[_datanames[j]] = Number(util.format("%d", value));
                        } else if (_datatypes[j] == "String" || _datatypes[j] == "string") {
                            newObj[_datanames[j]] = value;
                        } else if (_datatypes[j] == "Float" || _datatypes[j] == "float") {
                            newObj[_datanames[j]] = Number(util.format("%f", value));
                        }
                    }
                }
                _dataObjsList[i - 3] = newObj;
            }
        }

        _dataObjsList.sort(function (a, b) {
            if (a.Id > b.Id) {
                return true;
            } else if (a.Id < b.Id) {
                return false;
            } else {
                console.assert(false, "[ERROR MESSAGE] Table " + _config.package + " Error: Duplicate Id " + a.Id);
                return true;
            }
        });

        var pro_data = { config: _config, datas: _dataObjsList, prototype: _prototype };
        return pro_data;
    }
    else {
        console.assert(false, "File :" + _filepath + " is not Exist!");
        return null;
    }
}
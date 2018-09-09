#!/usr/bin/env node

/**
 * Module dependencies.
 */

var program = require('commander');
var config = require('./config.js');
var assert = require('assert');

program
  .version('0.1.0')
  .option('-s, --source <n>', 'Add source path')
  .option('-d, --output <n>', 'Add output path')
  .parse(process.argv);

if (program.source) config.sourceDir = program.source;
if (program.output) config.outPutDir = program.output;

var xlsxReader = require("./reader.js");
var cppconstructor = require("./cppconstractor.js");
var jsonconstractor = require("./jsonconstractor.js");
var luaconstractor = require("./luaconstractor.js");
var fs = require("fs")
var packageList = new Map();

var readXlsxFile = function (path) {
  var _path = path;
  var obj = xlsxReader.read(_path);
  var _pack = obj.config.package;

  if (_pack != null) {
    if (packageList.get(_pack)) {
      var list = packageList.get(_pack);
      if (obj.config.tableid == -1) {
        list[0].datas = list[0].datas.concat(obj.datas);
        list[0].datas.sort(function(a, b){
          if (a.Id > b.Id) {
            return true;
          } else if(a.Id < b.Id) {
            return false;
          } else {
            console.assert(false, "[ERROR MESSAGE] Table "+_pack+" Error: Duplicate Id " + a.Id);
            return true;
          }
        });
      }else{
        list.push(obj);
      }
      
    } else {
      var _arr = new Array();
      _arr.push(obj);
      packageList.set(_pack, _arr);
    }
  }
}

var checkPath = function (path) {
  var _path = path;
  if (_path.search(".DS_Store") == -1) {
    if (fs.existsSync(_path)) {
      if (fs.statSync(_path).isDirectory()) {
        var dirList = fs.readdirSync(_path)
        for (var i = 0; i < dirList.length; ++i) {
          var subPath = dirList[i];
          checkPath(_path + "/" + subPath);
        }
      } else if (_path.search(".xlsx") > 0) {
        readXlsxFile(_path);
      }
    } else {
      console.error("wrong path : " + _path);
    }
  }
}

checkPath(config.sourceDir);

console.log("Begin to write Datas");

jsonconstractor.construct(packageList);
luaconstractor.construct(packageList);
cppconstructor.construct(packageList);

console.log("Data generated successfully!");
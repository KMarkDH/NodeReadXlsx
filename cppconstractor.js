var fs = require("fs");
var config = require('./config.js');

var generateProtoType = function (package, obj) {
    if (obj.prototype) {
        var afterFix = "";
        if (obj.config.tableid != -1) {
            afterFix = "Content";
            var _wirteStrs = new String();
            _wirteStrs += "//THIS FILE IS AUTO EXPROTED!PLEASE DO NOT MODIFY.";
            _wirteStrs += "\n#include \"cocos2d.h\"\n";
            _wirteStrs += "\nclass " + package + afterFix + ";"
            _wirteStrs += "\nclass " + package + "\n{";
            _wirteStrs += "\n\tCC_SYNTHESIZE(int, m_Id, Id);";
            _wirteStrs += "\n\tpublic:";
            _wirteStrs += "\n\tstd::map<int, " + package + afterFix + "*> ContentList;";
            _wirteStrs += "\n};";
            fs.writeFileSync(config.outPutDir + "/DataReader/" + package + ".h", _wirteStrs, { encoding: "utf-8" });
        }

        var prototype = obj.prototype;
        var writeWarnigs = "//THIS FILE IS AUTO EXPROTED!PLEASE DO NOT MODIFY.";
        var writeHeads = "\n#include \"cocos2d.h\"\n";
        var startline = "\nclass " + package + afterFix + "\n{";
        var contentlines = new Array();
        var endline = "\n};";
        for (var i = 0; i < prototype.length; ++i) {
            var type = prototype[i].type;
            var name = prototype[i].name;
            var line = new String();
            if (type == "Int" || type == "int") {
                line = "\n\tCC_SYNTHESIZE(int, m_" + name + ", " + name + ");";
            } else if (type == "Float" || type == "float") {
                line = "\n\tCC_SYNTHESIZE(float, m_" + name + ", " + name + ");";
            } else if (type == "String" || type == "string") {
                line = "\n\tCC_SYNTHESIZE(std::string, m_" + name + ", " + name + ");";
            }
            contentlines[i] = line;
        }
        var strs = writeWarnigs + writeHeads + startline;
        for (var i = 0; i < contentlines.length; ++i) {
            strs += contentlines[i];
        }
        strs += endline;
        fs.writeFileSync(config.outPutDir + "/DataReader/" + package + afterFix + ".h", strs, { encoding: "utf-8" });
    } else {
        console.assert(false, "Could not find prototype");
    }
}

var generateFileReadSystem = function (package, obj) {
    var prototype = obj.prototype;
    var tableId = obj.config.tableid;
    var str = "";
    str += "protected:\n";
    str += "    void read" + package + "Json();\n";
    str += "private:\n";
    str += "    std::map<int, " + package + "*> m_map" + package + ";\n";
    str += "public:\n";
    str += "    inline " + "std::map<int, " + package + "*>& get" + package + "Map()\n";
    str += "    {\n";
    str += "        return m_map" + package + ";\n";
    str += "    }\n\n";
    str += "    inline " + package + "* get" + package + "MapAtIndex(int index)\n";
    str += "    {\n";
    str += "        if (m_map" + package + ".find(index) != m_map" + package + ".end())\n";
    str += "            return m_map" + package + ".at(index);\n";
    str += "        else\n";
    str += "            return nullptr;\n"
    str += "    }\n\n";

    var fd = fs.openSync(config.outPutDir + "/DataReader/" + "DSFileSystem.h", "a+");
    fs.appendFileSync(fd, str);
    fs.closeSync(fd);

    str = "";
    var fd = fs.openSync(config.outPutDir + "/DataReader/" + "DSFileSystem.cpp", "a+");
    str += "void DSFileSystem::" + "read" + package + "Json()\n";
    str += "{\n";
    str += "    if (nullptr == m_fileBuffer) return;\n"
    str += "    FileConfig* config = nullptr;\n";
    str += "    if (m_fileConfig.find(\"" + package + "\") != m_fileConfig.end())\n";
    str += "        config = m_fileConfig.at(\"" + package + "\");\n";
    str += "    if (nullptr == config) return;\n";
    str += "    std::string cipher =  m_fileBuffer->substr(config->startpos, config->length);\n"
    str += "    std::string buffer(\"\");\n";
    str += "    CryptoPP::StringSource(cipher, true, new CryptoPP::Base64Decoder(new CryptoPP::StringSink(buffer)));\n";
    str += "    rapidjson::Document d;\n";
    str += "    d.Parse(buffer.c_str());\n";
    str += "    if (d.HasParseError())\n";
    str += "    {\n";
    str += "        CCLOG(\"Get Parse Error\");\n";
    str += "    }\n";
    str += "    else if (d.HasMember(\"list\"))\n";
    str += "    {\n";
    str += "        const rapidjson::Value &a=d[\"list\"];\n";
    str += "        if (a.IsArray())\n";
    str += "        {\n";
    str += "            for(unsigned int i = 0; i < a.Size(); ++i)\n";
    str += "            {\n";
    str += "                const rapidjson::Value &val = a[i];\n";
    if (tableId != -1) {
        str += "                " + package + "* obj = new " + package + "();\n";
        str += "                int value1 = val[\"Id\"].GetInt();\n";
        str += "                obj->setId(value1);\n";


        str += "                const rapidjson::Value &data=val[\"Content\"];\n";
        str += "                if (data.IsArray())\n";
        str += "                {\n";
        str += "                    for(unsigned int i = 0; i < data.Size(); ++i)\n";
        str += "                    {\n";
        str += "                        const rapidjson::Value &_val = data[i];\n";
        str += "                        " + package + "Content* _obj = new " + package + "Content();\n";
        for (var i = 0; i < prototype.length; ++i) {
            var type = prototype[i].type;
            var name = prototype[i].name;
            if (type == "Int" || type == "int") {
                str += "                        int value" + i + " = _val[\"" + name + "\"].GetInt();\n";
            } else if (type == "Float" || type == "float") {
                str += "                        float value" + i + " = _val[\"" + name + "\"].GetFloat();\n";
            } else if (type == "String" || type == "string") {
                str += "                        std::string value" + i + " = _val[\"" + name + "\"].GetString();\n";
            }
            str += "                        _obj->set" + name + "(value" + i + ");\n";
        }
        str += "                        obj->ContentList.insert(std::make_pair(_obj->getId(), _obj));\n";
        str += "                    }\n";
        str += "                    m_map" + package + ".insert(std::make_pair(obj->getId(), obj));\n";
        str += "                }\n";
    } else {
        str += "                " + package + "* obj = new " + package + "();\n";
        for (var i = 0; i < prototype.length; ++i) {
            var type = prototype[i].type;
            var name = prototype[i].name;
            if (type == "Int" || type == "int") {
                str += "                int value" + i + " = val[\"" + name + "\"].GetInt();\n";
            } else if (type == "Float" || type == "float") {
                str += "                float value" + i + " = val[\"" + name + "\"].GetFloat();\n";
            } else if (type == "String" || type == "string") {
                str += "                std::string value" + i + " = val[\"" + name + "\"].GetString();\n";
            }
            str += "                obj->set" + name + "(value" + i + ");\n";
        }
        str += "                m_map" + package + ".insert(std::make_pair(obj->getId(), obj));\n";
    }
    str += "            }\n";
    str += "        }\n";
    str += "    }\n";
    str += "}\n\n";
    fs.appendFileSync(fd, str);
    fs.closeSync(fd)
}

// exports.construct = function (package, obj) {

//     generateProtoType(package, obj);
//     generateFileReadSystem(package, obj);
// }

var constructFileReaderHead = function () {
    if (fs.existsSync(config.outPutDir) == false) {
        fs.mkdirSync(config.outPutDir);
    }
    if (fs.existsSync(config.outPutDir + "/DataReader") == false) {
        fs.mkdirSync(config.outPutDir + "/DataReader");
    }
    var str = "//THIS FILE IS AUTO EXPROTED!PLEASE DO NOT MODIFY.\n";
    str += "\n#include \"cocos2d.h\"\n";
    str += "\n#include \"DSFileSystemHeaders.h\"\n";
    str += "\nstruct FileConfig\n";
    str += "{\n";
    str += "    std::string name;\n";
    str += "    size_t startpos;\n";
    str += "    size_t length;\n";
    str += "};\n\n";
    str += "class DSFileSystem\n";
    str += "{\n";
    str += "private:\n";
    str += "    static DSFileSystem* s_instance;\n";
    str += "    bool m_hasRead = false;\n";
    str += "    std::string* m_fileBuffer = nullptr;\n";
    str += "    const char* m_filePath = \"res/gamedatas/" + config.jsonoutname + "\";\n" ;
    str += "    const int m_fileHeadLength = " + config.jsonheadlength.toString() + ";\n";
    str += "    std::map<std::string, FileConfig*> m_fileConfig;\n"
    str += "public:\n";
    str += "    static DSFileSystem* getInstance();\n";
    str += "protected:"
    str += "    void readJsonConfigFile();\n";
    str += "    void clearFileBuffer();\n";

    var fd = fs.openSync(config.outPutDir + "/DataReader/" + "DSFileSystem.h", "a+");
    fs.appendFileSync(fd, str);
    fs.closeSync(fd);

    str = "//THIS FILE IS AUTO EXPROTED!PLEASE DO NOT MODIFY.\n";
    var fd = fs.openSync(config.outPutDir + "/DataReader/" + "DSFileSystem.cpp", "a+");
    str += "#include \"DSFileSystem.h\"\n";
    str += "#include \"external/json/document.h\"\n";
    str += "#include \"StaticData/StaticData.h\"\n";
    str += "#include \"utils/cryptoSC/hex.h\"\n";
    str += "#include \"utils/cryptoSC/base64.h\"\n";
    str += "#include \"utils/AesWrapper.h\"\n";
    str += "DSFileSystem* DSFileSystem::s_instance = nullptr;\n\n";
    str += "DSFileSystem* DSFileSystem::getInstance()";
    str += "{\n";
    str += "    if (s_instance == nullptr)\n";
    str += "    {\n";
    str += "        s_instance = new DSFileSystem();\n";
    str += "    }\n";
    str += "    return s_instance;\n";
    str += "}\n\n";
    str += "void DSFileSystem::readJsonConfigFile()\n";
    str += "{\n";
    str += "    if (m_fileBuffer == nullptr)\n";
    str += "    {\n";
    str += "        m_fileBuffer = new std::string(FileUtils::getInstance()->getStringFromFile(m_filePath));\n";
    str += "    }\n";
    str += "    if (m_fileConfig.size() == 0)\n";
    str += "    {";
    str += "        int config_size = atoi(m_fileBuffer->substr(0, m_fileHeadLength).c_str());\n"
    str += "        std::string cipher = m_fileBuffer->substr(m_fileHeadLength, config_size);\n";
    str += "        std::string plaintext(\"\");\n";
    str += "        CryptoPP::StringSource(cipher, true, new CryptoPP::Base64Decoder(new CryptoPP::StringSink(plaintext)));\n";
    str += "        rapidjson::Document d;\n";
    str += "        d.Parse(plaintext.c_str());\n";
    str += "        if (!d.HasParseError())\n";
    str += "        {\n";
    str += "            if (d.IsArray())\n";
    str += "            {\n";
    str += "                for (size_t i = 0; i < d.Size(); ++i)\n";
    str += "                {\n";
    str += "                    FileConfig* config = new FileConfig();\n";
    str += "                    const rapidjson::Value &val = d[i];\n";
    str += "                    config->name = val[\"xxx\"].GetString();\n";
    str += "                    config->startpos = val[\"ccc\"].GetInt() + config_size + m_fileHeadLength;\n";
    str += "                    config->length = val[\"vvv\"].GetInt();\n";
    str += "                    m_fileConfig.insert(std::make_pair(config->name, config));\n";
    str += "                }\n";
    str += "            }\n";
    str += "        }\n";
    str += "    }\n";
    str += "}\n\n";
    str += "void DSFileSystem::clearFileBuffer()\n";
    str += "{\n";
    str += "    CC_SAFE_DELETE(m_fileBuffer);\n";
    str += "    m_fileBuffer = nullptr;\n";
    str += "}\n\n";
    fs.appendFileSync(fd, str);
    fs.closeSync(fd)


}

var constructFileReaderTail = function (_map) {
    var str = "public:\n";
    str += "    void readAllConfigs();\n";
    str += "};";

    var fd = fs.openSync(config.outPutDir + "/DataReader/" + "DSFileSystem.h", "a+");
    fs.appendFileSync(fd, str);
    fs.closeSync(fd);

    var fd = fs.openSync(config.outPutDir + "/DataReader/" + "DSFileSystem.cpp", "a+");
    var str = "void DSFileSystem::readAllConfigs()";
    str += "{\n";
    str += "    readJsonConfigFile();\n";
    var index = 0;
    var mapCPPlen = 0;
    _map.forEach(function (_value, _key, _map) {
        if (_value[0].config.experttype == "c++" || _value[0].config.experttype == "C++" || _value[0].config.experttype == "all") {
            mapCPPlen++;
        }
    });
    var caseCounter = 0;
    _map.forEach(function (_value, _key, _map) {
        if (_value[0].config.experttype == "c++" || _value[0].config.experttype == "C++" || _value[0].config.experttype == "all") {
            str += "    read" + _key + "Json();\n";
        }
    });
    str += "    clearFileBuffer();\n";
    str += "}\n\n";
    fs.appendFileSync(fd, str);
    fs.closeSync(fd)
}

var constructFileReaderHeaders = function (map) {
    var str = "//THIS FILE IS AUTO EXPROTED!PLEASE DO NOT MODIFY.\n";

    map.forEach(function (_value, _key, _map) {
        if (_value[0].config.experttype == "c++" || _value[0].config.experttype == "C++" || _value[0].config.experttype == "all") {
            var tableId = _value[0].config.tableid;
            if (tableId == -1) {
                str += "#include \"" + _key + ".h\"\n";
            } else {
                str += "#include \"" + _key + ".h\"\n";
                str += "#include \"" + _key + "Content.h\"\n";
            }
        }
    });
    str += "#include \"ciphertool/DataCipherTool.h\"";

    var fd = fs.openSync(config.outPutDir + "/DataReader/" + "DSFileSystemHeaders.h", "a+");
    fs.appendFileSync(fd, str);
    fs.closeSync(fd);
}

var constructFileReaderDecipher = function () {
    var str = "";
    str += "protected:\n";
    str += "    std::string decipherString(std::string cipher);\n"

    var fd = fs.openSync(config.outPutDir + "/DataReader/" + "DSFileSystem.h", "a+");
    fs.appendFileSync(fd, str);
    fs.closeSync(fd);

    str = "";
    str += "std::string DSFileSystem::decipherString(std::string cipher) \n\
{\n\
    if (JSON_ENCODE)\n\
    {\n\
        return DataToolCipherTool::decrypt(cipher, JSON_CIPHER_KEY);\n\
    }\n\
    else\n\
    {\n\
        return cipher;\n\
    }\n\
}\n\n";
    
    var fd = fs.openSync(config.outPutDir + "/DataReader/" + "DSFileSystem.cpp", "a+");
    fs.appendFileSync(fd, str);
    fs.closeSync(fd);
}

exports.construct = function (packageList) {
    if (fs.existsSync(config.outPutDir) == false) {
        fs.mkdirSync(config.outPutDir);
    }
    if (fs.existsSync(config.outPutDir + "/DataReader") == false) {
        fs.mkdirSync(config.outPutDir + "/DataReader");
    }
    constructFileReaderHeaders(packageList);
    constructFileReaderHead();
    constructFileReaderDecipher();
    packageList.forEach(function (_val, _key, _map) {
        if (_val[0].config.experttype == "c++" || _val[0].config.experttype == "C++" || _val[0].config.experttype == "all") {
            var element = _val[0];
            generateProtoType(element.config.package, element);
            generateFileReadSystem(element.config.package, element);
        }
    });
    constructFileReaderTail(packageList);
}
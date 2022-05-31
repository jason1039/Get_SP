"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ConnecSql_1 = __importDefault(require("./ConnecSql"));
const dialog_node_1 = __importDefault(require("dialog-node"));
class Start {
    constructor() {
        this.UserID = ``;
        this.Pwd = ``;
        this.Path = ``;
        this.database = ``;
        this.serverName = ``;
        this.Start();
    }
    Start() {
        return __awaiter(this, void 0, void 0, function* () {
            let _UserID = ``;
            let _Pwd = ``;
            let _Path = ``;
            let _database = ``;
            let _serverName = ``;
            let _this = this;
            dialog_node_1.default.entry("輸入Windows帳號！", "輸入視窗", 10000, setUserID);
            function setUserID(code, user, stderr) {
                if (!user)
                    return;
                _UserID = user;
                dialog_node_1.default.entry("輸入Windows密碼！", "輸入視窗", 10000, setPassword);
            }
            function setPassword(code, pwd, stderr) {
                if (!pwd)
                    return;
                _Pwd = pwd;
                dialog_node_1.default.fileselect("選擇SP資料夾！", "輸入視窗", 10000, setSPPath);
            }
            function setSPPath(code, path, stderr) {
                if (!path)
                    return;
                _Path = path;
                dialog_node_1.default.entry("輸入DataBase！", "輸入視窗", 10000, setDatabase);
            }
            function setDatabase(code, db, stderr) {
                if (!db)
                    return;
                _database = db;
                dialog_node_1.default.entry("輸入ServerName！", "輸入視窗", 10000, setServerName);
            }
            function setServerName(code, server, stderr) {
                var _a;
                return __awaiter(this, void 0, void 0, function* () {
                    if (!server)
                        return;
                    _serverName = server;
                    _this.UserID = _UserID;
                    _this.Pwd = _Pwd;
                    _this.serverName = _serverName;
                    _this.database = _database;
                    _this.Path = _Path.replace("\r", "").replace("\n", "");
                    _this.CreateServer();
                    yield ((_a = _this.Server) === null || _a === void 0 ? void 0 : _a.Start());
                });
            }
        });
    }
    CreateServer() {
        this.Server = new ConnecSql_1.default({
            WindowsSecurity: true,
            UserID: this.UserID,
            Password: this.Pwd,
            database: this.database,
            server: this.serverName,
            TrustServerCertificate: true
        }, this.Path);
    }
}
exports.default = Start;

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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mssql_1 = __importDefault(require("mssql"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class Connect {
    constructor(server, ProcedurePath) {
        this.FilePathList = {};
        this.List = [];
        this.ServerConfig = server;
        this.ConnectionString = this.CreateConnectionString();
        this.ProcedurePath = ProcedurePath;
        this.setFilePathList(this.ProcedurePath);
        // console.log(this.FilePathList);
    }
    CreateConnectionString() {
        let connectAry = [];
        connectAry.push(`Persist Security Info=False`);
        connectAry.push(`Integr Security=${this.ServerConfig.WindowsSecurity}`);
        connectAry.push(`database=${this.ServerConfig.database}`);
        connectAry.push(`server=${this.ServerConfig.server}`);
        connectAry.push(`TrustServerCertificate=${this.ServerConfig.TrustServerCertificate}`);
        connectAry.push(`User ID=${this.ServerConfig.UserID}`);
        connectAry.push(`Password=${this.ServerConfig.Password}`);
        return connectAry.join(`;`);
    }
    Start() {
        var e_1, _a;
        return __awaiter(this, void 0, void 0, function* () {
            let starttime = Date.now();
            if (!fs_1.default.existsSync(path_1.default.join(this.ProcedurePath, "NewSP")))
                fs_1.default.mkdirSync(path_1.default.join(this.ProcedurePath, "NewSP"));
            yield this.Connect();
            yield this.StoreProcedureList();
            try {
                for (var _b = __asyncValues(this.List), _c; _c = yield _b.next(), !_c.done;) {
                    let item = _c.value;
                    yield this.GetStoreProcedureContent(item);
                    if (this.FilePathList[`${item.Name}.sql`] != undefined) {
                        let temp = fs_1.default.readFileSync(path_1.default.join(this.FilePathList[`${item.Name}.sql`], `${item.Name}.sql`), 'utf-8');
                        if (temp != item.Content)
                            fs_1.default.writeFileSync(path_1.default.join(this.FilePathList[`${item.Name}.sql`], `${item.Name}.sql`), item.Content);
                    }
                    else {
                        fs_1.default.writeFileSync(path_1.default.join(this.ProcedurePath, "NewSP", `${item.Name}.sql`), item.Content);
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) yield _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            yield this.Close();
            let endtime = Date.now();
            console.log(`Use time : ${endtime - starttime}`);
        });
    }
    setFilePathList(_path) {
        let ary = fs_1.default.readdirSync(_path, { withFileTypes: true });
        let fileLi = ary.filter(i => !i.isDirectory() && /.*\.sql/.test(i.name));
        let folderLi = ary.filter(i => i.isDirectory());
        fileLi.forEach(i => {
            this.FilePathList[i.name] = _path;
        });
        folderLi.forEach(i => {
            this.setFilePathList(path_1.default.join(_path, i.name));
        });
    }
    StoreProcedureList() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let li = yield ((_a = this.pool) === null || _a === void 0 ? void 0 : _a.query(`SELECT SPECIFIC_NAME FROM LM_DEV_II.INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_TYPE = 'PROCEDURE' AND ROUTINE_BODY = 'SQL'`));
            li === null || li === void 0 ? void 0 : li.recordset.forEach(i => {
                this.List.push({ Name: i.SPECIFIC_NAME, Content: `` });
            });
        });
    }
    GetStoreProcedureContent(StoreProceedure) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let Result = ``;
            let content = yield ((_a = this.pool) === null || _a === void 0 ? void 0 : _a.query(`sp_helptext '${StoreProceedure.Name}' ;`));
            content === null || content === void 0 ? void 0 : content.recordset.forEach(row => {
                Result += row.Text;
            });
            StoreProceedure.Content = Result;
        });
    }
    Connect() {
        return __awaiter(this, void 0, void 0, function* () {
            this.pool = yield mssql_1.default.connect(this.ConnectionString);
        });
    }
    Close() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            yield ((_a = this.pool) === null || _a === void 0 ? void 0 : _a.close());
        });
    }
}
exports.default = Connect;

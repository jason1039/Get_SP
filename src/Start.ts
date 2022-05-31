import Connect from './ConnecSql';
import dialog from 'dialog-node';
export default class Start {
    private UserID: string = ``;
    private Pwd: string = ``;
    private Path: string = ``;
    private database: string = ``;
    private serverName: string = ``;
    private Server?: Connect;
    constructor() {
        this.Start();
    }
    private async Start(): Promise<void> {
        let _UserID: string = ``;
        let _Pwd: string = ``;
        let _Path: string = ``;
        let _database: string = ``;
        let _serverName: string = ``;
        let _this = this;
        dialog.entry("輸入Windows帳號！", "輸入視窗", 10000, setUserID);
        function setUserID(code: any, user: string, stderr: any): void {
            if (!user) return;
            _UserID = user;
            dialog.entry("輸入Windows密碼！", "輸入視窗", 10000, setPassword);
        }
        function setPassword(code: any, pwd: string, stderr: any): void {
            if (!pwd) return;
            _Pwd = pwd;
            dialog.fileselect("選擇SP資料夾！", "輸入視窗", 10000, setSPPath);
        }
        function setSPPath(code: any, path: string, stderr: any): void {
            if (!path) return;
            _Path = path;
            dialog.entry("輸入DataBase！", "輸入視窗", 10000, setDatabase);
        }
        function setDatabase(code: any, db: string, stderr: any): void {
            if (!db) return;
            _database = db;
            dialog.entry("輸入ServerName！", "輸入視窗", 10000, setServerName);
        }
        async function setServerName(code: any, server: string, stderr: any): Promise<void> {
            if (!server) return;
            _serverName = server;
            _this.UserID = _UserID;
            _this.Pwd = _Pwd;
            _this.serverName = _serverName;
            _this.database = _database;
            _this.Path = _Path.replace("\r", "").replace("\n", "");
            _this.CreateServer();
            await _this.Server?.Start();
        }
    }
    private CreateServer(): void {
        this.Server = new Connect({
            WindowsSecurity: true,
            UserID: this.UserID,
            Password: this.Pwd,
            database: this.database,
            server: this.serverName,
            TrustServerCertificate: true
        }, this.Path);
    }
}
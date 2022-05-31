import sql from 'mssql';
import fs from 'fs';
import Path from 'path';

export default class Connect {
    private FilePathList: File = {};
    private readonly ServerConfig: Server;
    private readonly ConnectionString: string;
    private readonly ProcedurePath: string;
    private pool?: sql.ConnectionPool;
    private List: StoreProceedure[] = [];
    constructor(server: Server, ProcedurePath: string) {
        this.ServerConfig = server;
        this.ConnectionString = this.CreateConnectionString();
        this.ProcedurePath = ProcedurePath;
        this.setFilePathList(this.ProcedurePath);
        // console.log(this.FilePathList);
    }
    private CreateConnectionString(): string {
        let connectAry: string[] = [];
        connectAry.push(`Persist Security Info=False`);
        connectAry.push(`Integr Security=${this.ServerConfig.WindowsSecurity}`);
        connectAry.push(`database=${this.ServerConfig.database}`);
        connectAry.push(`server=${this.ServerConfig.server}`);
        connectAry.push(`TrustServerCertificate=${this.ServerConfig.TrustServerCertificate}`);
        connectAry.push(`User ID=${this.ServerConfig.UserID}`);
        connectAry.push(`Password=${this.ServerConfig.Password}`);
        return connectAry.join(`;`);
    }
    public async Start(): Promise<void> {
        let starttime: number = Date.now();
        if (!fs.existsSync(Path.join(this.ProcedurePath, "NewSP"))) fs.mkdirSync(Path.join(this.ProcedurePath, "NewSP"));
        await this.Connect();
        await this.StoreProcedureList();
        for await (let item of this.List) {
            await this.GetStoreProcedureContent(item);
            if (this.FilePathList[`${item.Name}.sql`] != undefined) {
                let temp: string = fs.readFileSync(Path.join(this.FilePathList[`${item.Name}.sql`], `${item.Name}.sql`), 'utf-8');
                if (temp != item.Content) fs.writeFileSync(Path.join(this.FilePathList[`${item.Name}.sql`], `${item.Name}.sql`), item.Content);
            } else {
                fs.writeFileSync(Path.join(this.ProcedurePath, "NewSP", `${item.Name}.sql`), item.Content);
            }
        }
        await this.Close();
        let endtime: number = Date.now();
        console.log(`Use time : ${endtime - starttime}`);
    }
    private setFilePathList(_path: string): void {
        let ary = fs.readdirSync(_path, { withFileTypes: true });
        let fileLi = ary.filter(i => !i.isDirectory() && /.*\.sql/.test(i.name));
        let folderLi = ary.filter(i => i.isDirectory());
        fileLi.forEach(i => {
            this.FilePathList[i.name] = _path;
        });
        folderLi.forEach(i => {
            this.setFilePathList(Path.join(_path, i.name));
        });
    }
    private async StoreProcedureList(): Promise<void> {
        let li = await this.pool?.query(`SELECT SPECIFIC_NAME FROM LM_DEV_II.INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_TYPE = 'PROCEDURE' AND ROUTINE_BODY = 'SQL'`);
        li?.recordset.forEach(i => {
            this.List.push({ Name: i.SPECIFIC_NAME, Content: `` });
        });
    }
    private async GetStoreProcedureContent(StoreProceedure: StoreProceedure): Promise<void> {
        let Result: string = ``;
        let content = await this.pool?.query(`sp_helptext '${StoreProceedure.Name}' ;`);
        content?.recordset.forEach(row => {
            Result += row.Text;
        });
        StoreProceedure.Content = Result;
    }
    private async Connect(): Promise<void> {
        this.pool = await sql.connect(this.ConnectionString);
    }
    private async Close(): Promise<void> {
        await this.pool?.close();
    }
}
export interface Server {
    WindowsSecurity: boolean;
    database: string;
    server: string;
    UserID: string;
    Password: string;
    TrustServerCertificate: boolean;
}
interface StoreProceedure {
    Name: string;
    Content: string;
}
interface FilePath {
    FileName: string;
    FilePath: string;
}
interface File {
    [key: string]: string;
}
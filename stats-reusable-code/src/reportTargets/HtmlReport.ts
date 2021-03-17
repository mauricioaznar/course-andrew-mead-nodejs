import fs from 'fs'
import {OutputTarget} from "../Summary";

export class HtmlReport implements OutputTarget {
    print(report: string): void {
        const html = `
         <h1>Analysis output</h1>
         <div>${report}</div>
        `
        fs.writeFileSync('report.html', html)
    }

}
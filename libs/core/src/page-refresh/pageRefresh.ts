import { CronJob } from 'cron';
import * as https from 'https';

class PageRefresh {
  private url!: string;
  constructor(url: string) {
    this.url = url;
  }

  performJob = new CronJob('*/14 * * * *', () => {
    https
      .get(this.url, (res) => {
        if (res.statusCode === 200) return console.log('Request successful');
        return console.log('request failed successful', res.statusCode);
      })
      .on('error', (err) => console.log('🔥 error occur 🔥', err));
  });
}

export default PageRefresh;

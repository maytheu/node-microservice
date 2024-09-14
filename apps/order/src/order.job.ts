import { CronJob } from 'cron';
import orderService from './order.service';

class JobService {
  performJob = new CronJob('*/10 * * * *', async () => {
    await orderService.cronCart();
  });
}

export default new JobService();

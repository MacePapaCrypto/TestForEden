
// importe dependencies
import JSON5 from 'json5';
import BaseModel from '../base/model';

// embed utility
class JobUtility {
  /**
   * feed utility
   *
   * @param post 
   */
  async queue(type, id, data) {
    // check exists first
    const existingJob = ((await BaseModel.query(`SELECT * FROM jobs WHERE id = ? AND type = ? LIMIT 1`, [id, type], false))?.rows || [])[0];

    // check existing job
    if (existingJob) return existingJob;

    // insert job
    const query = `INSERT INTO jobs (id, type, data, running_at, created_at) VALUES (?, ?, ?, ?, ?)`;

    // create data
    const params = [
      id,
      type,
      JSON5.stringify(data),
      new Date(0),
      new Date()
    ];

    // done
    return BaseModel.query(query, params, false);
  }

  /**
   * do job
   *
   * @param type 
   */
  async worker(type, fn, threads = 1, interval = 1000) {
    // create worker
    const doWork = async (thread) => {
      // let work
      let work;

      // do work
      try {
        // create lock
        const workLock = await global.backend.pubsub.lock(`work:${type}`);

        // lock
        try {
          // while find work
          work = await this.findWork(type);

          // if work
          if (!work) {
            // unlock
            workLock();

            // timkeout
            return setTimeout(() => doWork(thread), interval);
          }

          // check work
          console.log(`[thread ${thread}] doing work ${work.id}`);
          console.time(`[thread ${thread}] doing work ${work.id}`);

          // run work
          const query = `INSERT INTO jobs (id, type, data, running_at, created_at) VALUES (?, ?, ?, ?, ?)`;
          const params = [
            work.id,
            work.type,
            work.data,
            new Date(),
            work.created_at
          ];
          

          // update work
          await BaseModel.query(query, params, false);
        } catch (e) {}

        // end work lock
        workLock();

        // do work
        if (await fn(JSON5.parse(work.data), new Date(work.created_at))) {
          // delete work
          await BaseModel.query('DELETE FROM jobs WHERE type = ? AND id = ?', [work.type, work.id], false);
        }
      } catch (e) {}

      // remove from doing
      if (work) {
        // delete and end
        console.timeEnd(`[thread ${thread}] doing work ${work.id}`);
      }

      // do work
      doWork(thread);
    };

    // loop limit
    for (let i = 0; i < threads; i++) {
      // create worker
      doWork(i);
    }
  }

  /**
   * find job
   *
   * @param type 
   */
  async findWork(type) {
    // since date
    const sinceDate = new Date(new Date().getTime() - (5 * 60 * 1000));

    // load jobs
    const possibleJobs = await BaseModel.query(`SELECT * FROM jobs WHERE type = ? AND running_at < ? LIMIT 1 ALLOW FILTERING`, [type, sinceDate], false);

    // return done
    return possibleJobs.rows[0];
  }
}

// export defualt
export default new JobUtility();
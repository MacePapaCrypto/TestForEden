
// importe dependencies
import JSON5 from 'json5';
import BaseModel from '../base/model';

// embed utility
class JobUtility {
  // doing
  private __doing = new Set();

  /**
   * feed utility
   *
   * @param post 
   */
  async queue(type, id, data, force = true) {
    // insert job
    const query = `INSERT INTO jobs (id, type, data, running_at, created_at) VALUES (?, ?, ?, ?, ?)`;

    // create data
    const params = [
      id,
      type,
      JSON5.stringify(data),
      null,
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
    const doWork = async () => {
      // while find work
      const work = await this.findWork(type);

      // if work
      if (!work) return setTimeout(doWork, interval);

      // add to doing
      this.__doing.add(`${type}:${work.id}`);

      // do work
      try {
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

        // do work
        if (await fn(JSON5.parse(work.data), new Date(work.created_at))) {
          // delete work
          await BaseModel.query('DELETE FROM jobs WHERE type = ? AND id = ?', [work.type, work.id], false);
        }
      } catch (e) {}

      // remove from doing
      this.__doing.delete(`${type}:${work.id}`);

      // do work
      doWork();
    };

    // loop limit
    for (let i = 0; i < threads; i++) {
      // create worker
      doWork();
    }
  }

  /**
   * find job
   *
   * @param type 
   */
  async findWork(type) {
    // load jobs
    const possibleJobs = await BaseModel.query(`SELECT * FROM nftsocial.jobs WHERE type = ? LIMIT 250 ALLOW FILTERING`, [type], false);

    // rows
    const possibleRows = possibleJobs.rows.filter((r) => {
      // check already doing
      if (this.__doing.has(`${type}:${r.id}`)) return false;

      // check recent
      if (r.running_at && new Date(r.running_at).getTime() > (new Date().getTime() - (30 * 60 * 1000))) return false;

      // return true
      return true;
    });

    // return done
    return possibleRows[0];
  }
}

// export defualt
export default new JobUtility();
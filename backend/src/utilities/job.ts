
// importe dependencies
import JSON5 from 'json5';
import redis from 'redis';
import Queue from 'bee-queue';
import config from '../config';
import Measured from 'measured-core';
import BaseModel from '../base/model';
import ProgressBar from 'cli-progress';

// embed utility
class JobUtility {
  // polls
  private __bars = new Map();
  private __bees = new Map();
  private __counts = new Map();
  private __meters = new Map();
  private __schedules = new Map();

  /**
   * create bee queue
   *
   * @param type 
   */
  async bee(type) {
    // check type
    if (this.__bees.has(type)) return this.__bees.get(type);

    // create queue
    this.__bees.set(type, new Queue(type, {
      redis : redis.createClient(config.get('redis')),

      removeOnSuccess : true,
    }));

    // return queue
    return this.__bees.get(type);
  }

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
    const query = `INSERT INTO jobs (id, type, data, attempts, running_at, created_at) VALUES (?, ?, ?, ?, ?, ?)`;

    // create data
    const params = [
      id,
      type,
      JSON5.stringify(data),
      0,
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
  async worker(type, fn, concurrency = 50) {
    // get queue
    const queue = await this.bee(type);

    // meter
    const meter = new Measured.Meter();

    // check bar
    const progressBar = new ProgressBar.SingleBar({
      format : `${type} || {value} Complete || {speed}/s`,
    }, ProgressBar.Presets.shades_classic);

    // start
    progressBar.start(9999999999999, 0, {
      speed : meter.currentRate(),
    });

    // progress total
    let progressTotal = 0;

    // add process
    queue.process(concurrency, async (job) => {
      // get work
      const work = job.data;
      
      // add to total
      progressTotal = (progressTotal + 1);

      // add
      meter.mark();
      progressBar.update(progressTotal, {
        speed : meter.toJSON()['1MinuteRate'],
      });

      // update job
      const bg = (() => {
        // backgorund query
        const query = `INSERT INTO jobs (id, type, data, attempts, running_at, created_at) VALUES (?, ?, ?, ?, ?, ?)`;
        const params = [
          work.id,
          work.type,
          work.data,
          (work.attempts || 0) + 1,
          new Date(),
          new Date(work.created_at)
        ];

        // update work
        return BaseModel.query(query, params, false);
      })();

      // do work
      try {
        // result
        const result = await fn(JSON5.parse(work.data), new Date(work.created_at));

        // work done
        if (result) {
          // await bg
          await bg;

          // delete work
          await BaseModel.query('DELETE FROM jobs WHERE type = ? AND id = ?', [work.type, work.id], false);
        }
      } catch (e) {}

      // await bg
      await bg;

      // return done
      return true;
    });
  }

  /**
   * find job
   *
   * @param type 
   */
  async schedule(type, limit = 50, timeout = 1000) {
    // get meter
    if (!this.__meters.has(type)) this.__meters.set(type, new Measured.Meter());

    // set bar
    if (!this.__bars.has(type)) {
      // create bar
      this.__bars.set(type, new ProgressBar.SingleBar({
        format : `${type} || {value} Scheduled || {speed}/s || {queued} queued`,
      }, ProgressBar.Presets.shades_classic));

      // start
      this.__bars.get(type).start(9999999999999, 0, {
        speed : this.__meters.get(type).currentRate(),
      });
    }

    // last id
    let lastId = null;

    // check count
    if (!this.__counts.has(type)) this.__counts.set(type, 0);

    // get bar
    const bar = this.__bars.get(type);
    const meter = this.__meters.get(type);

    // try/catch
    try {
      // get queue
      const queue = await this.bee(type);

      // get counts
      const counts = await queue.checkHealth();

      // total in queue
      const totalInQueue = counts.waiting + counts.active;

      // ensure queue never double limit always
      if ((limit * 2) <= totalInQueue) {
        // timeout and again
        this.__schedules.set(type, setTimeout(() => this.schedule(type, limit, timeout), timeout));

        // return
        return;
      }

      // since date
      const sinceDate = new Date(new Date().getTime() - (5 * 60 * 1000));
      const futureDate = new Date(new Date().getTime() + (30 * 24 * 60 * 60 * 1000));

      // load jobs
      const possibleJobs = await BaseModel.query(`SELECT * FROM jobs WHERE type = ? AND running_at < ?${lastId ? ` AND id > ?` : ''} LIMIT ${limit} ALLOW FILTERING`, [type, sinceDate, ...(lastId ? [lastId] : [])], false);

      // add to queues
      await Promise.all(possibleJobs.rows.map(async (possibleJob) => {
        // last id
        // lastId = possibleJob.id;

        // get job
        const actualJob = await queue.getJob(possibleJob.id);
        
        // job exists
        if (actualJob) return;

        // check job
        if (possibleJob && (possibleJob.attempts || 0) > 2) {
          // insert job
          const query = `INSERT INTO jobs (id, type, data, attempts, running_at, created_at) VALUES (?, ?, ?, ?, ?, ?)`;
    
          // create data
          const params = [
            possibleJob.id,
            possibleJob.type,
            possibleJob.data,
            possibleJob.attempts,
            futureDate,
            possibleJob.created_at
          ];
    
          // query
          await BaseModel.query(query, params, false);
        } else {
          // set count
          this.__counts.set(type, this.__counts.get(type) + 1);
    
          // add
          meter.mark();

          // update
          bar.update(this.__counts.get(type), {
            speed  : meter.toJSON()['1MinuteRate'],
            queued : totalInQueue,
          });
          
          // queue job
          queue.createJob(possibleJob).timeout(30 * 1000).retries(3).setId(possibleJob.id).save();
        }
      }));
    } catch (e) {}

    // timeout and again
    this.__schedules.set(type, setTimeout(() => this.schedule(type, limit, timeout), timeout));
  }
}

// export defualt
export default new JobUtility();
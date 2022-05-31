
// importe dependencies
import JSON5 from 'json5';
import redis from 'redis';
import Queue from 'bee-queue';
import config from '../config';
import Measured from 'measured-core';
import JobModel from '../models/job';
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
    const existingJob = await JobModel.collection.where({
      type,
      id,
    }).findOne();

    // check existing job
    if (existingJob) return existingJob;

    // insert job
    const newJob = new JobModel({
      id,
      type,
      
      data      : JSON5.stringify(data),
      attempts  : 0,
      runningAt : null,
      createdAt : new Date(),
    });
    
    // save job
    await newJob.save(true, true);
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
        // collection
        return JobModel.collection.where({
          id : work.id,
        }).update({
          attempts  : (work.attempts || 0) + 1,
          runningAt : new Date(),
        });
      })();

      // do work
      try {
        // result
        const result = await fn(JSON5.parse(work.data), new Date(work.created_at));

        // work done
        if (result) {
          // await bg
          await bg;

          // collection
          await JobModel.collection.where({
            id : work.id,
          }).remove();
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
        queued : 0,
      });
    }

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

      // get jobs
      const possibleJobs = await JobModel.collection.where({
        type,

        attempts : {
          $lte : 5,
        },
      }).or([
        {
          runningAt : {
            $lte : sinceDate,
          }
        },
        {  
          runningAt : null,
        }
      ]).limit(limit).find();

      // add to queues
      await Promise.all(possibleJobs.map(async (possibleJob) => {
        // get job
        const actualJob = await queue.getJob(possibleJob.id);
        
        // job exists
        if (actualJob) return;

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
      }));
    } catch (e) {}

    // timeout and again
    this.__schedules.set(type, setTimeout(() => this.schedule(type, limit, timeout), timeout));
  }
}

// export defualt
export default new JobUtility();
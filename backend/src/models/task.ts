
import Model, { Type } from '../base/model';
import AppModel from './app';

/**
 * export model
 */
@Type('task')
export default class TaskModel extends Model {

  /**
   * get app
   *
   * @returns 
   */
  getApp() {
    // load app
    return AppModel.findById(this.get('app'));
  }

  /**
   * find by segment
   *
   * @param segment
   * @param args
   *
   * @returns 
   */
  static findByDesktop(desktop, ...args) {
    // find by ref
    return TaskModel.findByRef(`desktop:${desktop}`, ...args);
  }

  /**
   * sanitise
   *
   * @param cache 
   */
  async toJSON() {
    // sanitised
    const sanitised = await super.toJSON();

    // load app
    const app = await this.getApp();

    // set app
    sanitised.application = app ? await app.toJSON() : null;
    
    // return sanitised
    return sanitised;
  }

}
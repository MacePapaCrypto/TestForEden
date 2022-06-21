
import Model, { Type } from '../base/model';
import apps from '../apps';

/**
 * export model
 */
@Type('task')
export default class TaskModel extends Model {

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
  async toJSON(cache = {}, req) {
    // sanitised
    const sanitised = await super.toJSON();

    // check type
    const actualApp = Object.values(apps).find((app) => {
      // Load namespace and subspace
      const type = Reflect.getMetadata('app:type', app.constructor);

      // check type
      if (type === this.get('type')) return true;
    });
    
    // check actual app
    if (!actualApp) return sanitised;

    // return actual data
    return await actualApp.toJSON(sanitised, this.get('path'), cache, req);
  }

}
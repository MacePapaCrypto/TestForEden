
import Model, { Type } from '../base/model';

/**
 * export model
 */
@Type('taskGroup')
export default class TaskGroupModel extends Model {
  
  /**
   * find contexts by account
   *
   * @param account 
   */
  static findByDesktop(desktop, ...args) {
    // find by ref
    return TaskGroupModel.findByRef(`desktop:${desktop}`, ...args);
  }
}
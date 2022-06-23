
import Model, { Type } from '../base/model';
import AppModel from './app';

/**
 * export model
 */
@Type('appInstall')
export default class AppInstallModel extends Model {
  
  /**
   * get app
   *
   * @returns 
   */
  getApp() {
    // get app
    return AppModel.findById(this.get('app'));
  }

  /**
   * find by app version
   *
   * @param appId 
   * @param version 
   * @returns 
   */
  static findByAccount(accountId, ...args) {
    // find by ref
    return AppInstallModel.findByRef(`account:${accountId}`, ...args);
  }
}